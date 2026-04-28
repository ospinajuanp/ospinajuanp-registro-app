import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Registro = {
  "Tipo de documento del niño"?: string;
  "Número de documento del niño": string;
  "Nombre completo del niño": string;
  "Sede": string;
  "Tipo de paquete": string;
  "Recibe paquete": string;
  "fecha": string;
  "hora": string;
  [key: string]: any;
};

interface CacheState {
  cache: Record<string, { data: Registro; timestamp: number }>;
  setCache: (id: string, data: Registro) => void;
  getCache: (id: string) => Registro | null;
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
        
        // Verifica si han pasado más de 5 días
        if (Date.now() - item.timestamp > FIVE_DAYS_MS) {
          return null;
        }
        return item.data;
      },
      clearExpired: () => set((state) => {
        const now = Date.now();
        const newCache = { ...state.cache };
        let hasChanges = false;
        
        for (const key in newCache) {
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
