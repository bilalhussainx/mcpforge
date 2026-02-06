import type { ProtocolLogEntry } from '@/types/mcp';

let entryCounter = 0;

export function createLogEntry(
  type: ProtocolLogEntry['type'],
  server: string,
  message: string,
  data?: unknown,
  duration?: number
): ProtocolLogEntry {
  entryCounter++;
  return {
    id: `log-${Date.now()}-${entryCounter}`,
    timestamp: new Date().toISOString(),
    type,
    server,
    message,
    data,
    duration,
  };
}

export class ProtocolLogger {
  private entries: ProtocolLogEntry[] = [];
  private maxEntries: number;

  constructor(maxEntries = 500) {
    this.maxEntries = maxEntries;
  }

  log(
    type: ProtocolLogEntry['type'],
    server: string,
    message: string,
    data?: unknown,
    duration?: number
  ): ProtocolLogEntry {
    const entry = createLogEntry(type, server, message, data, duration);
    this.entries.push(entry);

    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }

    return entry;
  }

  getEntries(filter?: string): ProtocolLogEntry[] {
    if (!filter || filter === 'all') {
      return [...this.entries];
    }
    return this.entries.filter((e) => e.server === filter);
  }

  getNewEntries(afterId?: string): ProtocolLogEntry[] {
    if (!afterId) return [...this.entries];
    const idx = this.entries.findIndex((e) => e.id === afterId);
    if (idx === -1) return [...this.entries];
    return this.entries.slice(idx + 1);
  }

  clear(): void {
    this.entries = [];
  }

  get count(): number {
    return this.entries.length;
  }
}
