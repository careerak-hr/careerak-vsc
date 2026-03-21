/**
 * Acceptance Probability Controller
 * 
 * معالج طلبات احتمالية القبول
 */

const AcceptanceProbabilityService = require('../services/acceptanceProbabilityService');
const User = require('../models/User');
const JobPosting = require('../models/JobPosting');

const acceptanceProbabilityService = new AcceptanceProbabilityService();

/**
 * حساب احتمالية القبول لوظيفة واحدة
 * GET /api/acceptance-probability/:jobId
 */
exports.getJobAcceptanceProbability = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // جلب بيانات المستخدم
    const user = await User.findById(userId)
      .select('skills experience education location preferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // جلب بيانات الوظيفة
    const job = await JobPosting.findById(jobId)
      .populate('company', 'name logo');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'الوظيفة غير موجودة'
      });
    }

    // حساب احتمالية القبول
    const probability = await acceptanceProbabilityService.calculateAcceptanceProbability(user, job);

    res.json({
      success: true,
      data: {
        jobId: job._id,
        jobTitle: job.title,
        company: job.company,
        ...probability
      }
    });
  } catch (error) {
    console.error('Error getting job acceptance probability:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حساب احتمالية القبول',
      error: error.message
    });
  }
};

/**
 * حساب احتمالية القبول لعدة وظائف
 * POST /api/acceptance-probability/bulk
 * Body: { jobIds: [id1, id2, ...] }
 */
exports.getBulkAcceptanceProbabilities = async (req, res) => {
  try {
    const { jobIds } = req.body;
    const userId = req.user.id;

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'يجب تقديم قائمة بمعرفات الوظائف'
      });
    }

    // حد أقصى 50 وظيفة في المرة الواحدة
    if (jobIds.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'الحد الأقصى 50 وظيفة في المرة الواحدة'
      });
    }

    // جلب بيانات المستخدم
    const user = await User.findById(userId)
      .select('skills experience education location preferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // جلب بيانات الوظائف
    const jobs = await JobPosting.find({ _id: { $in: jobIds } })
      .populate('company', 'name logo');

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على وظائف'
      });
    }

    // حساب احتمالية القبول لكل وظيفة
    const probabilities = await acceptanceProbabilityService.calculateBulkProbabilities(user, jobs);

    res.json({
      success: true,
      data: probabilities,
      count: probabilities.length
    });
  } catch (error) {
    console.error('Error getting bulk acceptance probabilities:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حساب احتمالية القبول',
      error: error.message
    });
  }
};

/**
 * حساب احتمالية القبول لجميع الوظائف المتاحة (مع pagination)
 * GET /api/acceptance-probability/all?page=1&limit=20
 */
exports.getAllJobsProbabilities = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // جلب بيانات المستخدم
    const user = await User.findById(userId)
      .select('skills experience education location preferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // جلب الوظائف النشطة
    const jobs = await JobPosting.find({ status: 'active' })
      .populate('company', 'name logo')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalJobs = await JobPosting.countDocuments({ status: 'active' });

    // حساب احتمالية القبول لكل وظيفة
    const probabilities = await acceptanceProbabilityService.calculateBulkProbabilities(user, jobs);

    // إضافة معلومات الوظيفة لكل نتيجة
    const results = probabilities.map((prob, index) => ({
      ...prob,
      job: {
        _id: jobs[index]._id,
        title: jobs[index].title,
        company: jobs[index].company,
        location: jobs[index].location,
        salary: jobs[index].salary,
        type: jobs[index].type
      }
    }));

    res.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total: totalJobs,
        pages: Math.ceil(totalJobs / limit)
      }
    });
  } catch (error) {
    console.error('Error getting all jobs probabilities:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حساب احتمالية القبول',
      error: error.message
    });
  }
};
