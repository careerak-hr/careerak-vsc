const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { User } = require('../models/User');
const notificationService = require('./notificationService');
const pusherService = require('./pusherService');
const logger = require('../utils/logger');

class ChatService {
  
  // إنشاء أو الحصول على محادثة
  async getOrCreateConversation(user1Id, user2Id, relatedJob = null, relatedApplication = null) {
    try {
      // البحث عن محادثة موجودة
      let conversation = await Conversation.findBetweenUsers(user1Id, user2Id);
      
      if (conversation) {
        return conversation;
      }
      
      // الحصول على معلومات المستخدمين
      const user1 = await User.findById(user1Id);
      const user2 = await User.findById(user2Id);
      
      if (!user1 || !user2) {
        throw new Error('User not found');
      }
      
      // إنشاء محادثة جديدة
      conversation = await Conversation.create({
        participants: [
          { user: user1Id, role: user1.role },
          { user: user2Id, role: user2.role }
        ],
        relatedJob,
        relatedApplication
      });
      
      logger.info(`New conversation created: ${conversation._id}`);
      return conversation;
      
    } catch (error) {
      logger.error('Error in getOrCreateConversation:', error);
      throw error;
    }
  }
  
  // إرسال رسالة
  async sendMessage({ conversationId, senderId, type = 'text', content, file, sharedContent }) {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // التحقق من أن المرسل مشارك في المحادثة
      const isParticipant = conversation.participants.some(
        p => p.user.toString() === senderId.toString()
      );
      
      if (!isParticipant) {
        throw new Error('User is not a participant in this conversation');
      }
      
      // إنشاء الرسالة
      const messageData = {
        conversation: conversationId,
        sender: senderId,
        type,
        content,
        file,
        status: 'sent'
      };

      if (type === 'shared_content' && sharedContent) {
        messageData.sharedContent = sharedContent;
        messageData.content = sharedContent.url || sharedContent.title || '[shared content]';
      }

      const message = await Message.create(messageData);
      
      // تحديث آخر رسالة في المحادثة
      conversation.lastMessage = {
        content: type === 'text' ? content : `[${type}]`,
        sender: senderId,
        timestamp: message.createdAt,
        type
      };
      conversation.updatedAt = new Date();
      
      // زيادة عدد الرسائل غير المقروءة للمشاركين الآخرين
      for (const participant of conversation.participants) {
        if (participant.user.toString() !== senderId.toString()) {
          participant.unreadCount += 1;
        }
      }
      
      await conversation.save();
      
      // إرسال إشعار للمشاركين الآخرين
      const otherParticipants = conversation.participants.filter(
        p => p.user.toString() !== senderId.toString()
      );
      
      const sender = await User.findById(senderId).select('firstName lastName companyName');
      const senderName = sender.firstName 
        ? `${sender.firstName} ${sender.lastName}` 
        : sender.companyName;
      
      for (const participant of otherParticipants) {
        await notificationService.createNotification({
          recipient: participant.user,
          type: 'system',
          title: 'رسالة جديدة 💬',
          message: `رسالة جديدة من ${senderName}`,
          relatedData: { conversation: conversationId },
          priority: 'high'
        });
      }
      
      // إرسال الرسالة عبر Pusher للمحادثات الفورية
      await pusherService.sendNewMessage(conversationId, message);
      
      logger.info(`Message sent: ${message._id} in conversation ${conversationId}`);
      return message;
      
    } catch (error) {
      logger.error('Error sending message:', error);
      throw error;
    }
  }
  
  // الحصول على رسائل محادثة
  async getMessages(conversationId, userId, { page = 1, limit = 50 } = {}) {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // التحقق من أن المستخدم مشارك في المحادثة
      const isParticipant = conversation.participants.some(
        p => p.user.toString() === userId.toString()
      );
      
      if (!isParticipant) {
        throw new Error('User is not a participant in this conversation');
      }
      
      // الحصول على الرسائل
      const messages = await Message.find({
        conversation: conversationId,
        deletedBy: { $ne: userId }
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate('sender', 'firstName lastName companyName profileImage')
        .populate('replyTo', 'content sender type');
      
      const total = await Message.countDocuments({
        conversation: conversationId,
        deletedBy: { $ne: userId }
      });
      
      return {
        messages: messages.reverse(), // عكس الترتيب لعرض الأقدم أولاً
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
      
    } catch (error) {
      logger.error('Error getting messages:', error);
      throw error;
    }
  }
  
  // الحصول على محادثات المستخدم
  async getUserConversations(userId, { page = 1, limit = 20, archived = false } = {}) {
    try {
      const query = {
        'participants.user': userId,
        status: archived ? 'archived' : 'active'
      };
      
      if (archived) {
        query.archivedBy = userId;
      } else {
        query.archivedBy = { $ne: userId };
      }
      
      const conversations = await Conversation.find(query)
        .sort({ updatedAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate('participants.user', 'firstName lastName companyName profileImage role')
        .populate('relatedJob', 'title location')
        .populate('lastMessage.sender', 'firstName lastName companyName');
      
      const total = await Conversation.countDocuments(query);
      
      // حساب إجمالي الرسائل غير المقروءة
      const totalUnread = conversations.reduce((sum, conv) => {
        const participant = conv.participants.find(
          p => p.user._id.toString() === userId.toString()
        );
        return sum + (participant?.unreadCount || 0);
      }, 0);
      
      return {
        conversations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        totalUnread
      };
      
    } catch (error) {
      logger.error('Error getting user conversations:', error);
      throw error;
    }
  }
  
  // تحديد المحادثة كمقروءة
  async markConversationAsRead(conversationId, userId) {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      await conversation.markAsRead(userId);
      
      // تحديد جميع الرسائل كمقروءة
      await Message.updateMany(
        {
          conversation: conversationId,
          sender: { $ne: userId },
          'readBy.user': { $ne: userId }
        },
        {
          $push: { readBy: { user: userId, readAt: new Date() } },
          status: 'read'
        }
      );
      
      logger.info(`Conversation ${conversationId} marked as read by user ${userId}`);
      return conversation;
      
    } catch (error) {
      logger.error('Error marking conversation as read:', error);
      throw error;
    }
  }
  
  // أرشفة محادثة
  async archiveConversation(conversationId, userId) {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      if (!conversation.archivedBy.includes(userId)) {
        conversation.archivedBy.push(userId);
        await conversation.save();
      }
      
      logger.info(`Conversation ${conversationId} archived by user ${userId}`);
      return conversation;
      
    } catch (error) {
      logger.error('Error archiving conversation:', error);
      throw error;
    }
  }
  
  // إلغاء أرشفة محادثة
  async unarchiveConversation(conversationId, userId) {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      conversation.archivedBy = conversation.archivedBy.filter(
        id => id.toString() !== userId.toString()
      );
      await conversation.save();
      
      logger.info(`Conversation ${conversationId} unarchived by user ${userId}`);
      return conversation;
      
    } catch (error) {
      logger.error('Error unarchiving conversation:', error);
      throw error;
    }
  }
  
  // حذف رسالة
  async deleteMessage(messageId, userId) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }
      
      if (!message.canDelete(userId)) {
        throw new Error('You can only delete your own messages');
      }
      
      message.deletedBy.push(userId);
      await message.save();
      
      logger.info(`Message ${messageId} deleted by user ${userId}`);
      return message;
      
    } catch (error) {
      logger.error('Error deleting message:', error);
      throw error;
    }
  }
  
  // تعديل رسالة
  async editMessage(messageId, userId, newContent) {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }
      
      if (!message.canEdit(userId)) {
        throw new Error('You can only edit your own text messages');
      }
      
      message.content = newContent;
      message.edited = true;
      message.editedAt = new Date();
      await message.save();
      
      logger.info(`Message ${messageId} edited by user ${userId}`);
      return message;
      
    } catch (error) {
      logger.error('Error editing message:', error);
      throw error;
    }
  }
  
  // البحث في المحادثات
  async searchConversations(userId, searchTerm) {
    try {
      const conversations = await Conversation.find({
        'participants.user': userId,
        status: 'active',
        archivedBy: { $ne: userId }
      })
        .populate('participants.user', 'firstName lastName companyName')
        .populate('relatedJob', 'title');
      
      // فلترة المحادثات بناءً على البحث
      const filtered = conversations.filter(conv => {
        const otherParticipant = conv.participants.find(
          p => p.user._id.toString() !== userId.toString()
        );
        
        const name = otherParticipant.user.firstName 
          ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
          : otherParticipant.user.companyName;
        
        const jobTitle = conv.relatedJob?.title || '';
        
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
      });
      
      return filtered;
      
    } catch (error) {
      logger.error('Error searching conversations:', error);
      throw error;
    }
  }
  
  // الحصول على حالة المستخدم (متصل/غير متصل)
  async getUserStatus(userId) {
    // هذه الدالة ستتكامل مع Socket.IO
    // يمكن حفظ حالة المستخدم في Redis أو في الذاكرة
    return {
      userId,
      status: 'offline', // سيتم تحديثها من Socket.IO
      lastSeen: new Date()
    };
  }
}

module.exports = new ChatService();
