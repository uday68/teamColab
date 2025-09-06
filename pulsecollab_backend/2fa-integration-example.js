// Example integration with existing authentication system
import { authService } from './services/auth.js';
import { notificationService } from './services/notification.js';

// Enhanced login with 2FA support
async function enhancedLogin(email, password, twoFactorCode = null) {
  try {
    // Step 1: Regular authentication
    const loginResult = await authService.login(email, password);
    const user = loginResult.user;
    
    // Step 2: Check if 2FA is enabled
    if (notificationService.is2FAEnabled(user.id)) {
      
      if (!twoFactorCode) {
        // Send 2FA code and require verification
        await notificationService.send2FACode(user.id, user.email, 'login');
        
        return {
          success: false,
          requires2FA: true,
          message: 'Two-factor authentication required',
          userId: user.id
        };
      } else {
        // Verify 2FA code
        const verifyResult = notificationService.verify2FACode(user.id, twoFactorCode, 'login');
        
        if (!verifyResult.success) {
          return {
            success: false,
            requires2FA: true,
            message: verifyResult.message,
            error: verifyResult.error,
            attemptsRemaining: verifyResult.attemptsRemaining
          };
        }
      }
    }
    
    // Step 3: Login successful (with or without 2FA)
    return {
      success: true,
      user: loginResult.user,
      token: loginResult.token,
      message: 'Login successful'
    };
    
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// Enhanced sensitive action with 2FA verification
async function performSensitiveAction(userId, action, actionData, twoFactorCode = null) {
  try {
    // Check if user has 2FA enabled
    if (notificationService.is2FAEnabled(userId)) {
      
      if (!twoFactorCode) {
        // Get user email from database/session
        const user = await authService.getUserById(userId);
        
        // Send verification code for this action
        await notificationService.send2FACode(userId, user.email, action);
        
        return {
          success: false,
          requires2FA: true,
          message: `Verification code sent for action: ${action}`,
          action
        };
      } else {
        // Verify the code for this specific action
        const verifyResult = notificationService.verify2FACode(userId, twoFactorCode, action);
        
        if (!verifyResult.success) {
          return {
            success: false,
            requires2FA: true,
            message: verifyResult.message,
            error: verifyResult.error,
            action
          };
        }
      }
    }
    
    // Perform the actual sensitive action
    const actionResult = await performAction(action, actionData, userId);
    
    return {
      success: true,
      message: `Action "${action}" completed successfully`,
      result: actionResult
    };
    
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// Mock action performer
async function performAction(action, data, userId) {
  switch (action) {
    case 'delete_account':
      return { deleted: true, userId };
    case 'change_password':
      return { passwordChanged: true, userId };
    case 'transfer_ownership':
      return { transferred: true, from: userId, to: data.newOwner };
    default:
      return { action, data, userId };
  }
}

// Example API integration
export function setup2FARoutes(app) {
  // Enhanced login endpoint
  app.post('/api/auth/login-with-2fa', async (req, res) => {
    const { email, password, twoFactorCode } = req.body;
    
    const result = await enhancedLogin(email, password, twoFactorCode);
    
    if (result.success) {
      res.json(result);
    } else if (result.requires2FA) {
      res.status(200).json(result); // 200 because it's not an error, just needs 2FA
    } else {
      res.status(401).json(result);
    }
  });

  // Sensitive action endpoint
  app.post('/api/actions/sensitive', async (req, res) => {
    const { action, data, twoFactorCode } = req.body;
    const userId = req.user?.id; // Assume user is authenticated
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const result = await performSensitiveAction(userId, action, data, twoFactorCode);
    
    if (result.success) {
      res.json(result);
    } else if (result.requires2FA) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  });

  // 2FA setup endpoint for new users
  app.post('/api/auth/setup-2fa', async (req, res) => {
    const { userId, email, name } = req.body;
    
    try {
      const result = await notificationService.enable2FA(userId, email, name);
      
      res.json({
        success: true,
        message: '2FA enabled successfully',
        backupCodes: result.backupCodes,
        important: 'Please save these backup codes in a safe place!'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  console.log('🔐 Enhanced 2FA integration routes added:');
  console.log('  POST /api/auth/login-with-2fa');
  console.log('  POST /api/actions/sensitive');
  console.log('  POST /api/auth/setup-2fa');
}

// Example usage in real application
export function example2FAUsage() {
  console.log(`
╔══════════════════════════════════════╗
║         2FA INTEGRATION EXAMPLE      ║
╚══════════════════════════════════════╝

Frontend Login Flow:
1. User enters email/password
2. Frontend calls: POST /api/auth/login-with-2fa
3. If requires2FA: true, show 2FA input form
4. User enters code from email
5. Frontend calls same endpoint with code
6. Success: user is logged in

Sensitive Action Flow:
1. User tries to delete account
2. Frontend calls: POST /api/actions/sensitive
3. If requires2FA: true, show verification form
4. User enters code from email
5. Frontend calls same endpoint with code
6. Success: action is performed

Backend Integration:
// In your route handlers
const loginResult = await enhancedLogin(email, password, code);
const actionResult = await performSensitiveAction(userId, 'delete_account', {}, code);

Security Features:
✅ Automatic 2FA check for enabled users
✅ Action-specific verification codes
✅ Backup code support
✅ Attempt limiting and expiration
✅ Comprehensive logging
✅ Beautiful email templates
  `);
}

export { enhancedLogin, performSensitiveAction };
