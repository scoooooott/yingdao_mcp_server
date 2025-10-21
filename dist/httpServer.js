import express from 'express';
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { BaseServer } from './baseServer.js';
export class HttpServer extends BaseServer {
    app;
    port;
    transports = {};
    constructor() {
        super();
        this.app = express();
        this.port = Number(process.env.SERVER_PORT) || 3000;
    }
    async start() {
        // Configure Express routes
        this.app.use(express.json());
        // Mount the MCP server on the Express app
        this.app.post('/messages', async (req, res) => {
            const sessionId = req.query.sessionId;
            if (!this.transports[sessionId]) {
                res.status(400).send(`No transport found for sessionId ${sessionId}`);
                return;
            }
            console.log(`Received message for sessionId ${sessionId}`, req.body, req.method, req.url);
            await this.transports[sessionId].handlePostMessage(req, res, req.body);
        });
        this.app.get('/sse', async (req, res) => {
            console.log(`Received`, req.body, req.method, req.url);
            // Set up the SSE transport for the MCP server
            const transport = new SSEServerTransport("/messages", res);
            this.transports[transport.sessionId] = transport;
            res.on("close", () => {
                delete this.transports[transport.sessionId];
            });
            await this.server.connect(transport);
        });
        // Start the HTTP server
        this.app.listen(this.port, () => {
            console.log(`RPA HTTP Server listening on port ${this.port}`);
            console.log(`SSE endpoint available at http://localhost:${this.port}/sse`);
            console.log(`Message endpoint available at http://localhost:${this.port}/messages`);
        });
    }
}
