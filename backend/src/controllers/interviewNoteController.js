const InterviewNote = require('../models/InterviewNote');
const VideoInterview = require('../models/VideoInterview');

/**
 * Interview Note Controller
 * معالج طلبات ملاحظات وتقييم المقابلات
 * 
 * Requirements: 8.4, 8.5
 */

/**
 * إنشاء ملاحظة جديدة
 * POST /api/interview-notes
 */
exports.createNote = async (req, res) => {
  try {
    const {
      interviewId,
      candidateId,
      overallRating,
      ratings,
      notes,
      decision,
      priority,
      visibility,
      sharedWith
    } = req.body;

    // التحقق من وجود المقابلة
    const interview = await VideoInterview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'المقابلة غير موجودة'
      });
    }

    // التحقق من أن المستخدم مشارك في المقابلة
    const isParticipant = interview.participants.some(
      p => p.userId.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لإضافة ملاحظات لهذه المقابلة'
      });
    }

    // إنشاء الملاحظة
    const note = new InterviewNote({
      interviewId,
      evaluatorId: req.user._id,
      candidateId,
      overallRating,
      ratings,
      notes,
      decision,
      priority,
      visibility,
      sharedWith
    });

    await note.save();

    // Populate البيانات
    await note.populate([
      { path: 'evaluatorId', select: 'name email profilePicture' },
      { path: 'candidateId', select: 'name email profilePicture' },
      { path: 'interviewId', select: 'scheduledAt duration status' }
    ]);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الملاحظة بنجاح',
      data: note
    });

  } catch (error) {
    console.error('Error creating interview note:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء الملاحظة',
      error: error.message
    });
  }
};

/**
 * الحصول على ملاحظة واحدة
 * GET /api/interview-notes/:id
 */
exports.getNote = async (req, res) => {
  try {
    const note = await InterviewNote.findById(req.params.id)
      .populate('evaluatorId', 'name email profilePicture')
      .populate('candidateId', 'name email profilePicture')
      .populate('interviewId', 'scheduledAt duration status');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'الملاحظة غير موجودة'
      });
    }

    // التحقق من صلاحية الوصول
    if (!note.canAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لعرض هذه الملاحظة'
      });
    }

    res.json({
      success: true,
      data: note
    });

  } catch (error) {
    console.error('Error fetching interview note:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الملاحظة',
      error: error.message
    });
  }
};

/**
 * الحصول على جميع ملاحظات مقابلة
 * GET /api/interview-notes/interview/:interviewId
 */
exports.getInterviewNotes = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // التحقق من وجود المقابلة
    const interview = await VideoInterview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'المقابلة غير موجودة'
      });
    }

    // جلب الملاحظات التي يمكن للمستخدم الوصول إليها
    const notes = await InterviewNote.find({
      interviewId,
      $or: [
        { evaluatorId: req.user._id },
        { visibility: 'team' },
        { sharedWith: req.user._id }
      ]
    })
      .populate('evaluatorId', 'name email profilePicture')
      .populate('candidateId', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notes.length,
      data: notes
    });

  } catch (error) {
    console.error('Error fetching interview notes:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الملاحظات',
      error: error.message
    });
  }
};

/**
 * الحصول على جميع ملاحظات مرشح
 * GET /api/interview-notes/candidate/:candidateId
 */
exports.getCandidateNotes = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { status } = req.query;

    const query = {
      candidateId,
      $or: [
        { evaluatorId: req.user._id },
        { visibility: 'team' },
        { sharedWith: req.user._id }
      ]
    };

    if (status) {
      query.status = status;
    }

    const notes = await InterviewNote.find(query)
      .populate('evaluatorId', 'name email profilePicture')
      .populate('interviewId', 'scheduledAt duration status')
      .sort({ createdAt: -1 });

    // الحصول على إحصائيات المرشح
    const stats = await InterviewNote.getCandidateStats(candidateId);

    res.json({
      success: true,
      count: notes.length,
      data: notes,
      stats
    });

  } catch (error) {
    console.error('Error fetching candidate notes:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب ملاحظات المرشح',
      error: error.message
    });
  }
};

/**
 * الحصول على ملاحظات المُقيّم
 * GET /api/interview-notes/my-notes
 */
exports.getMyNotes = async (req, res) => {
  try {
    const { status, decision, page = 1, limit = 20 } = req.query;

    const query = { evaluatorId: req.user._id };

    if (status) query.status = status;
    if (decision) query.decision = decision;

    const skip = (page - 1) * limit;

    const notes = await InterviewNote.find(query)
      .populate('candidateId', 'name email profilePicture')
      .populate('interviewId', 'scheduledAt duration status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await InterviewNote.countDocuments(query);

    res.json({
      success: true,
      count: notes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: notes
    });

  } catch (error) {
    console.error('Error fetching my notes:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب ملاحظاتك',
      error: error.message
    });
  }
};

/**
 * تحديث ملاحظة
 * PUT /api/interview-notes/:id
 */
exports.updateNote = async (req, res) => {
  try {
    const note = await InterviewNote.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'الملاحظة غير موجودة'
      });
    }

    // التحقق من أن المستخدم هو المُقيّم
    if (note.evaluatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتعديل هذه الملاحظة'
      });
    }

    // الحقول القابلة للتحديث
    const allowedUpdates = [
      'overallRating',
      'ratings',
      'notes',
      'decision',
      'priority',
      'status',
      'visibility',
      'sharedWith'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        note[field] = req.body[field];
      }
    });

    await note.save();

    await note.populate([
      { path: 'evaluatorId', select: 'name email profilePicture' },
      { path: 'candidateId', select: 'name email profilePicture' },
      { path: 'interviewId', select: 'scheduledAt duration status' }
    ]);

    res.json({
      success: true,
      message: 'تم تحديث الملاحظة بنجاح',
      data: note
    });

  } catch (error) {
    console.error('Error updating interview note:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الملاحظة',
      error: error.message
    });
  }
};

/**
 * حذف ملاحظة
 * DELETE /api/interview-notes/:id
 */
exports.deleteNote = async (req, res) => {
  try {
    const note = await InterviewNote.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'الملاحظة غير موجودة'
      });
    }

    // التحقق من أن المستخدم هو المُقيّم
    if (note.evaluatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لحذف هذه الملاحظة'
      });
    }

    await note.deleteOne();

    res.json({
      success: true,
      message: 'تم حذف الملاحظة بنجاح'
    });

  } catch (error) {
    console.error('Error deleting interview note:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الملاحظة',
      error: error.message
    });
  }
};

/**
 * الحصول على إحصائيات التقييمات
 * GET /api/interview-notes/stats/overview
 */
exports.getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { evaluatorId: req.user._id, status: 'final' };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const notes = await InterviewNote.find(query);

    // حساب الإحصائيات
    const stats = {
      total: notes.length,
      byDecision: notes.reduce((acc, note) => {
        acc[note.decision] = (acc[note.decision] || 0) + 1;
        return acc;
      }, {}),
      byPriority: notes.reduce((acc, note) => {
        if (note.decision === 'hire') {
          acc[note.priority] = (acc[note.priority] || 0) + 1;
        }
        return acc;
      }, {}),
      averageRating: notes.length > 0
        ? (notes.reduce((sum, note) => sum + note.overallRating, 0) / notes.length).toFixed(2)
        : 0,
      ratingDistribution: notes.reduce((acc, note) => {
        const rating = Math.floor(note.overallRating);
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإحصائيات',
      error: error.message
    });
  }
};
