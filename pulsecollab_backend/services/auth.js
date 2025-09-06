import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'pulsecollab_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export class AuthService {
  constructor() {
    this.users = new Map(); // In production, use a database
    this.sessions = new Map();
    this.refreshTokens = new Map();
  }

  // Register new user
  async register(userData) {
    const { email, password, name, avatar } = userData;
    
    // Check if user already exists
    if (this.getUserByEmail(email)) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = {
      id: uuidv4(),
      email,
      name,
      avatar: avatar || '',
      password: hashedPassword,
      isActive: true,
      isVerified: true, // In production, implement email verification
      createdAt: new Date(),
      lastLoginAt: null,
      settings: {
        theme: 'light',
        notifications: {
          email: true,
          desktop: true,
          sound: true
        },
        privacy: {
          showOnlineStatus: true,
          allowDirectMessages: true
        }
      }
    };

    this.users.set(user.id, user);
    return this.sanitizeUser(user);
  }

  // Login user
  async login(email, password) {
    const user = this.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is disabled');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store session
    const session = {
      id: uuidv4(),
      userId: user.id,
      accessToken,
      refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      userAgent: '',
      ipAddress: ''
    };

    this.sessions.set(session.id, session);
    this.refreshTokens.set(refreshToken, user.id);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
      sessionId: session.id
    };
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    const userId = this.refreshTokens.get(refreshToken);
    if (!userId) {
      throw new Error('Invalid refresh token');
    }

    const user = this.users.get(userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    const accessToken = this.generateAccessToken(user);
    return { accessToken };
  }

  // Logout
  async logout(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);
      this.refreshTokens.delete(session.refreshToken);
    }
  }

  // Verify access token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = this.users.get(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return this.sanitizeUser(user);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Generate access token
  generateAccessToken(user) {
    return jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  // Generate refresh token
  generateRefreshToken(user) {
    return jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // Get user by email
  getUserByEmail(email) {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  // Get user by ID
  getUserById(id) {
    return this.users.get(id);
  }

  // Update user profile
  async updateProfile(userId, updates) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const allowedFields = ['name', 'avatar', 'settings'];
    const filteredUpdates = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    Object.assign(user, filteredUpdates);
    return this.sanitizeUser(user);
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 12);
    return true;
  }

  // Get user sessions
  getUserSessions(userId) {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .map(session => ({
        id: session.id,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress
      }));
  }

  // Revoke session
  revokeSession(userId, sessionId) {
    const session = this.sessions.get(sessionId);
    if (session && session.userId === userId) {
      this.sessions.delete(sessionId);
      this.refreshTokens.delete(session.refreshToken);
      return true;
    }
    return false;
  }

  // Clean up expired sessions
  cleanupExpiredSessions() {
    const now = new Date();
    for (const [sessionId, session] of this.sessions) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
        this.refreshTokens.delete(session.refreshToken);
      }
    }
  }

  // Remove sensitive data from user object
  sanitizeUser(user) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  // Create guest user for anonymous access
  createGuestUser(name = 'Guest') {
    const guest = {
      id: `guest_${uuidv4()}`,
      name: `${name}_${Math.random().toString(36).substr(2, 4)}`,
      isGuest: true,
      avatar: '',
      createdAt: new Date()
    };

    // Guests don't get stored permanently
    return guest;
  }

  // Two-Factor Authentication
  enable2FA(userId) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate secret key for TOTP
    const secret = crypto.randomBytes(20).toString('hex');
    user.twoFactorSecret = secret;
    user.twoFactorEnabled = false; // Will be enabled after verification

    // Generate QR code URL for authenticator apps
    const appName = 'PulseCollab';
    const qrCodeUrl = `otpauth://totp/${appName}:${user.email}?secret=${secret}&issuer=${appName}`;

    return {
      secret,
      qrCodeUrl,
      backupCodes: this.generateBackupCodes(userId)
    };
  }

  verify2FA(userId, token) {
    const user = this.users.get(userId);
    if (!user || !user.twoFactorSecret) {
      throw new Error('2FA not set up for this user');
    }

    // Simple TOTP verification (in production, use a proper library like speakeasy)
    const isValid = this.verifyTOTP(user.twoFactorSecret, token);
    
    if (isValid) {
      user.twoFactorEnabled = true;
      return { success: true, message: '2FA enabled successfully' };
    } else {
      throw new Error('Invalid 2FA token');
    }
  }

  disable2FA(userId, token) {
    const user = this.users.get(userId);
    if (!user || !user.twoFactorEnabled) {
      throw new Error('2FA is not enabled for this user');
    }

    const isValid = this.verifyTOTP(user.twoFactorSecret, token);
    
    if (isValid) {
      user.twoFactorEnabled = false;
      user.twoFactorSecret = null;
      user.backupCodes = null;
      return { success: true, message: '2FA disabled successfully' };
    } else {
      throw new Error('Invalid 2FA token');
    }
  }

  generateBackupCodes(userId) {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    
    const user = this.users.get(userId);
    if (user) {
      user.backupCodes = codes;
    }
    
    return codes;
  }

  verifyTOTP(secret, token) {
    // Simple TOTP implementation - in production use speakeasy or similar
    const window = Math.floor(Date.now() / 30000);
    const expectedToken = this.generateTOTP(secret, window);
    
    // Check current window and previous/next window for clock skew
    return token === expectedToken || 
           token === this.generateTOTP(secret, window - 1) ||
           token === this.generateTOTP(secret, window + 1);
  }

  generateTOTP(secret, counter) {
    const key = Buffer.from(secret, 'hex');
    const time = Buffer.alloc(8);
    time.writeUInt32BE(counter, 4);
    
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(time);
    const digest = hmac.digest();
    
    const offset = digest[digest.length - 1] & 0x0f;
    const binary = (digest[offset] & 0x7f) << 24 |
                   (digest[offset + 1] & 0xff) << 16 |
                   (digest[offset + 2] & 0xff) << 8 |
                   (digest[offset + 3] & 0xff);
    
    const otp = (binary % 1000000).toString().padStart(6, '0');
    return otp;
  }

  // Password reset functionality
  generatePasswordResetToken(email) {
    const user = this.getUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = expires;

    return resetToken;
  }

  resetPassword(token, newPassword) {
    const user = Array.from(this.users.values()).find(u => 
      u.passwordResetToken === token && 
      u.passwordResetExpires > new Date()
    );

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    user.password = bcrypt.hashSync(newPassword, 12);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    return this.sanitizeUser(user);
  }
}

export const authService = new AuthService();

// Middleware for authentication
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = authService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Optional authentication (for guest access)
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const user = authService.verifyToken(token);
      req.user = user;
    } catch (error) {
      // Continue as guest if token is invalid
      req.user = null;
    }
  }
  
  next();
};
