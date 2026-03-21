const CertificateTemplate = require('../models/CertificateTemplate');
const Certificate = require('../models/Certificate');
const EducationalCourse = require('../models/EducationalCourse');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// ========== Template Management ==========

/**
 * GET /api/certificates/templates
 * جلب قوالب الشهادات للمدرب
 */
exports.getTemplates = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const templates = await CertificateTemplate.find({ instructorId })
      .populate('courseId', 'title thumbnail')
      .sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error in getTemplates:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      messageAr: 'حدث خطأ أثناء جلب القوالب'
    });
  }
};

/**
 * POST /api/certificates/templates
 * إنشاء قالب جديد
 */
exports.createTemplate = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const { name, colors, layout, logoPosition, elements, signature, isDefault, courseId } = req.body;

    // إذا كان هذا القالب الافتراضي، إلغاء الافتراضي السابق
    if (isDefault) {
      await CertificateTemplate.updateMany(
        { instructorId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const template = new CertificateTemplate({
      instructorId,
      name: name || 'New Template',
      colors,
      layout,
      logoPosition,
      elements,
      signature,
      isDefault: isDefault || false,
      courseId: courseId || null
    });

    await template.save();

    res.status(201).json({
      success: true,
      template,
      message: 'Template created successfully',
      messageAr: 'تم إنشاء القالب بنجاح'
    });
  } catch (error) {
    console.error('Error in createTemplate:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      messageAr: 'حدث خطأ أثناء إنشاء القالب'
    });
  }
};

/**
 * PUT /api/certificates/templates/:id
 * تحديث قالب موجود
 */
exports.updateTemplate = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const { id } = req.params;
    const { name, colors, layout, logoPosition, elements, signature, isDefault, courseId } = req.body;

    const template = await CertificateTemplate.findOne({ _id: id, instructorId });
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
        messageAr: 'القالب غير موجود'
      });
    }

    // إذا كان هذا القالب الافتراضي، إلغاء الافتراضي السابق
    if (isDefault && !template.isDefault) {
      await CertificateTemplate.updateMany(
        { instructorId, isDefault: true, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
    }

    if (name !== undefined) template.name = name;
    if (colors !== undefined) template.colors = { ...template.colors, ...colors };
    if (layout !== undefined) template.layout = layout;
    if (logoPosition !== undefined) template.logoPosition = logoPosition;
    if (elements !== undefined) template.elements = { ...template.elements, ...elements };
    if (signature !== undefined) template.signature = { ...template.signature, ...signature };
    if (isDefault !== undefined) template.isDefault = isDefault;
    if (courseId !== undefined) template.courseId = courseId || null;

    await template.save();

    res.status(200).json({
      success: true,
      template,
      message: 'Template updated successfully',
      messageAr: 'تم تحديث القالب بنجاح'
    });
  } catch (error) {
    console.error('Error in updateTemplate:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      messageAr: 'حدث خطأ أثناء تحديث القالب'
    });
  }
};

/**
 * POST /api/certificates/templates/:id/signature
 * رفع توقيع رقمي للقالب
 */
exports.uploadSignature = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const { id } = req.params;

    const template = await CertificateTemplate.findOne({ _id: id, instructorId });
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
        messageAr: 'القالب غير موجود'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No signature image provided',
        messageAr: 'لم يتم تقديم صورة التوقيع'
      });
    }

    // رفع الصورة إلى Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'careerak/signatures',
          resource_type: 'image',
          transformation: [
            { width: 400, height: 150, crop: 'fit' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // حذف التوقيع القديم من Cloudinary إذا وجد
    if (template.signature && template.signature.imageUrl) {
      try {
        const oldPublicId = template.signature.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`careerak/signatures/${oldPublicId}`);
      } catch (deleteError) {
        console.warn('Could not delete old signature:', deleteError.message);
      }
    }

    template.signature.imageUrl = uploadResult.secure_url;
    await template.save();

    res.status(200).json({
      success: true,
      signatureUrl: uploadResult.secure_url,
      message: 'Signature uploaded successfully',
      messageAr: 'تم رفع التوقيع بنجاح'
    });
  } catch (error) {
    console.error('Error in uploadSignature:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      messageAr: 'حدث خطأ أثناء رفع التوقيع'
    });
  }
};

