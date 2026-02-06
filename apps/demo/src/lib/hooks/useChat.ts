'use client';

import { create } from 'zustand';
import type { ChatMessage, ToolCallInfo, StreamEvent } from '@/types/chat';
import type { ProtocolLogEntry, MCPServerStatus } from '@/types/mcp';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  protocolLog: ProtocolLogEntry[];
  serverStatuses: MCPServerStatus[];
  sessionId: string;
  messageCount: number;
  resumePdf: string | null;
  error: string | null;

  sendMessage: (content: string, resumePdf?: string | null) => Promise<void>;
  clearChat: () => void;
  setResumePdf: (pdf: string | null) => void;
  addProtocolEntries: (entries: ProtocolLogEntry[]) => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  protocolLog: [],
  serverStatuses: [],
  sessionId: generateId(),
  messageCount: 0,
  resumePdf: null,
  error: null,

  sendMessage: async (content: string, resumePdf?: string | null) => {
    const state = get();
    if (state.isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      toolCalls: [],
      timestamp: new Date().toISOString(),
    };

    set({
      messages: [...state.messages, userMessage, assistantMessage],
      isLoading: true,
      error: null,
      messageCount: state.messageCount + 1,
    });

    try {
      const allMessages = [...state.messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          sessionId: state.sessionId,
          resumePdf: resumePdf || state.resumePdf,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';
      const toolCalls: ToolCallInfo[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed === 'data: [DONE]') {
            continue;
          }

          if (!trimmed.startsWith('data: ')) continue;

          try {
            const jsonStr = trimmed.slice(6);
            const event: StreamEvent = JSON.parse(jsonStr);

            switch (event.type) {
              case 'text': {
                fullText += event.text || '';
                set((s) => {
                  const msgs = [...s.messages];
                  const lastMsg = msgs[msgs.length - 1];
                  if (lastMsg && lastMsg.role === 'assistant') {
                    msgs[msgs.length - 1] = { ...lastMsg, content: fullText };
                  }
                  return { messages: msgs };
                });
                break;
              }

              case 'tool_call': {
                const tc: ToolCallInfo = {
                  id: event.toolCallId || generateId(),
                  tool: event.tool || 'unknown',
                  server: event.server || 'unknown',
                  input: event.input,
                  status: 'running',
                };
                toolCalls.push(tc);

                set((s) => {
                  const msgs = [...s.messages];
                  const lastMsg = msgs[msgs.length - 1];
                  if (lastMsg && lastMsg.role === 'assistant') {
                    msgs[msgs.length - 1] = {
                      ...lastMsg,
                      toolCalls: [...(lastMsg.toolCalls || []), tc],
                    };
                  }
                  return { messages: msgs };
                });
                break;
              }

              case 'tool_result': {
                const tcId = event.toolCallId;
                set((s) => {
                  const msgs = [...s.messages];
                  const lastMsg = msgs[msgs.length - 1];
                  if (lastMsg && lastMsg.role === 'assistant' && lastMsg.toolCalls) {
                    const updatedCalls = lastMsg.toolCalls.map((tc) => {
                      if (tc.id === tcId || tc.tool === event.tool) {
                        return {
                          ...tc,
                          result: event.result,
                          status: (event.result?.startsWith('Error') ? 'error' : 'complete') as ToolCallInfo['status'],
                        };
                      }
                      return tc;
                    });
                    msgs[msgs.length - 1] = { ...lastMsg, toolCalls: updatedCalls };
                  }
                  return { messages: msgs };
                });
                break;
              }

              case 'protocol_log': {
                if (event.log && event.log.length > 0) {
                  set((s) => ({
                    protocolLog: [...s.protocolLog, ...event.log!],
                  }));
                }
                break;
              }

              case 'servers': {
                if (event.servers) {
                  set({ serverStatuses: event.servers });
                }
                break;
              }

              case 'error': {
                set({ error: event.error || 'Unknown error occurred' });
                break;
              }
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to send message';
      set((s) => {
        const msgs = [...s.messages];
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          msgs[msgs.length - 1] = {
            ...lastMsg,
            content: `**Error:** ${errMsg}`,
          };
        }
        return { messages: msgs, error: errMsg };
      });
    } finally {
      set({ isLoading: false });
    }
  },

  clearChat: () => {
    set({
      messages: [],
      protocolLog: [],
      error: null,
      messageCount: 0,
      sessionId: generateId(),
      resumePdf: null,
    });
  },

  setResumePdf: (pdf: string | null) => {
    set({ resumePdf: pdf });
  },

  addProtocolEntries: (entries: ProtocolLogEntry[]) => {
    set((s) => ({
      protocolLog: [...s.protocolLog, ...entries],
    }));
  },
}));

export function useChat() {
  const store = useChatStore();
  return store;
}
