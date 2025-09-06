# 🔐 PulseCollab 2FA Implementation

This implementation adds Two-Factor Authentication (2FA) to the PulseCollab notification service with dummy codes that are visible in the terminal backend for testing purposes.

## 🚀 Features

- **Email-based 2FA codes** - 6-digit verification codes sent via email
- **Backup codes** - 8 backup codes for emergency access
- **Multiple verification contexts** - Different codes for login, password reset, etc.
- **Security logging** - All 2FA activities logged to terminal with ASCII art
- **Expiration handling** - Codes expire after 5 minutes
- **Attempt limiting** - Maximum 3 verification attempts per code
- **Priority notifications** - In-app notifications for 2FA events

## 📁 Files Added/Modified

### New Files:
- `routes/2fa.js` - API endpoints for 2FA operations
- `demo-2fa.js` - Comprehensive demo script
- `demo-server.js` - Standalone demo server
- `test-2fa.js` - Test script with examples

### Modified Files:
- `services/notification.js` - Added 2FA functionality
- `index.js` - Integrated 2FA routes

## 🔧 API Endpoints

### Enable 2FA
```bash
POST /api/2fa/enable
{
  "userId": "user_123",
  "email": "user@example.com",
  "name": "User Name"
}
```

### Send Verification Code
```bash
POST /api/2fa/send-code
{
  "userId": "user_123",
  "email": "user@example.com",
  "purpose": "login"
}
```

### Verify Code
```bash
POST /api/2fa/verify
{
  "userId": "user_123",
  "code": "123456",
  "purpose": "login"
}
```

### Check 2FA Status
```bash
GET /api/2fa/status/:userId
```

### Use Backup Code
```bash
POST /api/2fa/backup-code
{
  "userId": "user_123",
  "backupCode": "ABCD1234"
}
```

### Disable 2FA
```bash
POST /api/2fa/disable
{
  "userId": "user_123"
}
```

## 🧪 Testing the Implementation

### Method 1: Run the Test Script
```bash
node test-2fa.js
```

### Method 2: Run the Demo Server
```bash
node demo-server.js
```

Then test with curl:
```bash
# Register user with 2FA
curl -X POST http://localhost:3001/demo/register-with-2fa \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'

# Login step 1 (request 2FA code)
curl -X POST http://localhost:3001/demo/login \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_123", "email": "test@example.com", "step": "1"}'

# Login step 2 (verify code - check terminal for the code)
curl -X POST http://localhost:3001/demo/login \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_123", "code": "123456", "step": "2"}'
```

### Method 3: Run the Comprehensive Demo
```bash
node demo-2fa.js
```

## 🎯 Key Features Demonstrated

### 1. Code Generation and Display
When a 2FA code is generated, it appears in the terminal like this:
```
╔══════════════════════════════════════╗
║           2FA CODE GENERATED         ║
╠══════════════════════════════════════╣
║ User ID: user_123                    ║
║ Email:   test@example.com            ║
║ Code:    456789                      ║
║ Purpose: login                       ║
║ Expires: 3:45:23 PM                  ║
╚══════════════════════════════════════╝
```

### 2. Verification Success
```
╔══════════════════════════════════════╗
║        2FA VERIFICATION SUCCESS       ║
╠══════════════════════════════════════╣
║ User ID: user_123                    ║
║ Code:    456789                      ║
║ Purpose: login                       ║
║ Time:    3:46:15 PM                  ║
╚══════════════════════════════════════╝
```

### 3. Email Templates
The system includes beautiful HTML email templates for:
- **2FA verification codes** - Secure code delivery
- **2FA enabled confirmation** - Account security notification

### 4. Security Features
- **Code expiration** - 5 minutes validity
- **Attempt limiting** - Maximum 3 attempts
- **Purpose validation** - Codes tied to specific actions
- **Backup codes** - Emergency access method
- **Comprehensive logging** - All activities tracked

## 🔒 Security Considerations

### Current Implementation (Demo/Testing)
- Codes visible in terminal for testing
- Mock email sending (logs instead of actual emails)
- In-memory storage (codes lost on restart)

### Production Recommendations
1. **Use real SMTP** for email delivery
2. **Store codes in Redis** with expiration
3. **Implement rate limiting** for code requests
4. **Add TOTP support** (Google Authenticator, etc.)
5. **Encrypt backup codes** before storage
6. **Add audit logging** to database
7. **Implement progressive delays** for failed attempts

## 🎨 Integration with Frontend

The 2FA system provides comprehensive status information:

```javascript
// Get user's 2FA status
const status = await fetch('/api/2fa/status/user_123');
const data = await status.json();

console.log(data);
// {
//   "enabled": true,
//   "pendingVerification": true,
//   "expiresAt": "2025-09-06T15:50:00Z",
//   "attemptsUsed": 1,
//   "purpose": "login"
// }
```

## 🛠️ Customization

### Adding New Verification Contexts
```javascript
// Send code for custom purpose
await notificationService.send2FACode(userId, email, 'delete_account');

// Verify with matching purpose
const result = notificationService.verify2FACode(userId, code, 'delete_account');
```

### Custom Email Templates
Add new templates to the `setupTemplates()` method in `notification.js`.

### Adjusting Security Parameters
Modify these values in the notification service:
- Code expiration time (currently 5 minutes)
- Maximum attempts (currently 3)
- Code length (currently 6 digits)
- Backup code count (currently 8)

## 📊 Monitoring and Analytics

The system provides comprehensive logging for:
- Code generation events
- Verification attempts (success/failure)
- Backup code usage
- 2FA enable/disable events
- Security violations

## 🚀 Next Steps

To make this production-ready:

1. **Replace dummy email with real SMTP**
2. **Add database persistence**
3. **Implement proper session management**
4. **Add rate limiting middleware**
5. **Integrate with authentication middleware**
6. **Add comprehensive error handling**
7. **Implement audit trails**
8. **Add TOTP as alternative to email**

## 🎉 Ready to Use!

The 2FA system is now fully integrated and ready for testing. Run any of the demo scripts to see it in action!

```bash
# Quick test
node test-2fa.js

# Interactive demo server
node demo-server.js

# Full feature demonstration
node demo-2fa.js
```

Watch the terminal for the beautiful 2FA code displays! 🔐✨
