import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SavedConnection, TabData, SavedQuery } from './types';

export interface SqlLog {
  id: string;
  timestamp: number;
  sql: string;
  status: 'success' | 'error';
  duration: number;
  message?: string;
  dbName?: string;
  affectedRows?: number;
}

interface AppState {
  connections: SavedConnection[];
  tabs: TabData[];
  activeTabId: string | null;
  activeContext: { connectionId: string; dbName: string } | null;
  savedQueries: SavedQuery[];
  darkMode: boolean;
  sqlFormatOptions: { keywordCase: 'upper' | 'lower' };
  sqlLogs: SqlLog[];
  
  addConnection: (conn: SavedConnection) => void;
  updateConnection: (conn: SavedConnection) => void;
  removeConnection: (id: string) => void;
  
  addTab: (tab: TabData) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  setActiveContext: (context: { connectionId: string; dbName: string } | null) => void;

  saveQuery: (query: SavedQuery) => void;
  deleteQuery: (id: string) => void;

  toggleDarkMode: () => void;
  setSqlFormatOptions: (options: { keywordCase: 'upper' | 'lower' }) => void;
  
  addSqlLog: (log: SqlLog) => void;
  clearSqlLogs: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      connections: [],
      tabs: [],
      activeTabId: null,
      activeContext: null,
      savedQueries: [],
      darkMode: false,
      sqlFormatOptions: { keywordCase: 'upper' },
      sqlLogs: [],

      addConnection: (conn) => set((state) => ({ connections: [...state.connections, conn] })),
      updateConnection: (conn) => set((state) => ({ 
          connections: state.connections.map(c => c.id === conn.id ? conn : c) 
      })),
      removeConnection: (id) => set((state) => ({ connections: state.connections.filter(c => c.id !== id) })),

      addTab: (tab) => set((state) => {
        const index = state.tabs.findIndex(t => t.id === tab.id);
        if (index !== -1) {
            // Update existing tab with new data (e.g. switch initialTab)
            const newTabs = [...state.tabs];
            newTabs[index] = { ...newTabs[index], ...tab };
            return { tabs: newTabs, activeTabId: tab.id };
        }
        return { tabs: [...state.tabs, tab], activeTabId: tab.id };
      }),
      
      closeTab: (id) => set((state) => {
        const newTabs = state.tabs.filter(t => t.id !== id);
        let newActiveId = state.activeTabId;
        if (state.activeTabId === id) {
          newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
        }
        return { tabs: newTabs, activeTabId: newActiveId };
      }),
      
      setActiveTab: (id) => set({ activeTabId: id }),
      setActiveContext: (context) => set({ activeContext: context }),

      saveQuery: (query) => set((state) => {
        // If query with same ID exists, update it
        const existing = state.savedQueries.find(q => q.id === query.id);
        if (existing) {
             return { savedQueries: state.savedQueries.map(q => q.id === query.id ? query : q) };
        }
        return { savedQueries: [...state.savedQueries, query] };
      }),

      deleteQuery: (id) => set((state) => ({ savedQueries: state.savedQueries.filter(q => q.id !== id) })),

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setSqlFormatOptions: (options) => set({ sqlFormatOptions: options }),
      
      addSqlLog: (log) => set((state) => ({ sqlLogs: [log, ...state.sqlLogs].slice(0, 1000) })), // Keep last 1000 logs
      clearSqlLogs: () => set({ sqlLogs: [] }),
    }),
    {
      name: 'lite-db-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ connections: state.connections, savedQueries: state.savedQueries, darkMode: state.darkMode, sqlFormatOptions: state.sqlFormatOptions }), // Don't persist logs
    }
  )
);