// ========== Stats ==========

/**
 * GET /api/certificates/management/stats
 * إحصائيات الشهادات للمدرب
 */
exports.getIssuedStats = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const instructorCourses = await EducationalCourse.find(
      { instructor: instructorId },
      '_id'
    );

    if (instructorCourses.length === 0) {
      return res.status(200).json({
        success: true,
        stats: { total: 0, active: 0, revoked: 0, expired: 0 }
      });
    }

    const courseIds = instructorCourses.map(c => c._id);

    const [total, active, revoked, expired] = await Promise.all([
      Certificate.countDocuments({ courseId: { $in: courseIds } }),
      Certificate.countDocuments({ courseId: { $in: courseIds }, status: 'active' }),
      Certificate.countDocuments({ courseId: { $in: courseIds }, status: 'revoked' }),
      Certificate.countDocuments({ courseId: { $in: courseIds }, status: 'expired' }),
    ]);

    res.status(200).json({
      success: true,
      stats: { total, active, revoked, expired }
    });
  } catch (error) {
    console.error('Error in getIssuedStats:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      messageAr: 'حدث خطأ أثناء جلب الإحصائيات'
    });
  }
};

// ========== Issued Certificates ==========

/**
 * GET /api/certificates/issued
 * جلب الشهادات الصادرة لدورات المدرب
 */
exports.getIssuedCertificates = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const {
      page = 1,
      limit = 20,
      search = '',
      courseId,
      status,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // جلب دورات المدرب
    const instructorCourses = await EducationalCourse.find(
      { instructor: instructorId },
      '_id title'
    );

    if (instructorCourses.length === 0) {
      return res.status(200).json({
        success: true,
        certificates: [],
        total: 0,
        page: parseInt(page),
        totalPages: 0
      });
    }

    const courseIds = instructorCourses.map(c => c._id);

    // بناء query
    const query = { courseId: { $in: courseIds } };

    if (courseId) {
      query.courseId = courseId;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.issueDate = {};
      if (startDate) query.issueDate.$gte = new Date(startDate);
      if (endDate) query.issueDate.$lte = new Date(endDate);
    }

    // جلب الشهادات مع populate
    let certificatesQuery = Certificate.find(query)
      .populate('userId', 'firstName lastName email profileImage')
      .populate('courseId', 'title thumbnail category')
      .sort({ issueDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    let certificates = await certificatesQuery;

    // فلترة بالبحث (بعد populate)
    if (search) {
      const searchLower = search.toLowerCase();
      certificates = certificates.filter(cert => {
        const userName = `${cert.userId?.firstName || ''} ${cert.userId?.lastName || ''}`.toLowerCase();
        const courseName = (cert.courseName || '').toLowerCase();
        const certId = (cert.certificateId || '').toLowerCase();
        return userName.includes(searchLower) ||
          courseName.includes(searchLower) ||
          certId.includes(searchLower);
      });
    }

    const total = await Certificate.countDocuments(query);

    res.status(200).json({
      success: true,
      certificates: certificates.map(cert => ({
        _id: cert._id,
        certificateId: cert.certificateId,
        userName: cert.userId ? `${cert.userId.firstName} ${cert.userId.lastName}` : 'Unknown',
        userEmail: cert.userId?.email || '',
        userImage: cert.userId?.profileImage || null,
        courseName: cert.courseName,
        courseTitle: cert.courseId?.title || cert.courseName,
        courseThumbnail: cert.courseId?.thumbnail || null,
        issueDate: cert.issueDate,
        status: cert.status,
        verificationUrl: cert.verificationUrl,
        linkedInShared: cert.linkedInShared,
        isHidden: cert.isHidden
      })),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      courses: instructorCourses
    });
  } catch (error) {
    console.error('Error in getIssuedCertificates:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      messageAr: 'حدث خطأ أثناء جلب الشهادات الصادرة'
    });
  }
};
