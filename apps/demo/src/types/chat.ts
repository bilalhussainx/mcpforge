import type { ProtocolLogEntry } from './mcp';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCallInfo[];
  timestamp: string;
}

export interface ToolCallInfo {
  id: string;
  tool: string;
  server: string;
  input: unknown;
  result?: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  duration?: number;
}

export interface StreamEvent {
  type: 'text' | 'tool_call' | 'tool_result' | 'protocol_log' | 'error' | 'servers';
  text?: string;
  tool?: string;
  server?: string;
  toolCallId?: string;
  input?: unknown;
  result?: string;
  log?: ProtocolLogEntry[];
  error?: string;
  servers?: import('./mcp').MCPServerStatus[];
}
