import { create } from "zustand";

interface AlpacaState {
  alpacas: Map<string, any>;
  setAlpaca: (tokenId: string, data: any) => void;
  getAlpaca: (tokenId: string) => any;
}

export const useAlpacaStore = create<AlpacaState>((set, get) => ({
  alpacas: new Map(),
  
  setAlpaca: (tokenId, data) => {
    set((state) => {
      const newAlpacas = new Map(state.alpacas);
      newAlpacas.set(tokenId, data);
      return { alpacas: newAlpacas };
    });
  },
  
  getAlpaca: (tokenId) => {
    return get().alpacas.get(tokenId);
  },
}));