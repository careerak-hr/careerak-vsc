const JobPosting = require('../models/JobPosting');
const notificationService = require('../services/notificationService');
const realtimeNotificationService = require('../services/realtimeRecommendationNotificationService');

exports.createJobPosting = async (req, res) => {
  try {
    const { title, description, requirements, salary, location, jobType, department } = req.body;
    
    const jobPosting = new JobPosting({
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      department,
      postedBy: req.user.id
    });

    await jobPosting.save();
    
    // إرسال إشعارات فورية للمستخدمين المناسبين (بشكل غير متزامن)
    // استخدام الخدمة الجديدة للإشعارات الفورية
    realtimeNotificationService.notifyUsersForNewJob(jobPosting._id)
      .then(result => {
        if (result.success) {
          console.log(`✅ Sent ${result.notified} real-time notifications for job: ${result.jobTitle}`);
          console.log(`📊 Matching users: ${result.matchingUsers}, Average match: ${result.averageMatchScore?.toFixed(1)}%`);
        } else {
          console.error('❌ Failed to send job match notifications:', result.error);
        }
      })
      .catch(err => console.error('❌ Error sending job match notifications:', err));
    
    res.status(201).json({ 
      message: 'Job posting created successfully', 
      data: jobPosting,
      notificationsQueued: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllJobPostings = async (req, res) => {
  try {
    const jobPostings = await JobPosting.find().populate('postedBy', 'firstName lastName email');
    res.status(200).json(jobPostings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getJobPostingById = async (req, res) => {
  try {
    const jobPosting = await JobPosting.findById(req.params.id).populate('postedBy').populate('applicants');
    if (!jobPosting) return res.status(404).json({ error: 'Job posting not found' });
    res.status(200).json(jobPosting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateJobPosting = async (req, res) => {
  try {
    const jobPosting = await JobPosting.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.status(200).json({ message: 'Job posting updated', data: jobPosting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteJobPosting = async (req, res) => {
  try {
    await JobPosting.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Job posting deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
