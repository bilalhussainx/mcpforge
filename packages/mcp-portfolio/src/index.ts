import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createPortfolioServer } from './server.js';

const PORT = parseInt(process.env['PORT'] ?? '3002', 10);

const app = express();
app.use(express.json());

// ─── MCP Endpoint (Stateless Streamable HTTP) ─────────────────────
app.post('/mcp', async (req, res) => {
  const server = createPortfolioServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless mode
  });

  res.on('close', () => {
    transport.close();
    server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

// Handle GET and DELETE for SSE/session management per MCP spec
app.get('/mcp', (_req, res) => {
  res.writeHead(405).end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
});

app.delete('/mcp', (_req, res) => {
  res.writeHead(405).end(JSON.stringify({ error: 'Method not allowed.' }));
});

// ─── Health Check ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', server: 'mcp-portfolio', version: '1.0.0' });
});

// ─── Start Server ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`mcp-portfolio server running on http://localhost:${PORT}`);
  console.log(`  MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
});
