// Demo script to test 2FA functionality
import { notificationService } from './services/notification.js';

async function demo2FA() {
  console.log('🚀 Starting 2FA Demo...\n');

  const userId = 'user_123';
  const userEmail = 'demo@pulsecollab.com';
  const userName = 'Demo User';

  try {
    // 1. Enable 2FA for user
    console.log('📝 Step 1: Enabling 2FA...');
    const enableResult = await notificationService.enable2FA(userId, userEmail, userName);
    console.log('✅ 2FA Enabled:', enableResult.success);
    console.log('🔑 Backup codes generated:', enableResult.backupCodes.length);
    console.log('\n');

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Send 2FA code
    console.log('📧 Step 2: Sending 2FA code...');
    const sendResult = await notificationService.send2FACode(userId, userEmail, 'login');
    console.log('✅ Code sent:', sendResult.success);
    console.log('\n');

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Get the code from terminal output (in real app, user would enter this)
    console.log('🔍 Step 3: Simulating code verification...');
    
    // Simulate wrong code first
    console.log('❌ Testing wrong code:');
    const wrongResult = notificationService.verify2FACode(userId, '123456', 'login');
    console.log('Result:', wrongResult.message);
    console.log('\n');

    // Get the actual code (in demo, we'll access it directly)
    const actualCodeData = notificationService.twoFactorCodes.get(userId);
    if (actualCodeData) {
      console.log('✅ Testing correct code:');
      const correctResult = notificationService.verify2FACode(userId, actualCodeData.code, 'login');
      console.log('Result:', correctResult.message);
      console.log('\n');
    }

    // 4. Test backup code
    console.log('🔑 Step 4: Testing backup code...');
    const settings = notificationService.get2FASettings(userId);
    if (settings.hasBackupCodes) {
      const backupCodes = notificationService.twoFactorSettings.get(userId).backupCodes;
      const testBackupCode = backupCodes[0];
      console.log(`Testing backup code: ${testBackupCode}`);
      const backupResult = notificationService.useBackupCode(userId, testBackupCode);
      console.log('Backup code result:', backupResult.message);
      console.log('Remaining backup codes:', backupResult.remainingCodes);
      console.log('\n');
    }

    // 5. Get 2FA status
    console.log('📊 Step 5: Getting 2FA status...');
    const status = notificationService.get2FAStatus(userId);
    console.log('2FA Status:', JSON.stringify(status, null, 2));
    console.log('\n');

    // 6. Test expired code scenario
    console.log('⏰ Step 6: Testing expired code scenario...');
    await notificationService.send2FACode(userId, userEmail, 'password_reset');
    
    // Manually expire the code for demo
    const codeData = notificationService.twoFactorCodes.get(userId);
    if (codeData) {
      codeData.expiryTime = new Date(Date.now() - 1000); // Expire 1 second ago
      const expiredResult = notificationService.verify2FACode(userId, codeData.code, 'password_reset');
      console.log('Expired code result:', expiredResult.message);
    }
    console.log('\n');

    // 7. Cleanup demo
    console.log('🧹 Step 7: Cleaning up...');
    notificationService.disable2FA(userId);
    console.log('✅ Demo completed successfully!');

  } catch (error) {
    console.error('❌ Demo error:', error);
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  demo2FA();
}

export { demo2FA };
