import axios from 'axios';
export class TokenManager {
    token = null;
    tokenExpireTime = 0;
    client;
    baseURL = 'https://api.yingdao.com';
    accessKeyId;
    accessKeySecret;
    constructor(accessKeyId, accessKeySecret) {
        this.accessKeyId = accessKeyId;
        this.accessKeySecret = accessKeySecret;
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
        });
    }
    isTokenExpired() {
        return Date.now() >= this.tokenExpireTime;
    }
    async getToken() {
        if (this.token && !this.isTokenExpired()) {
            return this.token;
        }
        try {
            const response = await this.client.get('/oapi/token/v2/token/create', {
                params: {
                    accessKeyId: this.accessKeyId,
                    accessKeySecret: this.accessKeySecret,
                },
            });
            if (!response.data.success || response.data.code !== 200) {
                throw new Error('Failed to get token');
            }
            this.token = response.data.data.accessToken;
            // Convert expiresIn from seconds to milliseconds and subtract 5 minutes as buffer
            this.tokenExpireTime = Date.now() + (response.data.data.expiresIn * 1000) - 300000;
            return this.token;
        }
        catch (error) {
            throw new Error(`Failed to get token: ${error.message}`);
        }
    }
}
