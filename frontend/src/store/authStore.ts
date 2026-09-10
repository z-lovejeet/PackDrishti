import { create } from 'zustand';
import type { User, UserRole, AuthTokens } from '../types/models';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, tokens: AuthTokens) => void;
  setRole: (role: UserRole) => void;
  setUser: (user: User) => void;
  logout: () => void;
  getToken: () => string | null;
}

const STORAGE_KEYS = {
  TOKEN: 'packdrashiti_access_token',
  REFRESH_TOKEN: 'packdrashiti_refresh_token',
  USER: 'packdrashiti_user_session',
  ROLE: 'packdrashiti_active_role',
};

const getStoredItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStoredItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage quota or privacy sandbox fallback
  }
};

const removeStoredItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage fallback
  }
};

const initialToken = getStoredItem(STORAGE_KEYS.TOKEN);
const initialRefreshToken = getStoredItem(STORAGE_KEYS.REFRESH_TOKEN);
const initialRoleString = getStoredItem(STORAGE_KEYS.ROLE);
const initialRole: UserRole =
  initialRoleString === 'officer' || initialRoleString === 'admin'
    ? initialRoleString
    : 'consumer';

let initialUser: User | null = null;
const storedUserJson = getStoredItem(STORAGE_KEYS.USER);
if (storedUserJson) {
  try {
    initialUser = JSON.parse(storedUserJson);
  } catch {
    initialUser = null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  token: initialToken,
  refreshToken: initialRefreshToken,
  role: initialRole,
  isAuthenticated: Boolean(initialToken),
  isLoading: false,

  setAuth: (user: User, tokens: AuthTokens) => {
    setStoredItem(STORAGE_KEYS.TOKEN, tokens.accessToken);
    setStoredItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    setStoredItem(STORAGE_KEYS.USER, JSON.stringify(user));
    setStoredItem(STORAGE_KEYS.ROLE, user.role);

    set({
      user,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      role: user.role,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setRole: (role: UserRole) => {
    setStoredItem(STORAGE_KEYS.ROLE, role);
    set((state) => ({
      role,
      user: state.user ? { ...state.user, role } : null,
    }));
  },

  setUser: (user: User) => {
    setStoredItem(STORAGE_KEYS.USER, JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    removeStoredItem(STORAGE_KEYS.TOKEN);
    removeStoredItem(STORAGE_KEYS.REFRESH_TOKEN);
    removeStoredItem(STORAGE_KEYS.USER);
    removeStoredItem(STORAGE_KEYS.ROLE);

    set({
      user: null,
      token: null,
      refreshToken: null,
      role: 'consumer',
      isAuthenticated: false,
      isLoading: false,
    });
  },

  getToken: () => {
    return get().token || getStoredItem(STORAGE_KEYS.TOKEN);
  },
}));
