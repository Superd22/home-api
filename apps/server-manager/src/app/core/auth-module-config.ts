import { OAuthModuleConfig } from 'angular-oauth2-oidc';

export const authModuleConfig: OAuthModuleConfig = {
  resourceServer: {
    allowedUrls: ['http://localhost:3000', 'https://api.home.davidfain.com'],
    sendAccessToken: true,
  }
};