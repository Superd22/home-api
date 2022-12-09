import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  issuer: 'https://sso.davidfain.com/application/o/gameservers/',
  clientId: 'a862842ed2446603b2e68dd76e3149952e56fd26', // The "Auth Code + PKCE" client
  // responseType: 'code',
  redirectUri: window.location.origin + '/',
  strictDiscoveryDocumentValidation: false,
  // silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
  scope: 'openid profile email api offline_access', // Ask offline_access to support refresh token refreshes
  useSilentRefresh: false, // Needed for Code Flow to suggest using iframe-based refreshes
  sessionChecksEnabled: true,
  showDebugInformation: true, // Also requires enabling "Verbose" level in devtools
  clearHashAfterLogin: false, // https://github.com/manfredsteyer/angular-oauth2-oidc/issues/457#issuecomment-431807040,
  nonceStateSeparator : 'semicolon' // Real semicolon gets mangled by Duende ID Server's URI encoding
};