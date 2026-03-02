/**
 * Video Interview Controller
 * معالج طلبات مقابلات الفيديو
 */

const InterviewFileService = require('../services/interviewFileService');
const VideoInterview = require('../models/VideoInterview');
const multer = require('multer');
const path = require('path');

// إعداد multer للرفع المؤقت
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: InterviewFileService.MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    const validation = InterviewFileService.validateFile(file);
    if (validation.valid) {
      cb(null, true);
    } else {
      cb(new Error(validation.errors.join(', ')), false);
    }
  }
});

class VideoInterviewController {
  /**
   * الحصول على قائمة المقابلات القادمة
   * Requirements: 8.1
   */
  static async getUpcomingInterviews(req, res) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 10 } = req.query;

      const skip = (page - 1) * limit;

      // البحث عن المقابلات القادمة
      const interviews = await VideoInterview.find({
        $or: [
          { hostId: userId },
          { 'participants.userId': userId }
        ],
        status: { $in: ['scheduled', 'waiting'] },
        scheduledAt: { $gte: new Date() }
      })
        .populate('hostId', 'name email profilePicture')
        .populate('participants.userId', 'name email profilePicture')
        .populate('appointmentId')
        .sort({ scheduledAt: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await VideoInterview.countDocuments({
        $or: [
          { hostId: userId },
          { 'participants.userId': userId }
        ],
        status: { $in: ['scheduled', 'waiting'] },
        scheduledAt: { $gte: new Date() }
      });

      res.status(200).json({
        success: true,
        interviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error in getUpcomingInterviews:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'حدث خطأ أثناء جلب المقابلات القادمة'
      });
    }
  }

  /**
   * الحصول على سجل المقابلات السابقة
   * Requirements: 8.2
   */
  static async getPastInterviews(req, res) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 10, status } = req.query;

      const skip = (page - 1) * limit;

      // بناء الاستعلام
      const query = {
        $or: [
          { hostId: userId },
          { 'participants.userId': userId }
        ],
        status: { $in: ['ended', 'cancelled'] }
      };

      // تصفية حسب الحالة إذا تم تحديدها
      if (status) {
        query.status = status;
      }

      const interviews = await VideoInterview.find(query)
        .populate('hostId', 'name email profilePicture')
        .populate('participants.userId', 'name email profilePicture')
        .populate('appointmentId')
        .sort({ endedAt: -1, scheduledAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await VideoInterview.countDocuments(query);

      res.status(200).json({
        success: true,
        interviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error in getPastInterviews:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'حدث خطأ أثناء جلب المقابلات السابقة'
      });
    }
  }

  /**
   * الحصول على تفاصيل مقابلة واحدة
   * Requirements: 8.1, 8.2, 8.3
   */
  static async getInterviewDetails(req, res) {
    try {
      const { interviewId } = req.params;
      const userId = req.user._id;

      const interview = await VideoInterview.findById(interviewId)
        .populate('hostId', 'name email profilePicture')
        .populate('participants.userId', 'name email profilePicture')
        .populate('appointmentId');

      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'المقابلة غير موجودة'
        });
      }

      // التحقق من صلاحية الوصول
      const isHost = interview.hostId._id.toString() === userId.toString();
      const isParticipant = interview.participants.some(
        p => p.userId._id.toString() === userId.toString()
      );

      if (!isHost && !isParticipant) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول لهذه المقابلة'
        });
      }

      res.status(200).json({
        success: true,
        interview,
        userRole: isHost ? 'host' : 'participant'
      });
    } catch (error) {
      console.error('Error in getInterviewDetails:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'حدث خطأ أثناء جلب تفاصيل المقابلة'
      });
    }
  }

  /**
   * إضافة ملاحظات بعد المقابلة
   * Requirements: 8.4
   */
  static async addNotes(req, res) {
    try {
      const { interviewId } = req.params;
      const { notes } = req.body;
      const userId = req.user._id;

      const interview = await VideoInterview.findById(interviewId);

      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'المقابلة غير موجودة'
        });
      }

      // التحقق من أن المستخدم هو المضيف
      if (interview.hostId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'فقط المضيف يمكنه إضافة ملاحظات'
        });
      }

      // التحقق من أن المقابلة انتهت
      if (interview.status !== 'ended') {
        return res.status(400).json({
          success: false,
          message: 'لا يمكن إضافة ملاحظات إلا بعد انتهاء المقابلة'
        });
      }

      interview.notes = notes;
      await interview.save();

      res.status(200).json({
        success: true,
        message: 'تم حفظ الملاحظات بنجاح',
        interview
      });
    } catch (error) {
      console.error('Error in addNotes:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'حدث خطأ أثناء حفظ الملاحظات'
      });
    }
  }

  /**
   * تقييم المرشح بعد المقابلة
   * Requirements: 8.5
   */
  static async rateCandidate(req, res) {
    try {
      const { interviewId } = req.params;
      const { rating } = req.body;
      const userId = req.user._id;

      // التحقق من صحة التقييم
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'التقييم يجب أن يكون بين 1 و 5'
        });
      }

      const interview = await VideoInterview.findById(interviewId);

      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'المقابلة غير موجودة'
        });
      }

      // التحقق من أن المستخدم هو المضيف
      if (interview.hostId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'فقط المضيف يمكنه تقييم المرشح'
        });
      }

      // التحقق من أن المقابلة انتهت
      if (interview.status !== 'ended') {
        return res.status(400).json({
          success: false,
          message: 'لا يمكن التقييم إلا بعد انتهاء المقابلة'
        });
      }

      interview.rating = rating;
      await interview.save();

      res.status(200).json({
        success: true,
        message: 'تم حفظ التقييم بنجاح',
        interview
      });
    } catch (error) {
      console.error('Error in rateCandidate:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'حدث خطأ أثناء حفظ التقييم'
      });
    }
  }

  /**
   * البحث والفلترة في المقابلات
   * Requirements: 8.6
   */
  static async searchInterviews(req, res) {
    try {
      const userId = req.user._id;
      const {
        page = 1,
        limit = 10,
        status,
        startDate,
        endDate,
        search
      } = req.query;

      const skip = (page - 1) * limit;

      // بناء الاستعلام
      const query = {
        $or: [
          { hostId: userId },
          { 'participants.userId': userId }
        ]
      };

      // تصفية حسب الحالة
      if (status) {
        query.status = status;
      }

      // تصفية حسب التاريخ
      if (startDate || endDate) {
        query.scheduledAt = {};
        if (startDate) {
          query.scheduledAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.scheduledAt.$lte = new Date(endDate);
        }
      }

      const interviews = await VideoInterview.find(query)
        .populate('hostId', 'name email profilePicture')
        .populate('participants.userId', 'name email profilePicture')
        .populate('appointmentId')
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // البحث النصي إذا تم تحديده
      let filteredInterviews = interviews;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredInterviews = interviews.filter(interview => {
          const hostName = interview.hostId?.name?.toLowerCase() || '';
          const participantNames = interview.participants
            .map(p => p.userId?.name?.toLowerCase() || '')
            .join(' ');
          const notes = interview.notes?.toLowerCase() || '';
          
          return hostName.includes(searchLower) ||
                 participantNames.includes(searchLower) ||
                 notes.includes(searchLower);
        });
      }

      const total = await VideoInterview.countDocuments(query);

      res.status(200).json({
        success: true,
        interviews: filteredInterviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error in searchInterviews:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'حدث خطأ أثناء البحث في المقابلات'
      });
    }
  }

  /**
   * الحصول على إحصائيات المقابلات
   */
  static async getInterviewStats(req, res) {
    try {
      const userId = req.user._id;

      const stats = {
        upcoming: await VideoInterview.countDocuments({
          $or: [
            { hostId: userId },
            { 'participants.userId': userId }
          ],
          status: { $in: ['scheduled', 'waiting'] },
          scheduledAt: { $gte: new Date() }
        }),
        completed: await VideoInterview.countDocuments({
          $or: [
            { hostId: userId },
            { 'participants.userId': userId }
          ],
          status: 'ended'
        }),
        cancelled: await VideoInterview.countDocuments({
          $or: [
            { hostId: userId },
            { 'participants.userId': userId }
          ],
          status: 'cancelled'
        }),
        withRecordings: await VideoInterview.countDocuments({
          $or: [
            { hostId: userId },
            { 'participants.userId': userId }
          ],
          'recording.status': 'ready'
        })
      };

      res.status(200).json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Error in getInterviewStats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'حدث خطأ أثناء جلب الإحصائيات'
      });
    }
  }


  /**
   * رفع ملف أثناء المقابلة
   */
  static async uploadFile(req, res) {
    try {
      const { interviewId } = req.params;
      const userId = req.user._id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'لم يتم تحديد ملف'
        });
      }

      // رفع الملف
      const result = await InterviewFileService.uploadFile(file, interviewId, userId);

      // إرسال إشعار عبر Socket.IO (إذا كان متاحاً)
      if (req.app.get('io')) {
        req.app.get('io').to(`interview-${interviewId}`).emit('file-shared', {
          file: result.file,
          sender: {
            id: userId,
            name: req.user.name
          }
        });
      }

      res.status(200).json({
        success: true,
        message: 'تم رفع الملف بنجاح',
        file: result.file
      });
    } catch (error) {
      console.error('Error in uploadFile:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'حدث خطأ أثناء رفع الملف'
      });
    }
  }

  /**
   * حذف ملف من المقابلة
   */
  static async deleteFile(req, res) {
    try {
      const { interviewId, fileId } = req.params;
      const { category } = req.body;

      // حذف الملف
      const result = await InterviewFileService.deleteFile(fileId, category);

      // إرسال إشعار عبر Socket.IO
      if (req.app.get('io')) {
        req.app.get('io').to(`interview-${interviewId}`).emit('file-deleted', {
          fileId: fileId
        });
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in deleteFile:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'حدث خطأ أثناء حذف الملف'
      });
    }
  }

  /**
   * الحصول على معلومات الملف
   */
  static getFileInfo(req, res) {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'لم يتم تحديد ملف'
        });
      }

      const fileInfo = InterviewFileService.getFileInfo(file);

      res.status(200).json({
        success: true,
        fileInfo: fileInfo
      });
    } catch (error) {
      console.error('Error in getFileInfo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'حدث خطأ أثناء الحصول على معلومات الملف'
      });
    }
  }
}

// تصدير Controller و Multer middleware
module.exports = {
  VideoInterviewController,
  uploadMiddleware: upload.single('file')
};
