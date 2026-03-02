const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const chatFileController = require('../controllers/chatFileController');
const { auth } = require('../middleware/auth');
const upload = require('../config/multer');

// جميع المسارات تحتاج مصادقة
router.use(auth);

// إنشاء أو الحصول على محادثة
router.post('/conversations', chatController.getOrCreateConversation);

// الحصول على محادثات المستخدم
router.get('/conversations', chatController.getUserConversations);

// البحث في المحادثات
router.get('/conversations/search', chatController.searchConversations);

// الحصول على رسائل محادثة
router.get('/conversations/:conversationId/messages', chatController.getMessages);

// تحديد المحادثة كمقروءة
router.patch('/conversations/:conversationId/read', chatController.markAsRead);

// أرشفة محادثة
router.patch('/conversations/:conversationId/archive', chatController.archiveConversation);

// إلغاء أرشفة محادثة
router.patch('/conversations/:conversationId/unarchive', chatController.unarchiveConversation);

// إرسال رسالة
router.post('/messages', chatController.sendMessage);

// تعديل رسالة
router.patch('/messages/:messageId', chatController.editMessage);

// حذف رسالة
router.delete('/messages/:messageId', chatController.deleteMessage);

// الحصول على حالة المستخدم
router.get('/users/:userId/status', chatController.getUserStatus);

// مصادقة Pusher
router.post('/pusher/auth', chatController.authenticatePusher);

// إرسال مؤشر "يكتب الآن..."
router.post('/typing', chatController.sendTyping);

// إرسال "توقف عن الكتابة"
router.post('/stop-typing', chatController.sendStopTyping);

// رفع ملف للدردشة
router.post('/files/upload', upload.single('file'), chatFileController.uploadChatFile);

// حذف ملف من الدردشة
router.delete('/files/:cloudinaryId', chatFileController.deleteChatFile);

module.exports = router;
