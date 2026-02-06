import { NextResponse } from 'next/server';

interface ServerHealth {
  name: string;
  url: string;
  healthy: boolean;
  error?: string;
}

const servers = [
  {
    name: 'mcp-resume',
    url: process.env.MCP_RESUME_URL || 'http://localhost:3001',
  },
  {
    name: 'mcp-portfolio',
    url: process.env.MCP_PORTFOLIO_URL || 'http://localhost:3002',
  },
  {
    name: 'mcp-github-insights',
    url: process.env.MCP_GITHUB_URL || 'http://localhost:3003',
  },
];

export async function GET() {
  const healthChecks: ServerHealth[] = await Promise.all(
    servers.map(async (server) => {
      try {
        const baseUrl = new URL(server.url).origin;
        const healthUrl = `${baseUrl}/health`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(healthUrl, {
          signal: controller.signal,
          method: 'GET',
        });
        clearTimeout(timeoutId);

        return {
          name: server.name,
          url: server.url,
          healthy: response.ok,
        };
      } catch (error) {
        return {
          name: server.name,
          url: server.url,
          healthy: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    })
  );

  return NextResponse.json({
    servers: healthChecks,
    timestamp: new Date().toISOString(),
  });
}
