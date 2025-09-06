// Notification Service for email, push, and in-app notifications
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

export class NotificationService {
  constructor() {
    this.notifications = new Map(); // In-app notifications storage
    this.subscriptions = new Map(); // Push notification subscriptions
    this.emailTransporter = this.setupEmailTransporter();
    this.templates = this.setupTemplates();
  }

  setupEmailTransporter() {
    // Configure email transporter (use environment variables in production)
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'demo@pulsecollab.com',
        pass: process.env.SMTP_PASS || 'demo_password'
      }
    });
  }

  setupTemplates() {
    return {
      welcome: {
        subject: 'Welcome to PulseCollab! 🚀',
        html: (data) => `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3A86FF, #8338EC); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to PulseCollab!</h1>
              <p style="color: #E8F4FF; margin: 10px 0 0 0; font-size: 16px;">Your team collaboration journey starts now</p>
            </div>
            <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.name}! 👋</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                You're all set to start collaborating with your team. Here's what you can do right away:
              </p>
              <ul style="color: #666; line-height: 1.8; margin-bottom: 30px;">
                <li>🎯 Create your first project and invite team members</li>
                <li>💬 Start a video call or chat with your team</li>
                <li>📝 Use our collaborative whiteboard for brainstorming</li>
                <li>📊 Track progress with built-in analytics</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.dashboardUrl}" style="background: linear-gradient(135deg, #3A86FF, #8338EC); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  Go to Dashboard
                </a>
              </div>
              <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                Need help? Reply to this email or check our <a href="${data.helpUrl}" style="color: #3A86FF;">help center</a>.
              </p>
            </div>
          </div>
        `
      },
      taskAssigned: {
        subject: 'New task assigned: {{taskTitle}}',
        html: (data) => `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #3A86FF; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📋 New Task Assigned</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 15px;">${data.taskTitle}</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">${data.taskDescription}</p>
              <div style="background: #F8F9FA; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0; color: #666;"><strong>Project:</strong> ${data.projectName}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Assigned by:</strong> ${data.assignedBy}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Due date:</strong> ${data.dueDate}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Priority:</strong> <span style="color: ${data.priorityColor};">${data.priority}</span></p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.taskUrl}" style="background: #3A86FF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  View Task
                </a>
              </div>
            </div>
          </div>
        `
      },
      meetingReminder: {
        subject: 'Meeting reminder: {{meetingTitle}}',
        html: (data) => `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #8338EC; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🕐 Meeting Reminder</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 15px;">${data.meetingTitle}</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Your meeting starts in ${data.timeUntil}.</p>
              <div style="background: #F8F9FA; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0; color: #666;"><strong>Time:</strong> ${data.startTime}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Duration:</strong> ${data.duration}</p>
                <p style="margin: 5px 0; color: #666;"><strong>Participants:</strong> ${data.participants}</p>
                ${data.agenda ? `<p style="margin: 5px 0; color: #666;"><strong>Agenda:</strong> ${data.agenda}</p>` : ''}
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.meetingUrl}" style="background: #8338EC; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  Join Meeting
                </a>
              </div>
            </div>
          </div>
        `
      },
      digestDaily: {
        subject: 'Your daily PulseCollab digest',
        html: (data) => `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #06D6A0, #3A86FF); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📊 Daily Digest</h1>
              <p style="color: #E8F4FF; margin: 10px 0 0 0;">${data.date}</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.name}! Here's your daily summary:</h2>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div style="background: #F0F8FF; padding: 20px; border-radius: 8px; text-align: center;">
                  <h3 style="color: #3A86FF; margin: 0; font-size: 24px;">${data.tasksCompleted}</h3>
                  <p style="color: #666; margin: 5px 0 0 0;">Tasks Completed</p>
                </div>
                <div style="background: #F0F8FF; padding: 20px; border-radius: 8px; text-align: center;">
                  <h3 style="color: #8338EC; margin: 0; font-size: 24px;">${data.messagesReceived}</h3>
                  <p style="color: #666; margin: 5px 0 0 0;">Messages</p>
                </div>
              </div>

              ${data.upcomingTasks.length > 0 ? `
                <div style="margin: 30px 0;">
                  <h3 style="color: #333; margin-bottom: 15px;">📋 Upcoming Tasks</h3>
                  ${data.upcomingTasks.map(task => `
                    <div style="background: #FFF8E1; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #FFD166;">
                      <strong style="color: #333;">${task.title}</strong>
                      <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Due: ${task.dueDate}</p>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.dashboardUrl}" style="background: linear-gradient(135deg, #3A86FF, #8338EC); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  View Dashboard
                </a>
              </div>
            </div>
          </div>
        `
      }
    };
  }

  // Send email notification
  async sendEmail(to, templateName, data) {
    try {
      const template = this.templates[templateName];
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      const subject = template.subject.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
      const html = template.html(data);

      const mailOptions = {
        from: `"PulseCollab" <${process.env.SMTP_FROM || 'noreply@pulsecollab.com'}>`,
        to,
        subject,
        html
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log('Email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  }

  // Create in-app notification
  createNotification(userId, data) {
    const notification = {
      id: uuidv4(),
      userId,
      type: data.type || 'info',
      title: data.title,
      message: data.message,
      icon: data.icon || '📢',
      actionUrl: data.actionUrl,
      read: false,
      createdAt: new Date(),
      metadata: data.metadata || {}
    };

    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }

    const userNotifications = this.notifications.get(userId);
    userNotifications.unshift(notification);

    // Keep only last 100 notifications per user
    if (userNotifications.length > 100) {
      userNotifications.splice(100);
    }

    return notification;
  }

  // Get user notifications
  getUserNotifications(userId, { limit = 50, offset = 0, unreadOnly = false } = {}) {
    const userNotifications = this.notifications.get(userId) || [];
    
    let filtered = userNotifications;
    if (unreadOnly) {
      filtered = userNotifications.filter(n => !n.read);
    }

    return {
      notifications: filtered.slice(offset, offset + limit),
      total: filtered.length,
      unreadCount: userNotifications.filter(n => !n.read).length
    };
  }

  // Mark notification as read
  markAsRead(userId, notificationId) {
    const userNotifications = this.notifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      return notification;
    }
    
    return null;
  }

  // Mark all notifications as read
  markAllAsRead(userId) {
    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.forEach(notification => {
      notification.read = true;
    });
    
    return { success: true, count: userNotifications.length };
  }

  // Delete notification
  deleteNotification(userId, notificationId) {
    const userNotifications = this.notifications.get(userId) || [];
    const index = userNotifications.findIndex(n => n.id === notificationId);
    
    if (index >= 0) {
      userNotifications.splice(index, 1);
      return true;
    }
    
    return false;
  }

  // Send push notification (Web Push API)
  async sendPushNotification(userId, data) {
    try {
      const subscription = this.subscriptions.get(userId);
      if (!subscription) {
        console.log(`No push subscription found for user ${userId}`);
        return null;
      }

      // In production, use web-push library
      const payload = JSON.stringify({
        title: data.title,
        body: data.message,
        icon: '/favicon.ico',
        badge: '/badge.png',
        data: {
          url: data.actionUrl,
          timestamp: Date.now()
        }
      });

      // Simulate push notification for demo
      console.log(`Push notification sent to ${userId}:`, payload);
      return { success: true };

    } catch (error) {
      console.error('Push notification error:', error);
      throw error;
    }
  }

  // Subscribe to push notifications
  subscribeToPush(userId, subscription) {
    this.subscriptions.set(userId, subscription);
    return { success: true };
  }

  // Unsubscribe from push notifications
  unsubscribeFromPush(userId) {
    this.subscriptions.delete(userId);
    return { success: true };
  }

  // Send notification to multiple channels
  async sendMultiChannelNotification(userId, data, channels = ['inApp']) {
    const results = {};

    try {
      // In-app notification
      if (channels.includes('inApp')) {
        results.inApp = this.createNotification(userId, data);
      }

      // Email notification
      if (channels.includes('email') && data.email) {
        results.email = await this.sendEmail(data.email, data.emailTemplate || 'taskAssigned', data);
      }

      // Push notification
      if (channels.includes('push')) {
        results.push = await this.sendPushNotification(userId, data);
      }

      return results;
    } catch (error) {
      console.error('Multi-channel notification error:', error);
      throw error;
    }
  }

  // Notification preferences
  updateNotificationPreferences(userId, preferences) {
    // Store user notification preferences
    // In production, save to database
    return {
      userId,
      preferences: {
        email: preferences.email !== false,
        push: preferences.push !== false,
        inApp: preferences.inApp !== false,
        digest: preferences.digest !== false,
        marketing: preferences.marketing === true
      }
    };
  }

  // Clean up old notifications
  cleanupOldNotifications() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    for (const [userId, notifications] of this.notifications) {
      const filtered = notifications.filter(n => n.createdAt > thirtyDaysAgo);
      this.notifications.set(userId, filtered);
    }
    
    console.log('Old notifications cleaned up');
  }
}

export const notificationService = new NotificationService();
