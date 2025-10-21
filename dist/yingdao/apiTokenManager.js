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
            return;
        }
        const plat = platform();
        if (plat === 'darwin') {
            this.logDir = path.join(homedir(), 'Library', 'Application Support', 'Shadowbot', 'log');
        }
        else if (plat === 'win32') {
            const appData = process.env.APPDATA || path.join(homedir(), 'AppData', 'Roaming');
            this.logDir = path.join(appData, 'Shadowbot', 'log');
        }
        else {
            this.logDir = '';
        }
    }
    formatDateFileName(d) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}${mm}${dd}.main.log`;
    }
    findLatestLogFile() {
        if (!this.logDir || !existsSync(this.logDir)) {
            return null;
        }
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}${mm}${dd}`;
        const todayMain = path.join(this.logDir, `${dateStr}.main.log`);
        if (existsSync(todayMain))
            return todayMain;
        const todaySimple = path.join(this.logDir, `${dateStr}.log`);
        if (existsSync(todaySimple))
            return todaySimple;
        // 兜底：按文件名日期倒序选择最新的 *.main.log 或 *.log（YYYYMMDD）
        const files = readdirSync(this.logDir)
            .filter(f => /^\d{8}(\.main)?\.log$/.test(f));
        if (files.length === 0) {
            return null;
        }
        files.sort((a, b) => {
            const da = a.slice(0, 8);
            const db = b.slice(0, 8);
            const cmp = db.localeCompare(da);
            if (cmp !== 0)
                return cmp;
            const aw = a.endsWith('.main.log') ? 0 : 1;
            const bw = b.endsWith('.main.log') ? 0 : 1;
            return aw - bw; // 同一日期优先 .main.log
        });
        return path.join(this.logDir, files[0]);
    }
    async readTokenFromFile(filePath) {
        return new Promise((resolve, reject) => {
            const input = createReadStream(filePath, { encoding: 'utf8' });
            input.on('error', reject);
            const rl = readline.createInterface({ input, crlfDelay: Infinity });
            let lastToken = null;
            const patterns = [
                /current token:\s*\[([0-9a-fA-F-]{36})\]/i,
                /\btoken:\s*\[?([0-9a-fA-F-]{36})\]?/i,
                /\btoken:\s*([^\s,\]]+)/i,
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
            throw new Error(`Shadowbot 日志文件未找到：${this.logDir || '(未设置目录)'}`);
        }
        const token = await this.readTokenFromFile(latestFile);
        if (!token) {
            throw new Error('未在 Shadowbot 日志中找到 token（请确认当前日志是否包含 current token 字样）');
        }
        return token;
    }
}
