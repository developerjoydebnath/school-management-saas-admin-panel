import { create } from 'zustand';

export type AuthUserStateType = {
    id: number | null;
    name: string | null;
    auth_id: string | null;
    image: string | null;
    base_role: string | null;
    status: string | null;
    permissions: string[] | null;
    avatar?: string | null;
    token: string | null;
};

interface AuthState {
    auth: {
        user: AuthUserStateType;
        isAuthenticated: boolean;
    };
    setAuth: (user: AuthUserStateType) => void;
    clearAuth: () => void;
}

const initialUser: AuthUserStateType = {
    id: null,
    name: null,
    auth_id: null,
    image: null,
    base_role: null,
    status: null,
    permissions: null,
    avatar: null,
    token: null,
};

export const useAuthStore = create<AuthState>((set) => ({
    auth: {
        user: initialUser,
        isAuthenticated: false,
    },
    setAuth: (user) => set({ auth: { user, isAuthenticated: true } }),
    clearAuth: () => set({ auth: { user: initialUser, isAuthenticated: false } }),
}));
