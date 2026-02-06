'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, AlertCircle, Info, Link, Wrench } from 'lucide-react';
import type { ProtocolLogEntry } from '@/types/mcp';
import JsonViewer from './JsonViewer';

interface MessageEntryProps {
  entry: ProtocolLogEntry;
  isExpanded: boolean;
  onToggle: () => void;
}

function getServerColor(server: string): string {
  switch (server) {
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

function getServerBg(server: string): string {
  switch (server) {
    case 'mcp-resume':
      return 'bg-accent/10';
    case 'mcp-portfolio':
      return 'bg-success/10';
    case 'mcp-github-insights':
      return 'bg-warning/10';
    default:
      return 'bg-surface-light/30';
  }
}

function getTypeIcon(type: ProtocolLogEntry['type']) {
  switch (type) {
    case 'connection':
      return <Link size={12} />;
    case 'tool_call':
      return <ArrowRight size={12} />;
    case 'tool_result':
      return <ArrowLeft size={12} />;
    case 'error':
      return <AlertCircle size={12} />;
    case 'info':
      return <Info size={12} />;
  }
}

function getTypeColor(type: ProtocolLogEntry['type']): string {
  switch (type) {
    case 'connection':
      return 'text-accent';
    case 'tool_call':
      return 'text-warning';
    case 'tool_result':
      return 'text-success';
    case 'error':
      return 'text-error';
    case 'info':
      return 'text-text-muted';
  }
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) + '.' + String(date.getMilliseconds()).padStart(3, '0');
}

export default function MessageEntry({ entry, isExpanded, onToggle }: MessageEntryProps) {
  const serverColor = getServerColor(entry.server);
  const typeColor = getTypeColor(entry.type);

  return (
    <div className={`inspector-row ${isExpanded ? 'expanded' : ''}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-left"
      >
        {/* Timestamp */}
        <span className="text-text-muted shrink-0 w-[90px]">
          {formatTime(entry.timestamp)}
        </span>

        {/* Direction icon */}
        <span className={`shrink-0 ${typeColor}`}>
          {getTypeIcon(entry.type)}
        </span>

        {/* Server badge */}
        <span
          className={`shrink-0 ${serverColor} ${getServerBg(entry.server)} px-1.5 py-0.5 rounded text-[10px] font-medium`}
        >
          {entry.server}
        </span>

        {/* Type */}
        <span className={`shrink-0 ${typeColor} text-[10px] uppercase tracking-wider w-[70px]`}>
          {entry.type.replace('_', ' ')}
        </span>

        {/* Message */}
        <span className="flex-1 text-text-dim truncate text-xs">
          {entry.message}
        </span>

        {/* Duration */}
        {entry.duration !== undefined && (
          <span className="shrink-0 text-text-muted text-[10px]">
            {entry.duration}ms
          </span>
        )}
      </button>

      <AnimatePresence>
        {isExpanded && entry.data != null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2 pt-1 ml-[90px]">
              <div className="bg-surface-dark rounded border border-border/50 p-2">
                <JsonViewer data={entry.data} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
