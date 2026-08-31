import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/User";

// We need to check LocalStorage (Remember Me) first, then SessionStorage.
const getStoredUser = (): User | null => {
  try {
    const localUser = localStorage.getItem("velocity_user");
    if (localUser) return JSON.parse(localUser);

    const sessionUser = sessionStorage.getItem("velocity_user");
    if (sessionUser) return JSON.parse(sessionUser);

    return null;
  } catch (error) {
    console.error("Failed to parse user from storage", error);
    return null;
  }
};

const getStoredToken = (): string | null => {
  try {
    const localToken = localStorage.getItem("velocity_jwt");
    if (localToken) return localToken;

    const sessionToken = sessionStorage.getItem("velocity_jwt");
    if (sessionToken) return sessionToken;

    return null;
  } catch (error) {
    console.error("Failed to parse token from storage", error);
    return null;
  }
};

const initialUser = getStoredUser();
const initialToken = getStoredToken();

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: !!initialUser,
  token: initialToken,
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

    // We clear BOTH to ensure the user is definitely logged out
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem("velocity_user");
      sessionStorage.removeItem("velocity_user");
      localStorage.removeItem("velocity_jwt");
      sessionStorage.removeItem("velocity_jwt");
    },

    // If we update the user (e.g. change name), we must update the storage
    // so it doesn't revert when they refresh the page.
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };

        const updatedUserJSON = JSON.stringify(state.user);

        if (localStorage.getItem("velocity_user")) {
          localStorage.setItem("velocity_user", updatedUserJSON);
        } else {
          sessionStorage.setItem("velocity_user", updatedUserJSON);
        }
      }
    },
  },
});

export const { loginSuccess, loginFailure, logout, updateUser } =
  authSlice.actions;
export default authSlice.reducer;
