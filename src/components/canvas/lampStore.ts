import { create } from 'zustand'

interface LampStore {
  lampOn: boolean
  toggleLamp: () => void
}

export const useLampStore = create<LampStore>((set) => ({
  lampOn: true,
  toggleLamp: () => set((s) => ({ lampOn: !s.lampOn })),
}))
