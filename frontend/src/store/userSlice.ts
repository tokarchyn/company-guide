import { Client } from "@microsoft/microsoft-graph-client";
import { AuthCodeMSALBrowserAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { config } from "config";
import { User } from "microsoft-graph";
import {
  authProvider,
  authScopes,
  msalInstance,
} from "services/authentication";

let graphClient: Client | undefined = undefined;

function ensureClient(authProvider: AuthCodeMSALBrowserAuthenticationProvider) {
  if (!graphClient) {
    graphClient = Client.initWithMiddleware({
      authProvider: authProvider,
    });
  }

  return graphClient;
}

export interface UserProfile {
  displayName?: string;
  email?: string;
  avatar?: string;
  timeZone?: string;
  timeFormat?: string;
}

export interface UserError {
  message: string;
  debug?: string;
}

type UserState = {
  profile?: UserProfile;
  error?: UserError;
  loading: boolean;
};

const initState: UserState = {
  profile: undefined,
  error: undefined,
  loading: false,
};

export const signIn = createAsyncThunk("projectData/signIn", async () => {
  if (!msalInstance.getActiveAccount()) {
    const result = await msalInstance.loginPopup({
      scopes: authScopes,
      prompt: "select_account",
    });
  }

  ensureClient(authProvider);

  const user: User = await graphClient!
    .api("/me")
    .select("displayName,mail")
    .get();

  return user;
});

export const signOut = createAsyncThunk("projectData/signOut", async () => {
  await msalInstance.logoutPopup();
});

const userSlice = createSlice({
  name: "projectData",
  initialState: initState,
  reducers: {
    displayError: (
      state,
      action: PayloadAction<{ message: string; debug?: string }>
    ) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signIn.fulfilled, (state, action) => {
      state.loading = false;
      state.error = undefined;
      state.profile = {
        displayName: action.payload.displayName || "",
        email: action.payload.mail || action.payload.userPrincipalName || "",
        timeFormat: action.payload.mailboxSettings?.timeFormat || "",
        timeZone: action.payload.mailboxSettings?.timeZone || "UTC",
      };
    });
    builder.addCase(signIn.pending, (state, action) => {
      state.loading = true;
      state.error = undefined;
    });
    builder.addCase(signIn.rejected, (state, action) => {
      state.loading = false;
      state.error = {
        message:
          "Some error happened during signing in. See console output for more information.",
      };
    });
    builder.addCase(signOut.fulfilled, (state, action) => {
      state.profile = undefined;
    });
  },
});

export const { displayError, clearError } = userSlice.actions;

export const userReducer = userSlice.reducer;
