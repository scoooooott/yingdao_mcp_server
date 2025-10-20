import axios, {AxiosInstance} from 'axios';
import {platform} from 'os';
import path from 'path';
import {spawn} from 'child_process';

import {ApiTokenManager} from './apiTokenManager.js';

export class LocalService {
    logPath: string;
    appsPath: string;
    private readonly client: AxiosInstance;
    private readonly tokenManager: ApiTokenManager;

    constructor(private shadowbotPath: string, private readonly userFolder: string) {
        if (platform() === 'darwin') {
            this.shadowbotPath = path.join(this.shadowbotPath, 'Contents/MacOS/影刀');
        }
        this.appsPath = path.join(this.userFolder, 'apps');

        // 设置logFolder
        const shadowbotRoot = path.dirname(path.dirname(this.userFolder));
        this.logPath = path.join(shadowbotRoot, 'log');

        this.tokenManager = new ApiTokenManager(this.logPath);
        this.client = axios.create({
            baseURL: 'https://api.winrobot360.com/api/client',
            timeout: 15000,
            proxy: false,
        });

        // Attach bearer token from Shadowbot logs for client APIs
        this.client.interceptors.request.use(async (config) => {
            const token = await this.tokenManager.getToken();
            config.headers.Authorization = `Bearer ${token}`;
            return config;
        });
    }

    async queryAppList(params: {
        appId?: string;
        size?: number;
        page?: number;
        ownerUserSearchKey?: string;
        appName?: string;
    }): Promise<AppListResponse> {
        try {
            const response = await this.client.post(
                '/app/guest/allAuthority/list',
                {
                    name: params?.appName ?? '',
                    // Try passing additional filters if supported by backend; harmless if ignored
                    ...(params?.ownerUserSearchKey ? {ownerUserSearchKey: params.ownerUserSearchKey} : {}),
                    ...(params?.appId ? {appId: params.appId} : {}),
                    pageDTO: {
                        page: params?.page ?? 1,
                        size: params?.size ?? 30,
                    },
                }
            );
            return response.data.code === 200 ? response.data.data : response.data.msg;
        } catch (error: any) {
            throw new Error(`Failed to fetch app list: ${error.message}`);
        }
    }

    async queryRobotParam(robotUuid: string): Promise<RobotParamResponse> {
        try {
            const resp = await this.client.get(
                '/app/develop/app/detail',
                {params: {checkAppRecycle: true, appId: robotUuid}}
            );

            const code = resp?.data?.code ?? 200;
            const success = resp?.data?.success ?? (resp?.status === 200);
            const msg = resp?.data?.msg ?? '';

            const dataNode = resp?.data?.data ?? resp?.data;
            const flowParamInfo = dataNode?.flowParamInfo;

            let inputParams: RobotParamResponse['data']['inputParams'] = [];
            let outputParams: RobotParamResponse['data']['outputParams'] = [];

            if (typeof flowParamInfo === 'string' && flowParamInfo.length > 0) {
                const arr = JSON.parse(flowParamInfo);
                inputParams = (Array.isArray(arr) ? arr : [])
                    .filter((p: any) => /in/i.test(p.direction ?? 'In'))
                    .map((x: any) => ({
                        name: x.name,
                        direction: 'In',
                        type: x.type,
                        value: String(x.value ?? ''),
                        description: x.description ?? '',
                        kind: x.kind ?? '',
                    }));
                outputParams = (Array.isArray(arr) ? arr : [])
                    .filter((p: any) => /out/i.test(p.direction ?? ''))
                    .map((x: any) => ({
                        name: x.name,
                        direction: 'Out',
                        type: x.type,
                        value: String(x.value ?? ''),
                        description: x.description ?? '',
                        kind: x.kind ?? '',
                    }));
            }

            return {
                code,
                success,
                msg,
                data: {inputParams, outputParams},
            };
        } catch (err: any) {
            const status = err?.response?.status;
            const data = err?.response?.data;
            console.error('Error fetching robot params via flowParamInfo:', status, data, err);
            return {
                code: data?.code ?? status ?? 500,
                success: false,
                msg: data?.msg ?? err?.message ?? 'Failed to fetch app detail',
                data: {inputParams: [], outputParams: []},
            };
        }
    }

    async executeRpaApp(appUuid: string, appParams: any) {
        try {
            const response = await this.client.post(
                '/run/runningDetailByAppId', {appId: appUuid, env: "online"}
            );
            if (response.data.success !== true) {
                throw new Error(response.data.msg);
            }
            const urlParams = {'robot-uuid': appUuid, ...appParams}
            const queryParams = new URLSearchParams(urlParams as any).toString();
            const argv = `shadowbot:Run?${queryParams}`;
            console.log('Executing app:', this.shadowbotPath, argv);
            spawn(this.shadowbotPath, [argv]);
            return 'success';
        } catch (error: any) {
            throw new Error(`Failed to execute app: ${error.message}`);
        }
    }
}