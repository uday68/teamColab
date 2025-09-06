// Simple 2FA integration example
import express from 'express';
import { notificationService } from './services/notification.js';

const app = express();
app.use(express.json());

console.log('🔐 PulseCollab 2FA Demo Server Starting...\n');

// Simulate user registration with 2FA setup
app.post('/demo/register-with-2fa', async (req, res) => {
  const { email, name } = req.body;
  const userId = `user_${Date.now()}`;
  
  try {
    console.log(`\n📝 Registering user: ${name} (${email})`);
    
    // Enable 2FA during registration
    const result = await notificationService.enable2FA(userId, email, name);
    
    res.json({
      success: true,
      userId,
      message: '2FA enabled during registration',
      backupCodes: result.backupCodes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simulate login with 2FA
app.post('/demo/login', async (req, res) => {
  const { userId, email, step } = req.body;
  
  try {
    if (step === '1') {
      // Step 1: Check if 2FA is enabled and send code
      console.log(`\n🔑 Login attempt for user: ${userId}`);
      
      if (!notificationService.is2FAEnabled(userId)) {
        return res.json({
          success: true,
          message: 'Login successful (no 2FA)',
          requiresVerification: false
        });
      }
      
      // Send 2FA code
      await notificationService.send2FACode(userId, email, 'login');
      
      res.json({
        success: true,
        message: '2FA code sent to your email',
        requiresVerification: true,
        step: 2
      });
      
    } else if (step === '2') {
      // Step 2: Verify the 2FA code
      const { code } = req.body;
      console.log(`\n✅ Verifying 2FA code for user: ${userId}`);
      
      const verifyResult = notificationService.verify2FACode(userId, code, 'login');
      
      if (verifyResult.success) {
        res.json({
          success: true,
          message: 'Login successful!',
          verified: true,
          token: `mock_jwt_token_${userId}` // In real app, generate JWT
        });
      } else {
        res.status(400).json(verifyResult);
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simulate sensitive action requiring 2FA
app.post('/demo/sensitive-action', async (req, res) => {
  const { userId, email, action } = req.body;
  
  try {
    console.log(`\n🔐 Sensitive action requested: ${action} by user: ${userId}`);
    
    if (!notificationService.is2FAEnabled(userId)) {
      return res.status(400).json({
        error: '2FA is required for this action'
      });
    }
    
    // Send verification code for sensitive action
    await notificationService.send2FACode(userId, email, action);
    
    res.json({
      success: true,
      message: `Verification code sent for action: ${action}`,
      requiresVerification: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify sensitive action
app.post('/demo/verify-action', async (req, res) => {
  const { userId, code, action } = req.body;
  
  try {
    console.log(`\n✅ Verifying action: ${action} for user: ${userId}`);
    
    const verifyResult = notificationService.verify2FACode(userId, code, action);
    
    if (verifyResult.success) {
      console.log(`🎉 Action "${action}" completed successfully!`);
      res.json({
        success: true,
        message: `Action "${action}" completed successfully`,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json(verifyResult);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's 2FA status
app.get('/demo/2fa-status/:userId', (req, res) => {
  const { userId } = req.params;
  
  const status = notificationService.get2FAStatus(userId);
  const settings = notificationService.get2FASettings(userId);
  
  res.json({
    userId,
    status,
    settings
  });
});

// Demo backup code usage
app.post('/demo/use-backup-code', (req, res) => {
  const { userId, backupCode } = req.body;
  
  try {
    console.log(`\n🔑 Using backup code for user: ${userId}`);
    
    const result = notificationService.useBackupCode(userId, backupCode);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Backup code verified successfully',
        remainingCodes: result.remainingCodes
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start cleanup interval
setInterval(() => {
  notificationService.cleanup2FACodes();
}, 60000); // Clean up every minute

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 2FA Demo Server running on http://localhost:${PORT}`);
  console.log('\n📚 Available Demo Endpoints:');
  console.log('  POST /demo/register-with-2fa   - Register user with 2FA');
  console.log('  POST /demo/login               - Login with 2FA verification');
  console.log('  POST /demo/sensitive-action    - Perform action requiring 2FA');
  console.log('  POST /demo/verify-action       - Verify sensitive action');
  console.log('  GET  /demo/2fa-status/:userId  - Get 2FA status');
  console.log('  POST /demo/use-backup-code     - Use backup code');
  console.log('\n💡 2FA codes will be displayed in this terminal!');
  console.log('🔒 Ready for 2FA demonstrations!\n');
});

export default app;
