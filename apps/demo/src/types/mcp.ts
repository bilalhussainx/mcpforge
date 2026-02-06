export interface MCPServerStatus {
  name: string;
  connected: boolean;
  toolCount: number;
  tools: string[];
}

export interface ProtocolLogEntry {
  id: string;
  timestamp: string;
  type: 'connection' | 'tool_call' | 'tool_result' | 'error' | 'info';
  server: string;
  message: string;
  data?: unknown;
  duration?: number;
}
