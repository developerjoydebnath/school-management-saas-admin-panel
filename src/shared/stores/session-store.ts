import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const SELECTED_ACADEMIC_SESSION_COOKIE = "selected_academic_session_id";

function syncSelectedSessionCookie(id: string | null) {
	if (typeof document === "undefined") return;

	if (!id) {
		document.cookie = `${SELECTED_ACADEMIC_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
		return;
	}

	document.cookie = `${SELECTED_ACADEMIC_SESSION_COOKIE}=${encodeURIComponent(
		id
	)}; path=/; max-age=31536000; SameSite=Lax`;
}

type SessionStore = {
	selectedSessionId: string | null;
	setSelectedSessionId: (id: string | null) => void;
};

export const useSessionStore = create<SessionStore>()(
	persist(
		(set) => ({
			selectedSessionId: null,
			setSelectedSessionId: (id) => {
				syncSelectedSessionCookie(id);
				set({ selectedSessionId: id });
			},
		}),
		{
			name: "selected-academic-session",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({ selectedSessionId: state.selectedSessionId }),
			onRehydrateStorage: () => (state) => {
				syncSelectedSessionCookie(state?.selectedSessionId || null);
			},
		}
	)
);
