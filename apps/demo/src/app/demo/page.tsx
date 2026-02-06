'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';
import ChatPanel from '@/components/chat/ChatPanel';
import ProtocolInspector from '@/components/inspector/ProtocolInspector';
import ServerStatusBar from '@/components/inspector/ServerStatusBar';
import { useChatStore } from '@/lib/hooks/useChat';
import { useProtocolLogStore } from '@/lib/hooks/useProtocolLog';

export default function DemoPage() {
  const chatProtocolLog = useChatStore((s) => s.protocolLog);
  const serverStatuses = useChatStore((s) => s.serverStatuses);

  const {
    filter,
    setFilter,
    pinToBottom,
    togglePinToBottom,
    expandedEntryId,
    setExpandedEntry,
    addEntries,
    clearLog,
    entries: inspectorEntries,
  } = useProtocolLogStore();

  // Sync protocol logs from chat store to inspector store
  useEffect(() => {
    if (chatProtocolLog.length > 0) {
      addEntries(chatProtocolLog);
    }
  }, [chatProtocolLog, addEntries]);

  // Use inspector entries (which include synced data)
  const filteredEntries = useMemo(() => {
    if (filter === 'all') return inspectorEntries;
    return inspectorEntries.filter((e) => e.server === filter);
  }, [inspectorEntries, filter]);

  // Count tool calls for the status bar
  const totalCalls = useMemo(() => {
    return inspectorEntries.filter(
      (e) => e.type === 'tool_call'
    ).length;
  }, [inspectorEntries]);

  return (
    <div className="flex flex-col h-screen bg-primary">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border bg-primary px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-xs hidden sm:inline">Back</span>
          </Link>

          <div className="w-px h-5 bg-border" />

          <div className="flex items-center gap-2">
            <Zap size={16} className="text-accent" />
            <span className="text-sm font-semibold gradient-text">MCPForge</span>
            <span className="text-xs text-text-muted hidden sm:inline">Demo</span>
          </div>
        </div>

        {/* Server indicators in header */}
        <div className="flex items-center gap-2">
          {serverStatuses.map((server) => (
            <div
              key={server.name}
              className="flex items-center gap-1.5"
              title={`${server.name}: ${server.connected ? 'Connected' : 'Disconnected'}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  server.connected
                    ? server.name === 'mcp-resume'
                      ? 'bg-accent pulse-dot'
                      : server.name === 'mcp-portfolio'
                        ? 'bg-success pulse-dot'
                        : 'bg-warning pulse-dot'
                    : 'bg-error/60'
                }`}
              />
              <span className="text-[10px] text-text-muted font-mono hidden md:inline">
                {server.name.replace('mcp-', '')}
              </span>
            </div>
          ))}
          {serverStatuses.length === 0 && (
            <span className="text-[10px] text-text-muted">No servers</span>
          )}
        </div>
      </header>

      {/* Main content: split panels */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Chat panel - 60% */}
        <div className="flex-[6] min-h-0 min-w-0 overflow-hidden">
          <ChatPanel />
        </div>

        {/* Resize handle */}
        <div className="hidden md:block resize-handle" />

        {/* Protocol Inspector - 40% */}
        <div className="flex-[4] min-h-0 min-w-0 overflow-hidden border-t md:border-t-0 md:border-l border-border">
          <ProtocolInspector
            entries={filteredEntries}
            filter={filter}
            onFilterChange={setFilter}
            pinToBottom={pinToBottom}
            onTogglePin={togglePinToBottom}
            expandedEntryId={expandedEntryId}
            onExpandEntry={setExpandedEntry}
            onClear={clearLog}
          />
        </div>
      </div>

      {/* Bottom status bar */}
      <ServerStatusBar statuses={serverStatuses} totalCalls={totalCalls} />
    </div>
  );
}
