import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Kid } from '@/lib/types/kid';

interface CacheState {
  cache: Record<string, { data: Kid; timestamp: number }>;
  setCache: (id: string, data: Kid) => void;
  getCache: (id: string) => Kid | null;
  clearExpired: () => void;
}

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export const useCacheStore = create<CacheState>()(
  persist(
    (set, get) => ({
      cache: {},
      setCache: (id, data) => set((state) => ({
        cache: { ...state.cache, [id]: { data, timestamp: Date.now() } }
      })),
      getCache: (id) => {
        const item = get().cache[id];
        if (!item) return null;

        if (Date.now() - item.timestamp > FIVE_DAYS_MS) {
          return null;
        }
        return item.data;
      },
      clearExpired: () => set((state) => {
        const now = Date.now();
        const newCache: Record<string, { data: Kid; timestamp: number }> = { ...state.cache };
        let hasChanges = false;

        for (const key of Object.keys(newCache)) {
          if (now - newCache[key].timestamp > FIVE_DAYS_MS) {
            delete newCache[key];
            hasChanges = true;
          }
        }

        return hasChanges ? { cache: newCache } : state;
      })
    }),
    {
      name: 'registro-query-cache',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
