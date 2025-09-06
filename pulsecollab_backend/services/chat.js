// Chat service for managing messages and chat features
export class ChatService {
  constructor() {
    this.messages = new Map(); // roomId -> messages[]
    this.typingUsers = new Map(); // roomId -> Set of typing users
  }

  // Send a message
  sendMessage(roomId, message, sender) {
    if (!this.messages.has(roomId)) {
      this.messages.set(roomId, []);
    }

    const chatMessage = {
      id: this.generateMessageId(),
      text: message.text || '',
      type: message.type || 'text', // text, image, file, system
      sender: {
        id: sender.id,
        name: sender.name,
        avatar: sender.avatar || ''
      },
      timestamp: new Date(),
      reactions: new Map(),
      replyTo: message.replyTo || null,
      metadata: message.metadata || {}
    };

    this.messages.get(roomId).push(chatMessage);
    return chatMessage;
  }

  // Get messages for a room
  getMessages(roomId, limit = 50, offset = 0) {
    const roomMessages = this.messages.get(roomId) || [];
    return roomMessages
      .slice(-limit - offset, roomMessages.length - offset)
      .reverse();
  }

  // Add reaction to message
  addReaction(roomId, messageId, userId, emoji) {
    const roomMessages = this.messages.get(roomId);
    if (!roomMessages) return null;

    const message = roomMessages.find(m => m.id === messageId);
    if (!message) return null;

    if (!message.reactions.has(emoji)) {
      message.reactions.set(emoji, new Set());
    }

    message.reactions.get(emoji).add(userId);
    return message;
  }

  // Remove reaction from message
  removeReaction(roomId, messageId, userId, emoji) {
    const roomMessages = this.messages.get(roomId);
    if (!roomMessages) return null;

    const message = roomMessages.find(m => m.id === messageId);
    if (!message || !message.reactions.has(emoji)) return null;

    message.reactions.get(emoji).delete(userId);
    
    // Clean up empty reaction sets
    if (message.reactions.get(emoji).size === 0) {
      message.reactions.delete(emoji);
    }

    return message;
  }

  // Set typing status
  setTyping(roomId, userId, isTyping) {
    if (!this.typingUsers.has(roomId)) {
      this.typingUsers.set(roomId, new Set());
    }

    const typingSet = this.typingUsers.get(roomId);
    
    if (isTyping) {
      typingSet.add(userId);
    } else {
      typingSet.delete(userId);
    }

    return Array.from(typingSet);
  }

  // Get typing users
  getTypingUsers(roomId) {
    return Array.from(this.typingUsers.get(roomId) || []);
  }

  // Delete message
  deleteMessage(roomId, messageId, userId) {
    const roomMessages = this.messages.get(roomId);
    if (!roomMessages) return null;

    const messageIndex = roomMessages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return null;

    const message = roomMessages[messageIndex];
    
    // Only allow deletion by sender or admin
    if (message.sender.id !== userId) {
      return null;
    }

    roomMessages.splice(messageIndex, 1);
    return message;
  }

  // Edit message
  editMessage(roomId, messageId, userId, newText) {
    const roomMessages = this.messages.get(roomId);
    if (!roomMessages) return null;

    const message = roomMessages.find(m => m.id === messageId);
    if (!message || message.sender.id !== userId) return null;

    message.text = newText;
    message.editedAt = new Date();
    return message;
  }

  // Search messages
  searchMessages(roomId, query, limit = 20) {
    const roomMessages = this.messages.get(roomId) || [];
    const lowercaseQuery = query.toLowerCase();
    
    return roomMessages
      .filter(message => 
        message.text.toLowerCase().includes(lowercaseQuery) ||
        message.sender.name.toLowerCase().includes(lowercaseQuery)
      )
      .slice(-limit);
  }

  // Get message statistics
  getMessageStats(roomId) {
    const roomMessages = this.messages.get(roomId) || [];
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    
    const today = roomMessages.filter(m => 
      now - m.timestamp < dayMs
    ).length;
    
    const senderCounts = new Map();
    roomMessages.forEach(message => {
      const senderId = message.sender.id;
      senderCounts.set(senderId, (senderCounts.get(senderId) || 0) + 1);
    });

    return {
      total: roomMessages.length,
      today,
      topSenders: Array.from(senderCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    };
  }

  // Generate unique message ID
  generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Clean up old messages (optional)
  cleanupOldMessages(roomId, maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
    const roomMessages = this.messages.get(roomId);
    if (!roomMessages) return 0;

    const cutoff = new Date(Date.now() - maxAge);
    const originalLength = roomMessages.length;
    
    this.messages.set(roomId, roomMessages.filter(m => m.timestamp > cutoff));
    
    return originalLength - this.messages.get(roomId).length;
  }
}

export const chatService = new ChatService();
