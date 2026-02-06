'use client';

import { useRef, useEffect } from 'react';
import { Terminal, Trash2, ArrowDownToLine, ArrowUpFromLine, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ProtocolLogEntry } from '@/types/mcp';
import type { LogFilter } from '@/types/inspector';
import MessageEntry from './MessageEntry';

interface ProtocolInspectorProps {
  entries: ProtocolLogEntry[];
  filter: LogFilter;
  onFilterChange: (filter: LogFilter) => void;
  pinToBottom: boolean;
  onTogglePin: () => void;
  expandedEntryId: string | null;
  onExpandEntry: (id: string | null) => void;
  onClear: () => void;
}

const FILTERS: { label: string; value: LogFilter; color: string }[] = [
  { label: 'All', value: 'all', color: 'text-text' },
  { label: 'Resume', value: 'mcp-resume', color: 'text-accent' },
  { label: 'Portfolio', value: 'mcp-portfolio', color: 'text-success' },
  { label: 'GitHub', value: 'mcp-github-insights', color: 'text-warning' },
];

export default function ProtocolInspector({
  entries,
  filter,
  onFilterChange,
  pinToBottom,
  onTogglePin,
  expandedEntryId,
  onExpandEntry,
  onClear,
}: ProtocolInspectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pinToBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, pinToBottom]);

  const filteredEntries =
    filter === 'all' ? entries : entries.filter((e) => e.server === filter);

  return (
    <div className="flex flex-col h-full bg-surface-dark">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-accent" />
          <h2 className="text-sm font-medium text-text font-mono">
            Protocol Inspector
          </h2>
          <span className="text-xs text-text-muted bg-surface rounded-full px-2 py-0.5">
            {filteredEntries.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onTogglePin}
            className={`p-1.5 rounded transition-colors ${
              pinToBottom
                ? 'text-accent bg-accent/10'
                : 'text-text-muted hover:text-text'
            }`}
            title={pinToBottom ? 'Unpin from bottom' : 'Pin to bottom'}
          >
            {pinToBottom ? (
              <ArrowDownToLine size={14} />
            ) : (
              <ArrowUpFromLine size={14} />
            )}
          </button>
          <button
            onClick={onClear}
            className="p-1.5 rounded text-text-muted hover:text-error transition-colors"
            title="Clear log"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-1 border-b border-border/50 px-3 py-1.5">
        <Filter size={12} className="text-text-muted mr-1" />
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              filter === f.value
                ? `${f.color} bg-surface-light`
                : 'text-text-muted hover:text-text hover:bg-surface-light/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Terminal size={32} className="text-text-muted/30 mb-3" />
            <p className="text-sm text-text-muted">No protocol messages yet</p>
            <p className="text-xs text-text-muted/60 mt-1">
              Send a message to see MCP protocol activity
            </p>
          </div>
        ) : (
          <div>
            {filteredEntries.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: Math.min(idx * 0.02, 0.3) }}
              >
                <MessageEntry
                  entry={entry}
                  isExpanded={expandedEntryId === entry.id}
                  onToggle={() =>
                    onExpandEntry(
                      expandedEntryId === entry.id ? null : entry.id
                    )
                  }
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
