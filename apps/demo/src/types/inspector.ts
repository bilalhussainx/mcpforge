export type { ProtocolLogEntry } from './mcp';

export type LogFilter = 'all' | 'mcp-resume' | 'mcp-portfolio' | 'mcp-github-insights';

export type LogEntryType = 'connection' | 'tool_call' | 'tool_result' | 'error' | 'info';

export interface InspectorState {
  entries: import('./mcp').ProtocolLogEntry[];
  filter: LogFilter;
  pinToBottom: boolean;
  expandedEntryId: string | null;
}
