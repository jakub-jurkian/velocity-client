import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/User";
import type { AppDispatch } from "..";

// Safe storage utility (handles SSR environments or blocked cookies)
const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    return (
      localStorage.getItem("velocity_jwt") ||
      sessionStorage.getItem("velocity_jwt") ||
      null
    );
  } catch (error) {
    console.error("Storage access denied or failed", error);
    return null;
  }
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

// Initial state only cares about the token now.
// The user is null until /auth/me succeeds.
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: getStoredToken(),
};

interface LoginSuccessPayload {
  user: User;
  token: string;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<LoginSuccessPayload>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    loginFailure: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { loginSuccess, loginFailure, logout, updateUser } =
  authSlice.actions;

// Thunk for Logging Out
export const performLogout = () => (dispatch: AppDispatch) => {
  // Clear side effects first
  localStorage.removeItem("velocity_jwt");
  sessionStorage.removeItem("velocity_jwt");

  // Then update Redux state
  dispatch(logout());
};

// Thunk for Logging In
export const performLogin =
  (user: User, token: string, rememberMe: boolean) =>
  (dispatch: AppDispatch) => {
    // Determine which storage to use
    const targetStorage = rememberMe ? localStorage : sessionStorage;
    const oldStorage = rememberMe ? sessionStorage : localStorage;

    // ONLY store the token (Security Best Practice)
    targetStorage.setItem("velocity_jwt", token);
    oldStorage.removeItem("velocity_jwt"); // Clean up conflicts automatically

    // Update Redux
    dispatch(loginSuccess({ user, token }));
  };

export default authSlice.reducer;
