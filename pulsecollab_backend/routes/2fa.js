// 2FA API endpoints
import { notificationService } from '../services/notification.js';

export const twoFactorRoutes = (app) => {
  
  // Enable 2FA for user
  app.post('/api/2fa/enable', async (req, res) => {
    try {
      const { userId, email, name } = req.body;
      
      if (!userId || !email || !name) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, email, name'
        });
      }

      const result = await notificationService.enable2FA(userId, email, name);
      
      res.json({
        success: true,
        message: '2FA enabled successfully',
        backupCodes: result.backupCodes
      });
    } catch (error) {
      console.error('2FA enable error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enable 2FA'
      });
    }
  });

  // Disable 2FA for user
  app.post('/api/2fa/disable', async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: userId'
        });
      }

      const result = notificationService.disable2FA(userId);
      
      res.json({
        success: true,
        message: '2FA disabled successfully'
      });
    } catch (error) {
      console.error('2FA disable error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to disable 2FA'
      });
    }
  });

  // Send 2FA verification code
  app.post('/api/2fa/send-code', async (req, res) => {
    try {
      const { userId, email, purpose = 'login' } = req.body;
      
      if (!userId || !email) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, email'
        });
      }

      if (!notificationService.is2FAEnabled(userId)) {
        return res.status(400).json({
          success: false,
          message: '2FA is not enabled for this user'
        });
      }

      const result = await notificationService.send2FACode(userId, email, purpose);
      
      res.json(result);
    } catch (error) {
      console.error('2FA send code error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification code'
      });
    }
  });

  // Verify 2FA code
  app.post('/api/2fa/verify', async (req, res) => {
    try {
      const { userId, code, purpose = 'login' } = req.body;
      
      if (!userId || !code) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, code'
        });
      }

      const result = notificationService.verify2FACode(userId, code, purpose);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Verification successful',
          verified: true
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('2FA verify error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify code'
      });
    }
  });

  // Use backup code
  app.post('/api/2fa/backup-code', async (req, res) => {
    try {
      const { userId, backupCode } = req.body;
      
      if (!userId || !backupCode) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, backupCode'
        });
      }

      const result = notificationService.useBackupCode(userId, backupCode);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('2FA backup code error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify backup code'
      });
    }
  });

  // Get 2FA status
  app.get('/api/2fa/status/:userId', (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Missing userId parameter'
        });
      }

      const status = notificationService.get2FAStatus(userId);
      const settings = notificationService.get2FASettings(userId);
      
      res.json({
        success: true,
        status: {
          ...status,
          ...settings
        }
      });
    } catch (error) {
      console.error('2FA status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get 2FA status'
      });
    }
  });

  // Get 2FA settings
  app.get('/api/2fa/settings/:userId', (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Missing userId parameter'
        });
      }

      const settings = notificationService.get2FASettings(userId);
      
      res.json({
        success: true,
        settings
      });
    } catch (error) {
      console.error('2FA settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get 2FA settings'
      });
    }
  });

  // Generate new backup codes
  app.post('/api/2fa/regenerate-backup-codes', (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: userId'
        });
      }

      const settings = notificationService.twoFactorSettings.get(userId);
      if (!settings || !settings.enabled) {
        return res.status(400).json({
          success: false,
          message: '2FA is not enabled for this user'
        });
      }

      // Generate new backup codes
      const newBackupCodes = notificationService.generateBackupCodes();
      settings.backupCodes = newBackupCodes;
      
      res.json({
        success: true,
        message: 'New backup codes generated',
        backupCodes: newBackupCodes
      });
    } catch (error) {
      console.error('2FA regenerate backup codes error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to regenerate backup codes'
      });
    }
  });

  console.log('📱 2FA API endpoints registered:');
  console.log('  POST /api/2fa/enable');
  console.log('  POST /api/2fa/disable');
  console.log('  POST /api/2fa/send-code');
  console.log('  POST /api/2fa/verify');
  console.log('  POST /api/2fa/backup-code');
  console.log('  GET  /api/2fa/status/:userId');
  console.log('  GET  /api/2fa/settings/:userId');
  console.log('  POST /api/2fa/regenerate-backup-codes\n');
};

export default twoFactorRoutes;
