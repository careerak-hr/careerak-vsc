const chatService = require('../services/chatService');
const logger = require('../utils/logger');

// إنشاء أو الحصول على محادثة
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { otherUserId, relatedJob, relatedApplication } = req.body;
    const userId = req.user.id;
    
    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد المستخدم الآخر'
      });
    }
    
    const conversation = await chatService.getOrCreateConversation(
      userId,
      otherUserId,
      relatedJob,
      relatedApplication
    );
    
    res.json({
      success: true,
      data: conversation
    });
    
  } catch (error) {
    logger.error('Error in getOrCreateConversation:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء المحادثة'
    });
  }
};

// إرسال رسالة
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, type = 'text', content, file } = req.body;
    const senderId = req.user.id;
    
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد المحادثة'
      });
    }
    
    if (type === 'text' && !content) {
      return res.status(400).json({
        success: false,
        message: 'يجب إدخال محتوى الرسالة'
      });
    }
    
    const message = await chatService.sendMessage({
      conversationId,
      senderId,
      type,
      content,
      file
    });
    
    res.status(201).json({
      success: true,
      data: message
    });
    
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في إرسال الرسالة'
    });
  }
};

// الحصول على رسائل محادثة
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;
    
    const result = await chatService.getMessages(conversationId, userId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    logger.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في جلب الرسائل'
    });
  }
};

// الحصول على محادثات المستخدم
exports.getUserConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20, archived = false } = req.query;
    const userId = req.user.id;
    
    const result = await chatService.getUserConversations(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      archived: archived === 'true'
    });
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    logger.error('Error getting conversations:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المحادثات'
    });
  }
};

// تحديد المحادثة كمقروءة
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    const conversation = await chatService.markConversationAsRead(conversationId, userId);
    
    res.json({
      success: true,
      data: conversation
    });
    
  } catch (error) {
    logger.error('Error marking as read:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث حالة القراءة'
    });
  }
};

// أرشفة محادثة
exports.archiveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    const conversation = await chatService.archiveConversation(conversationId, userId);
    
    res.json({
      success: true,
      message: 'تم أرشفة المحادثة',
      data: conversation
    });
    
  } catch (error) {
    logger.error('Error archiving conversation:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في أرشفة المحادثة'
    });
  }
};

// إلغاء أرشفة محادثة
exports.unarchiveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    const conversation = await chatService.unarchiveConversation(conversationId, userId);
    
    res.json({
      success: true,
      message: 'تم إلغاء أرشفة المحادثة',
      data: conversation
    });
    
  } catch (error) {
    logger.error('Error unarchiving conversation:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إلغاء الأرشفة'
    });
  }
};

// حذف رسالة
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    
    const message = await chatService.deleteMessage(messageId, userId);
    
    res.json({
      success: true,
      message: 'تم حذف الرسالة',
      data: message
    });
    
  } catch (error) {
    logger.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في حذف الرسالة'
    });
  }
};

// تعديل رسالة
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'يجب إدخال المحتوى الجديد'
      });
    }
    
    const message = await chatService.editMessage(messageId, userId, content);
    
    res.json({
      success: true,
      message: 'تم تعديل الرسالة',
      data: message
    });
    
  } catch (error) {
    logger.error('Error editing message:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في تعديل الرسالة'
    });
  }
};

// البحث في المحادثات
exports.searchConversations = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.id;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'يجب إدخال كلمة البحث'
      });
    }
    
    const conversations = await chatService.searchConversations(userId, q);
    
    res.json({
      success: true,
      data: conversations
    });
    
  } catch (error) {
    logger.error('Error searching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث'
    });
  }
};

// الحصول على حالة المستخدم
exports.getUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const status = await chatService.getUserStatus(userId);
    
    res.json({
      success: true,
      data: status
    });
    
  } catch (error) {
    logger.error('Error getting user status:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب حالة المستخدم'
    });
  }
};

// مصادقة Pusher
exports.authenticatePusher = async (req, res) => {
  try {
    const { socket_id, channel_name } = req.body;
    const userId = req.user.id;
    
    const pusherService = require('../services/pusherService');
    
    if (!pusherService.isEnabled()) {
      return res.status(503).json({
        success: false,
        message: 'Pusher is not enabled'
      });
    }
    
    // مصادقة القناة الخاصة
    if (channel_name.startsWith('private-')) {
      const auth = pusherService.authenticateUser(socket_id, channel_name, userId);
      return res.json(auth);
    }
    
    // مصادقة Presence channel
    if (channel_name.startsWith('presence-')) {
      const { User } = require('../models/User');
      const user = await User.findById(userId).select('firstName lastName companyName profileImage role');
      
      const userInfo = {
        name: user.firstName ? `${user.firstName} ${user.lastName}` : user.companyName,
        image: user.profileImage,
        role: user.role
      };
      
      const auth = pusherService.authenticatePresence(socket_id, channel_name, userId, userInfo);
      return res.json(auth);
    }
    
    res.status(403).json({
      success: false,
      message: 'Invalid channel'
    });
    
  } catch (error) {
    logger.error('Error authenticating Pusher:', error);
    res.status(403).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
};

// إرسال مؤشر "يكتب الآن..."
exports.sendTyping = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user.id;
    
    const pusherService = require('../services/pusherService');
    const { User } = require('../models/User');
    
    const user = await User.findById(userId).select('firstName lastName companyName');
    const userName = user.firstName ? `${user.firstName} ${user.lastName}` : user.companyName;
    
    await pusherService.sendTypingIndicator(conversationId, userId, userName);
    
    res.json({
      success: true,
      message: 'Typing indicator sent'
    });
    
  } catch (error) {
    logger.error('Error sending typing indicator:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إرسال مؤشر الكتابة'
    });
  }
};

// إرسال "توقف عن الكتابة"
exports.sendStopTyping = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user.id;
    
    const pusherService = require('../services/pusherService');
    await pusherService.sendStopTyping(conversationId, userId);
    
    res.json({
      success: true,
      message: 'Stop typing sent'
    });
    
  } catch (error) {
    logger.error('Error sending stop typing:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إرسال التوقف عن الكتابة'
    });
  }
};

module.exports = exports;
