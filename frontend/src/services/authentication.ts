import {
  AuthenticationResult,
  EventMessage,
  EventType,
  InteractionType,
  PublicClientApplication,
} from "@azure/msal-browser";
import { AuthCodeMSALBrowserAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser";
import { config } from "config";

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: config.appRegistration.clientId,
    redirectUri: config.appRegistration.redirectUri,
    authority: "https://login.microsoftonline.com/datamole.cz",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  },
});

// Check if there are already accounts in the browser session
// If so, set the first account as the active account
const accounts = msalInstance.getAllAccounts();
if (accounts && accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}

msalInstance.addEventCallback((event: EventMessage) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    // Set the active account - this simplifies token acquisition
    const authResult = event.payload as AuthenticationResult;
    msalInstance.setActiveAccount(authResult.account);
  }
});

export const authScopes = ["user.read", "https://atlas.microsoft.com/user_impersonation"]

export const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
  msalInstance as PublicClientApplication,
  {
    account: msalInstance.getActiveAccount()!,
    scopes: authScopes,
    interactionType: InteractionType.Popup,
  }
);
