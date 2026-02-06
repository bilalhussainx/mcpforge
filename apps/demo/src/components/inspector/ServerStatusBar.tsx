'use client';

import { Server, Wrench, Activity } from 'lucide-react';
import type { MCPServerStatus } from '@/types/mcp';

interface ServerStatusBarProps {
  statuses: MCPServerStatus[];
  totalCalls: number;
}

function getServerDotColor(name: string): string {
  switch (name) {
    case 'mcp-resume':
      return 'bg-accent';
    case 'mcp-portfolio':
      return 'bg-success';
    case 'mcp-github-insights':
      return 'bg-warning';
    default:
      return 'bg-text-muted';
  }
}

function getServerTextColor(name: string): string {
  switch (name) {
    case 'mcp-resume':
      return 'text-accent';
    case 'mcp-portfolio':
      return 'text-success';
    case 'mcp-github-insights':
      return 'text-warning';
    default:
      return 'text-text-muted';
  }
}

export default function ServerStatusBar({ statuses, totalCalls }: ServerStatusBarProps) {
  const totalTools = statuses.reduce((sum, s) => sum + s.toolCount, 0);
  const connectedCount = statuses.filter((s) => s.connected).length;

  return (
    <div className="flex items-center gap-4 border-t border-border bg-primary px-4 py-2 overflow-x-auto">
      {/* Server statuses */}
      <div className="flex items-center gap-3">
        {statuses.map((server) => (
          <div
            key={server.name}
            className="flex items-center gap-1.5 text-xs"
            title={`${server.name}: ${server.connected ? 'Connected' : 'Disconnected'} (${server.toolCount} tools)`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                server.connected
                  ? `${getServerDotColor(server.name)} pulse-dot`
                  : 'bg-error/60'
              }`}
            />
            <span className={`${getServerTextColor(server.name)} font-mono`}>
              {server.name.replace('mcp-', '')}
            </span>
            <span className="text-text-muted">
              ({server.toolCount})
            </span>
          </div>
        ))}

        {statuses.length === 0 && (
          <span className="text-xs text-text-muted">No servers connected</span>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-border" />

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-text-muted">
        <div className="flex items-center gap-1">
          <Server size={12} />
          <span>
            {connectedCount}/{statuses.length} servers
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Wrench size={12} />
          <span>{totalTools} tools</span>
        </div>
        <div className="flex items-center gap-1">
          <Activity size={12} />
          <span>{totalCalls} calls</span>
        </div>
      </div>
    </div>
  );
}
