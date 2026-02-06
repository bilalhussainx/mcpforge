import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createResumeServer } from './server.js';

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);

const app = express();

// Support large payloads for base64-encoded PDFs
app.use(express.json({ limit: '50mb' }));

// ────────────────────────────────────────────────────────
// POST /mcp — Main MCP endpoint (Streamable HTTP)
// ────────────────────────────────────────────────────────
app.post('/mcp', async (req, res) => {
  const server = createResumeServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  res.on('close', () => {
    transport.close();
    server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

// ────────────────────────────────────────────────────────
// GET /mcp — Method not allowed
// ────────────────────────────────────────────────────────
app.get('/mcp', (_req, res) => {
  res.status(405).json({
    error: 'Method Not Allowed',
    message: 'This endpoint only accepts POST requests for MCP Streamable HTTP transport.',
    allowedMethods: ['POST'],
  });
});

// ────────────────────────────────────────────────────────
// DELETE /mcp — Method not allowed
// ────────────────────────────────────────────────────────
app.delete('/mcp', (_req, res) => {
  res.status(405).json({
    error: 'Method Not Allowed',
    message: 'This endpoint only accepts POST requests for MCP Streamable HTTP transport.',
    allowedMethods: ['POST'],
  });
});

// ────────────────────────────────────────────────────────
// GET /health — Health check
// ────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    server: 'mcp-resume',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    tools: [
      'parse_resume',
      'extract_keywords',
      'optimize_for_job',
      'generate_ats_resume',
      'score_ats',
    ],
  });
});

// ────────────────────────────────────────────────────────
// Start the server
// ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[mcp-resume] ATS Resume Optimizer server running on http://localhost:${PORT}`);
  console.log(`[mcp-resume] MCP endpoint: POST http://localhost:${PORT}/mcp`);
  console.log(`[mcp-resume] Health check: GET  http://localhost:${PORT}/health`);
  console.log(`[mcp-resume] Tools: parse_resume, extract_keywords, optimize_for_job, generate_ats_resume, score_ats`);
});
