import { create } from "zustand";

type SessionStore = {
	selectedSessionId: string | null;
	setSelectedSessionId: (id: string | null) => void;
};

export const useSessionStore = create<SessionStore>((set) => ({
	selectedSessionId: null,
	setSelectedSessionId: (id) => set({ selectedSessionId: id }),
}));
