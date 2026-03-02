const { uploadImage } = require('../config/cloudinary');
const logger = require('../utils/logger');
const path = require('path');

/**
 * رفع ملف للدردشة
 * يدعم: PDF، صور، مستندات
 */
exports.uploadChatFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم رفع أي ملف'
      });
    }

    const { conversationId } = req.body;
    const userId = req.user.id;
    
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد المحادثة'
      });
    }

    const file = req.file;
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileName = file.originalname;
    const fileSize = file.size;
    const mimeType = file.mimetype;

    // تحديد نوع الملف
    let fileType = 'file';
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const documentExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
    
    if (imageExtensions.includes(fileExtension)) {
      fileType = 'image';
    } else if (documentExtensions.includes(fileExtension)) {
      fileType = 'file';
    } else {
      return res.status(400).json({
        success: false,
        message: 'نوع الملف غير مدعوم. الأنواع المدعومة: صور (JPG, PNG, GIF, WebP, SVG)، مستندات (PDF, DOC, DOCX, TXT, RTF)'
      });
    }

    // رفع الملف إلى Cloudinary
    const uploadOptions = {
      folder: `careerak/chat/${conversationId}`,
      resource_type: fileType === 'image' ? 'image' : 'raw',
      tags: ['chat', conversationId, userId],
    };

    const result = await uploadImage(file.buffer, uploadOptions);

    // إرجاع معلومات الملف
    const fileData = {
      url: result.secure_url,
      name: fileName,
      size: fileSize,
      mimeType: mimeType,
      cloudinaryId: result.public_id,
      type: fileType
    };

    res.status(200).json({
      success: true,
      message: 'تم رفع الملف بنجاح',
      data: fileData
    });

  } catch (error) {
    logger.error('Error uploading chat file:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في رفع الملف'
    });
  }
};

/**
 * حذف ملف من Cloudinary
 */
exports.deleteChatFile = async (req, res) => {
  try {
    const { cloudinaryId } = req.params;
    const userId = req.user.id;

    if (!cloudinaryId) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد معرف الملف'
      });
    }

    const cloudinary = require('../config/cloudinary');
    
    // حذف الملف من Cloudinary
    await cloudinary.uploader.destroy(cloudinaryId);

    res.json({
      success: true,
      message: 'تم حذف الملف بنجاح'
    });

  } catch (error) {
    logger.error('Error deleting chat file:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الملف'
    });
  }
};

module.exports = exports;
