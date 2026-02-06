'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, ChevronDown, ChevronUp, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import type { ToolCallInfo } from '@/types/chat';

interface ToolCallCardProps {
  toolCall: ToolCallInfo;
}

function getServerColor(server: string): {
  border: string;
  bg: string;
  text: string;
  dot: string;
} {
  switch (server) {
    case 'mcp-resume':
      return {
        border: 'border-l-accent',
        bg: 'bg-accent/5',
        text: 'text-accent',
        dot: 'bg-accent',
      };
    case 'mcp-portfolio':
      return {
        border: 'border-l-success',
        bg: 'bg-success/5',
        text: 'text-success',
        dot: 'bg-success',
      };
    case 'mcp-github-insights':
      return {
        border: 'border-l-warning',
        bg: 'bg-warning/5',
        text: 'text-warning',
        dot: 'bg-warning',
      };
    default:
      return {
        border: 'border-l-text-muted',
        bg: 'bg-surface-light/30',
        text: 'text-text-muted',
        dot: 'bg-text-muted',
      };
  }
}

function getStatusIcon(status: ToolCallInfo['status']) {
  switch (status) {
    case 'pending':
      return <Clock size={14} className="text-text-muted" />;
    case 'running':
      return <Loader2 size={14} className="text-accent animate-spin" />;
    case 'complete':
      return <CheckCircle size={14} className="text-success" />;
    case 'error':
      return <XCircle size={14} className="text-error" />;
  }
}

function getStatusLabel(status: ToolCallInfo['status'], duration?: number): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'running':
      return 'Running...';
    case 'complete':
      return duration ? `Complete (${(duration / 1000).toFixed(1)}s)` : 'Complete';
    case 'error':
      return 'Error';
  }
}

function truncateResult(result: string, maxLen = 120): string {
  if (result.length <= maxLen) return result;
  return result.substring(0, maxLen) + '...';
}

export default function ToolCallCard({ toolCall }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = getServerColor(toolCall.server);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`tool-card ${colors.border} border-l-[3px] rounded-lg my-2 overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-start gap-3 p-3 text-left ${colors.bg} hover:bg-surface-light/20 transition-colors`}
      >
        <Wrench size={16} className={`${colors.text} mt-0.5 shrink-0`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-mono text-sm font-medium ${colors.text}`}>
              {toolCall.tool}
            </span>
            <span className="text-xs text-text-muted">
              {toolCall.server}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-xs text-text-dim">
            {getStatusIcon(toolCall.status)}
            <span>{getStatusLabel(toolCall.status, toolCall.duration)}</span>
          </div>

          {toolCall.result && !expanded && (
            <p className="mt-1 text-xs text-text-muted font-mono truncate">
              {truncateResult(toolCall.result)}
            </p>
          )}
        </div>

        <div className="shrink-0 text-text-muted">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50 p-3 space-y-3">
              {toolCall.input != null && (
                <div>
                  <h4 className="text-xs font-medium text-text-muted mb-1">Input</h4>
                  <pre className="code-block text-xs overflow-x-auto">
                    {JSON.stringify(toolCall.input, null, 2)}
                  </pre>
                </div>
              )}
              {toolCall.result && (
                <div>
                  <h4 className="text-xs font-medium text-text-muted mb-1">Result</h4>
                  <pre className="code-block text-xs overflow-x-auto max-h-64 overflow-y-auto">
                    {toolCall.result}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
