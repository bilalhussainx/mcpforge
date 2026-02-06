'use client';

import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/types/chat';
import ToolCallCard from './ToolCallCard';

interface ChatMessageProps {
  message: ChatMessageType;
}

function renderContent(content: string) {
  if (!content) return null;

  const parts: React.ReactNode[] = [];
  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeBlockContent = '';
  let codeBlockLang = '';
  let blockIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        parts.push(
          <pre key={`code-${blockIndex++}`} className="code-block my-2 text-sm">
            {codeBlockLang && (
              <span className="text-xs text-text-muted block mb-2">{codeBlockLang}</span>
            )}
            <code>{codeBlockContent.trimEnd()}</code>
          </pre>
        );
        codeBlockContent = '';
        codeBlockLang = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent += line + '\n';
      continue;
    }

    // Process inline formatting
    parts.push(
      <span key={`line-${i}`}>
        {i > 0 && !inCodeBlock && <br />}
        {renderInline(line)}
      </span>
    );
  }

  // Handle unclosed code block
  if (inCodeBlock && codeBlockContent) {
    parts.push(
      <pre key={`code-unclosed`} className="code-block my-2 text-sm">
        <code>{codeBlockContent.trimEnd()}</code>
      </pre>
    );
  }

  return <>{parts}</>;
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Match: **bold**, *italic*, `code`, [link](url)
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Push text before match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // Bold
      nodes.push(
        <strong key={`b-${key++}`} className="font-semibold text-text">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Italic
      nodes.push(
        <em key={`i-${key++}`} className="italic text-text-dim">
          {match[4]}
        </em>
      );
    } else if (match[5]) {
      // Inline code
      nodes.push(
        <code
          key={`c-${key++}`}
          className="bg-surface-light px-1.5 py-0.5 rounded text-accent font-mono text-[0.85em]"
        >
          {match[6]}
        </code>
      );
    } else if (match[7]) {
      // Link
      nodes.push(
        <a
          key={`a-${key++}`}
          href={match[9]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline hover:text-accent/80"
        >
          {match[8]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-surface-light' : 'bg-accent/20'
        }`}
      >
        {isUser ? (
          <User size={16} className="text-text-dim" />
        ) : (
          <Bot size={16} className="text-accent" />
        )}
      </div>

      {/* Content */}
      <div
        className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : 'text-left'}`}
      >
        <div
          className={`inline-block text-left rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-surface-light text-text rounded-tr-md'
              : 'bg-surface text-text rounded-tl-md'
          }`}
        >
          {message.content ? (
            <div className="prose-invert">{renderContent(message.content)}</div>
          ) : (
            !message.toolCalls?.length && (
              <div className="flex items-center gap-2 text-text-muted">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-xs">Thinking...</span>
              </div>
            )
          )}
        </div>

        {/* Tool Calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.toolCalls.map((tc) => (
              <ToolCallCard key={tc.id} toolCall={tc} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-xs text-text-muted mt-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
}
