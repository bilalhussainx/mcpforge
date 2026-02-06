import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { ProtocolLogger } from './protocol-logger';
import type { MCPServerStatus } from '@/types/mcp';

interface ServerConfig {
  name: string;
  url: string;
}

interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

interface ClaudeTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export class MCPBridge {
  private clients: Map<string, Client> = new Map();
  private transports: Map<string, StreamableHTTPClientTransport> = new Map();
  private serverTools: Map<string, MCPTool[]> = new Map();
  private serverConfigs: ServerConfig[];
  public logger: ProtocolLogger;

  constructor() {
    this.logger = new ProtocolLogger();
    this.serverConfigs = [
      {
        name: 'mcp-resume',
        url: process.env.MCP_RESUME_URL || 'http://localhost:3001/mcp',
      },
      {
        name: 'mcp-portfolio',
        url: process.env.MCP_PORTFOLIO_URL || 'http://localhost:3002/mcp',
      },
      {
        name: 'mcp-github-insights',
        url: process.env.MCP_GITHUB_URL || 'http://localhost:3003/mcp',
      },
    ];
  }

  async connect(): Promise<void> {
    const connectPromises = this.serverConfigs.map(async (config) => {
      try {
        this.logger.log('connection', config.name, `Connecting to ${config.name} at ${config.url}...`);

        const transport = new StreamableHTTPClientTransport(new URL(config.url));
        const client = new Client({
          name: 'mcpforge-demo',
          version: '1.0.0',
        });

        await client.connect(transport);
        this.clients.set(config.name, client);
        this.transports.set(config.name, transport);

        this.logger.log('connection', config.name, `Connected to ${config.name}`);

        // Discover tools
        const toolsResult = await client.listTools();
        const tools = (toolsResult.tools || []) as MCPTool[];
        this.serverTools.set(config.name, tools);

        this.logger.log(
          'info',
          config.name,
          `Discovered ${tools.length} tools: ${tools.map((t) => t.name).join(', ')}`,
          { tools: tools.map((t) => ({ name: t.name, description: t.description })) }
        );
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        this.logger.log('error', config.name, `Failed to connect: ${errMsg}`);
      }
    });

    await Promise.allSettled(connectPromises);
  }

  async disconnect(): Promise<void> {
    for (const [name, transport] of this.transports) {
      try {
        await transport.close();
        this.logger.log('connection', name, `Disconnected from ${name}`);
      } catch {
        // Ignore disconnect errors
      }
    }
    this.clients.clear();
    this.transports.clear();
    this.serverTools.clear();
  }

  getClaudeTools(): ClaudeTool[] {
    const tools: ClaudeTool[] = [];

    for (const [serverName, serverTools] of this.serverTools) {
      for (const tool of serverTools) {
        const namespacedName = `${serverName}__${tool.name}`;
        tools.push({
          name: namespacedName,
          description: `[${serverName}] ${tool.description || tool.name}`,
          input_schema: (tool.inputSchema as Record<string, unknown>) || {
            type: 'object',
            properties: {},
          },
        });
      }
    }

    return tools;
  }

  parseToolName(namespacedName: string): { server: string; tool: string } | null {
    const parts = namespacedName.split('__');
    if (parts.length < 2) return null;
    const server = parts[0];
    const tool = parts.slice(1).join('__');
    return { server, tool };
  }

  async callTool(
    namespacedName: string,
    args: Record<string, unknown>
  ): Promise<{ result: string; duration: number }> {
    const parsed = this.parseToolName(namespacedName);
    if (!parsed) {
      throw new Error(`Invalid tool name: ${namespacedName}`);
    }

    const client = this.clients.get(parsed.server);
    if (!client) {
      throw new Error(`Server not connected: ${parsed.server}`);
    }

    const startTime = Date.now();
    this.logger.log('tool_call', parsed.server, `Calling ${parsed.tool}`, {
      tool: parsed.tool,
      arguments: args,
    });

    try {
      const response = await client.callTool({
        name: parsed.tool,
        arguments: args,
      });

      const duration = Date.now() - startTime;

      let resultText = '';
      if (response.content && Array.isArray(response.content)) {
        resultText = response.content
          .map((c: { type: string; text?: string }) => {
            if (c.type === 'text') return c.text || '';
            return JSON.stringify(c);
          })
          .join('\n');
      } else {
        resultText = JSON.stringify(response);
      }

      this.logger.log('tool_result', parsed.server, `Result from ${parsed.tool}`, {
        tool: parsed.tool,
        result: resultText.substring(0, 500),
      }, duration);

      return { result: resultText, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.log('error', parsed.server, `Tool error: ${parsed.tool} - ${errMsg}`, {
        tool: parsed.tool,
        error: errMsg,
      }, duration);
      throw error;
    }
  }

  getServerStatuses(): MCPServerStatus[] {
    return this.serverConfigs.map((config) => {
      const tools = this.serverTools.get(config.name) || [];
      return {
        name: config.name,
        connected: this.clients.has(config.name),
        toolCount: tools.length,
        tools: tools.map((t) => t.name),
      };
    });
  }
}
