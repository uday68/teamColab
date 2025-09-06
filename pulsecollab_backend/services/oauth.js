// OAuth Service for Google, GitHub, Microsoft integration
import axios from 'axios';
import { authService } from './auth.js';
import { v4 as uuidv4 } from 'uuid';

export class OAuthService {
  constructor() {
    this.providers = {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:5173/auth/github/callback',
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userInfoUrl: 'https://api.github.com/user'
      },
      microsoft: {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:5173/auth/microsoft/callback',
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        userInfoUrl: 'https://graph.microsoft.com/v1.0/me'
      }
    };
  }

  // Generate OAuth authorization URL
  getAuthUrl(provider, state = null) {
    const config = this.providers[provider];
    if (!config || !config.clientId) {
      throw new Error(`OAuth provider ${provider} not configured`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: this.getScopes(provider),
      response_type: 'code',
      state: state || uuidv4()
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  // Get scopes for each provider
  getScopes(provider) {
    const scopes = {
      google: 'openid email profile',
      github: 'user:email',
      microsoft: 'openid email profile'
    };
    return scopes[provider] || '';
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(provider, code) {
    const config = this.providers[provider];
    if (!config) {
      throw new Error(`Invalid OAuth provider: ${provider}`);
    }

    const data = {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri
    };

    if (provider === 'microsoft') {
      data.grant_type = 'authorization_code';
    }

    try {
      const response = await axios.post(config.tokenUrl, data, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data;
    } catch (error) {
      console.error(`OAuth token exchange error for ${provider}:`, error.response?.data);
      throw new Error(`Failed to exchange code for token: ${error.message}`);
    }
  }

  // Get user information from OAuth provider
  async getUserInfo(provider, accessToken) {
    const config = this.providers[provider];
    if (!config) {
      throw new Error(`Invalid OAuth provider: ${provider}`);
    }

    try {
      const response = await axios.get(config.userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      return this.normalizeUserData(provider, response.data);
    } catch (error) {
      console.error(`OAuth user info error for ${provider}:`, error.response?.data);
      throw new Error(`Failed to get user info: ${error.message}`);
    }
  }

  // Normalize user data from different providers
  normalizeUserData(provider, userData) {
    switch (provider) {
      case 'google':
        return {
          providerId: userData.id,
          email: userData.email,
          name: userData.name,
          avatar: userData.picture,
          verified: userData.verified_email
        };
      
      case 'github':
        return {
          providerId: userData.id.toString(),
          email: userData.email,
          name: userData.name || userData.login,
          avatar: userData.avatar_url,
          verified: true // GitHub users are considered verified
        };
      
      case 'microsoft':
        return {
          providerId: userData.id,
          email: userData.mail || userData.userPrincipalName,
          name: userData.displayName,
          avatar: null, // Microsoft Graph doesn't provide avatar URL directly
          verified: true
        };
      
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  // Handle OAuth login/registration
  async handleOAuthCallback(provider, code) {
    try {
      // Exchange code for token
      const tokenData = await this.exchangeCodeForToken(provider, code);
      
      // Get user info
      const userData = await this.getUserInfo(provider, tokenData.access_token);
      
      // Check if user exists
      let user = authService.getUserByEmail(userData.email);
      
      if (!user) {
        // Register new user
        user = await authService.register({
          email: userData.email,
          name: userData.name,
          avatar: userData.avatar,
          password: uuidv4(), // Generate random password for OAuth users
          isOAuthUser: true,
          oauthProvider: provider,
          oauthProviderId: userData.providerId,
          isVerified: userData.verified
        });
      } else {
        // Update existing user with OAuth info
        await authService.updateProfile(user.id, {
          oauthProvider: provider,
          oauthProviderId: userData.providerId,
          avatar: userData.avatar || user.avatar
        });
      }

      // Generate authentication tokens
      const accessToken = authService.generateAccessToken(user);
      const refreshToken = authService.generateRefreshToken(user);

      // Store session
      const session = {
        id: uuidv4(),
        userId: user.id,
        accessToken,
        refreshToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        provider,
        oauthAccessToken: tokenData.access_token
      };

      authService.sessions.set(session.id, session);
      authService.refreshTokens.set(refreshToken, user.id);

      return {
        user: authService.sanitizeUser(user),
        accessToken,
        refreshToken,
        sessionId: session.id
      };

    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  }

  // Refresh OAuth token if needed
  async refreshOAuthToken(provider, refreshToken) {
    const config = this.providers[provider];
    if (!config || !refreshToken) {
      throw new Error('Invalid provider or refresh token');
    }

    try {
      const response = await axios.post(config.tokenUrl, {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      return response.data;
    } catch (error) {
      console.error(`OAuth token refresh error for ${provider}:`, error.response?.data);
      throw new Error('Failed to refresh OAuth token');
    }
  }

  // Link OAuth account to existing user
  async linkAccount(userId, provider, code) {
    try {
      const tokenData = await this.exchangeCodeForToken(provider, code);
      const userData = await this.getUserInfo(provider, tokenData.access_token);
      
      // Update user with OAuth provider info
      const user = await authService.updateProfile(userId, {
        [`${provider}ProviderId`]: userData.providerId,
        [`${provider}AccessToken`]: tokenData.access_token,
        avatar: userData.avatar || undefined
      });

      return {
        success: true,
        provider,
        providerUserId: userData.providerId
      };
    } catch (error) {
      console.error('Account linking error:', error);
      throw error;
    }
  }

  // Unlink OAuth account
  async unlinkAccount(userId, provider) {
    try {
      const updates = {};
      updates[`${provider}ProviderId`] = null;
      updates[`${provider}AccessToken`] = null;
      
      await authService.updateProfile(userId, updates);
      
      return { success: true, provider };
    } catch (error) {
      console.error('Account unlinking error:', error);
      throw error;
    }
  }
}

export const oauthService = new OAuthService();
