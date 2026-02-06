'use client';

import { create } from 'zustand';
import type { ProtocolLogEntry } from '@/types/mcp';
import type { LogFilter } from '@/types/inspector';

interface ProtocolLogState {
  entries: ProtocolLogEntry[];
  filter: LogFilter;
  pinToBottom: boolean;
  expandedEntryId: string | null;

  setFilter: (filter: LogFilter) => void;
  addEntries: (newEntries: ProtocolLogEntry[]) => void;
  clearLog: () => void;
  togglePinToBottom: () => void;
  setExpandedEntry: (id: string | null) => void;
  getFilteredEntries: () => ProtocolLogEntry[];
}

export const useProtocolLogStore = create<ProtocolLogState>((set, get) => ({
  entries: [],
  filter: 'all',
  pinToBottom: true,
  expandedEntryId: null,

  setFilter: (filter: LogFilter) => {
    set({ filter });
  },

  addEntries: (newEntries: ProtocolLogEntry[]) => {
    set((s) => {
      // Deduplicate by ID
      const existingIds = new Set(s.entries.map((e) => e.id));
      const unique = newEntries.filter((e) => !existingIds.has(e.id));
      if (unique.length === 0) return s;

      const combined = [...s.entries, ...unique];
      // Cap at 500 entries
      return { entries: combined.slice(-500) };
    });
  },

  clearLog: () => {
    set({ entries: [], expandedEntryId: null });
  },

  togglePinToBottom: () => {
    set((s) => ({ pinToBottom: !s.pinToBottom }));
  },

  setExpandedEntry: (id: string | null) => {
    set({ expandedEntryId: id });
  },

  getFilteredEntries: () => {
    const { entries, filter } = get();
    if (filter === 'all') return entries;
    return entries.filter((e) => e.server === filter);
  },
}));

export function useProtocolLog() {
  const store = useProtocolLogStore();
  return {
    ...store,
    filteredEntries: store.getFilteredEntries(),
  };
}
