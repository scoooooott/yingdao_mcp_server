import { homedir, platform } from 'os';
import path from 'path';
import { createReadStream, existsSync, readdirSync } from 'fs';
import readline from 'readline';
/**
 * ApiTokenManager
 * - 从 Shadowbot 每日轮换的日志文件中提取 token。
 * - 默认日志目录：macOS 上为 ~/Library/Application Support/Shadowbot/log。
 * - 文件命名格式：YYYYMMDD.main.log，例如 20251017.main.log。
 */
export class ApiTokenManager {
    logDir;
    constructor(logDir) {
        if (logDir) {
            this.logDir = logDir;
        }
        else {
            if (platform() === 'darwin') {
                this.logDir = path.join(homedir(), 'Library', 'Application Support', 'Shadowbot', 'log');
            }
            else if (platform() === 'win32') {
                // Windows 默认日志路径: %USERPROFILE%\AppData\Local\Shadowbot\log
                this.logDir = path.join(homedir(), 'AppData', 'Local', 'Shadowbot', 'log');
            }
            else {
                this.logDir = "";
            }
        }
    }
    formatDateFileName(d) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        // Windows 使用 YYYYMMDD.log，macOS 使用 YYYYMMDD.main.log
        return platform() === 'win32' ? `${yyyy}${mm}${dd}.log` : `${yyyy}${mm}${dd}.main.log`;
    }
    findLatestLogFile() {
        if (!this.logDir || !existsSync(this.logDir)) {
            return null;
        }
        const todayFile = path.join(this.logDir, this.formatDateFileName(new Date()));
        if (existsSync(todayFile))
            return todayFile;
        // 兜底：按文件名中日期倒序选择最新的日志文件
        // Windows: YYYYMMDD.log, macOS: YYYYMMDD.main.log
        const filePattern = platform() === 'win32' ? /^\d{8}\.log$/ : /^\d{8}\.main\.log$/;
        const files = readdirSync(this.logDir)
            .filter(f => filePattern.test(f));
        if (files.length === 0) {
            return null;
        }
        files.sort((a, b) => b.localeCompare(a)); // YYYYMMDD 词典序倒序即最新在前
        return path.join(this.logDir, files[0]);
    }
    async readTokenFromFile(filePath) {
        return new Promise((resolve, reject) => {
            const input = createReadStream(filePath, { encoding: 'utf8' });
            input.on('error', reject);
            const rl = readline.createInterface({ input, crlfDelay: Infinity });
            let lastToken = null;
            const patterns = [
                // 精确匹配UUID格式的token（如：57072a1e-c1a1-479d-b579-c5b7431ff35d）
                /\btoken:\s*\[?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})]?\b/,
                /\btoken:\s*\[?([0-9a-fA-F-]{36})]?\b/, // UUID-like token
                /\btoken:\s*\[?(\S+)]?\b/, // 通用备用匹配
            ];
            rl.on('line', (line) => {
                for (const re of patterns) {
                    const m = line.match(re);
                    if (m && m[1]) {
                        lastToken = m[1];
                        break;
                    }
                }
            });
            rl.on('close', () => resolve(lastToken));
        });
    }
    async getToken() {
        const latestFile = this.findLatestLogFile();
        if (!latestFile) {
            throw new Error('Shadowbot 日志文件未找到');
        }
        const token = await this.readTokenFromFile(latestFile);
        if (!token) {
            throw new Error('未在 Shadowbot 日志中找到 token');
        }
        return token;
    }
}
