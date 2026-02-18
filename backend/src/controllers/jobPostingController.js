const JobPosting = require('../models/JobPosting');
const notificationService = require('../services/notificationService');

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
    
    // البحث عن المستخدمين المناسبين وإرسال إشعارات لهم
    const matchingUsers = await notificationService.findMatchingUsersForJob(jobPosting._id);
    
    // إرسال إشعارات للمستخدمين المناسبين (بشكل غير متزامن)
    if (matchingUsers.length > 0) {
      Promise.all(
        matchingUsers.map(userId => 
          notificationService.notifyJobMatch(userId, jobPosting._id)
        )
      ).catch(err => console.error('Error sending job match notifications:', err));
    }
    
    res.status(201).json({ message: 'Job posting created successfully', data: jobPosting });
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
