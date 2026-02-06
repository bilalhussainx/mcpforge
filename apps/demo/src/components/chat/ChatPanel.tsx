'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, FileText, Globe, GitBranch, Trash2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useChat } from '@/lib/hooks/useChat';

const EXAMPLE_PROMPTS = [
  {
    icon: <Sparkles size={16} className="text-accent" />,
    text: 'Analyze my portfolio and find my strongest skills',
    label: 'Portfolio Analysis',
  },
  {
    icon: <FileText size={16} className="text-success" />,
    text: 'Score my resume for ATS compatibility',
    label: 'ATS Score',
  },
  {
    icon: <FileText size={16} className="text-warning" />,
    text: 'Optimize my resume for a Senior Frontend Engineer role at a FAANG company',
    label: 'Resume Optimization',
  },
  {
    icon: <GitBranch size={16} className="text-warning" />,
    text: 'Analyze the repository facebook/react on GitHub',
    label: 'Repo Analysis',
  },
];

export default function ChatPanel() {
  const { messages, isLoading, sendMessage, clearChat, error, messageCount } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (content: string, resumePdf?: string | null) => {
    sendMessage(content, resumePdf);
  };

  const handleExampleClick = (text: string) => {
    if (!isLoading) {
      sendMessage(text);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-surface-dark">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-accent" />
          <h2 className="text-sm font-medium text-text">Chat</h2>
          {messageCount > 0 && (
            <span className="text-xs text-text-muted bg-surface rounded-full px-2 py-0.5">
              {messageCount}/20 messages
            </span>
          )}
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-error transition-colors"
          >
            <Trash2 size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-md"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Globe size={28} className="text-accent" />
              </div>
              <h3 className="text-lg font-medium text-text mb-2">
                MCPForge Demo
              </h3>
              <p className="text-sm text-text-dim mb-6">
                Chat with Claude AI enhanced by three MCP servers. Upload a resume, analyze portfolios, or explore GitHub repositories.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EXAMPLE_PROMPTS.map((prompt, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx, duration: 0.3 }}
                    onClick={() => handleExampleClick(prompt.text)}
                    className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-left hover:border-accent/50 hover:bg-surface-light/30 transition-all group"
                  >
                    <div className="shrink-0 mt-0.5">{prompt.icon}</div>
                    <div>
                      <div className="text-xs font-medium text-text-dim group-hover:text-text transition-colors">
                        {prompt.label}
                      </div>
                      <div className="text-xs text-text-muted mt-0.5 line-clamp-2">
                        {prompt.text}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="px-4 py-2 bg-error/10 border-t border-error/20">
          <p className="text-xs text-error">{error}</p>
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
