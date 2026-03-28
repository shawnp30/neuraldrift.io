import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface StashState {
  stash: string[]; // array of modelIds
  toggleStash: (modelId: string) => void;
  isStashed: (modelId: string) => boolean;
}

export const useStashStore = create<StashState>()(
  persist(
    (set, get) => ({
      stash: [],

      toggleStash: (modelId: string) => {
        const currentStash = get().stash;
        const isAlreadyStashed = currentStash.includes(modelId);

        if (isAlreadyStashed) {
          set({ stash: currentStash.filter((id) => id !== modelId) });
        } else {
          set({ stash: [...currentStash, modelId] });
        }
      },

      isStashed: (modelId: string) => {
        return get().stash.includes(modelId);
      },
    }),
    {
      name: "nd_drift_stash",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
