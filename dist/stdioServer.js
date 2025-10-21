import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { BaseServer } from "./baseServer.js";
export class StdioServer extends BaseServer {
    constructor() {
        super();
    }
    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}
