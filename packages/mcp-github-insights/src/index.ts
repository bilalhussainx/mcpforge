import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createGitHubInsightsServer } from './server.js';

const app = express();
app.use(express.json());

// ── POST /mcp — Streamable HTTP (stateless) ────────────────────────────────

app.post('/mcp', async (req, res) => {
  try {
    const server = createGitHubInsightsServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on('close', () => {
      transport.close();
      server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

// ── GET /mcp — 405 (SSE not supported in stateless mode) ───────────────────

app.get('/mcp', (_req, res) => {
  res.status(405).json({
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: 'Method Not Allowed. Use POST for MCP requests.',
    },
    id: null,
  });
});

// ── DELETE /mcp — 405 (no sessions in stateless mode) ───────────────────────

app.delete('/mcp', (_req, res) => {
  res.status(405).json({
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: 'Method Not Allowed. Stateless server does not support session termination.',
    },
    id: null,
  });
});

// ── Health check ────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    server: 'mcp-github-insights',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── Start ───────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env['PORT'] ?? '3003', 10);

app.listen(PORT, () => {
  console.log(`mcp-github-insights server running on http://localhost:${PORT}`);
  console.log(`  MCP endpoint: POST http://localhost:${PORT}/mcp`);
  console.log(`  Health check: GET  http://localhost:${PORT}/health`);
  console.log(
    process.env['GITHUB_TOKEN'] || process.env['GH_TOKEN']
      ? '  GitHub auth:  authenticated (token detected)'
      : '  GitHub auth:  unauthenticated (set GITHUB_TOKEN for higher rate limits)',
  );
});
