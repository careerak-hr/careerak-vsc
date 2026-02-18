const JobApplication = require('../models/JobApplication');
const JobPosting = require('../models/JobPosting');
const notificationService = require('../services/notificationService');

exports.applyForJob = async (req, res) => {
  try {
    const { jobPostingId, fullName, email, phone, resume, coverLetter, experience, qualifications } = req.body;
    
    const jobApplication = new JobApplication({
      jobPosting: jobPostingId,
      applicant: req.user.id,
      fullName,
      email,
      phone,
      resume,
      coverLetter,
      experience,
      qualifications
    });

    await jobApplication.save();
    
    // Add application to job posting
    const jobPosting = await JobPosting.findByIdAndUpdate(jobPostingId, {
      $push: { applicants: jobApplication._id }
    }, { new: true });

    // إرسال إشعار للشركة بطلب جديد
    if (jobPosting && jobPosting.postedBy) {
      await notificationService.notifyNewApplication(
        jobPosting.postedBy,
        jobApplication._id,
        fullName,
        jobPosting.title
      );
    }

    res.status(201).json({ message: 'Application submitted successfully', data: jobApplication });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getApplicationsForJob = async (req, res) => {
  try {
    const applications = await JobApplication.find({ jobPosting: req.params.jobPostingId })
      .populate('applicant', 'firstName lastName email');
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status, reviewedAt: Date.now(), reviewedBy: req.user.id },
      { new: true }
    ).populate('jobPosting', 'title').populate('applicant', '_id');
    
    // إرسال إشعار للمتقدم حسب حالة الطلب
    if (application && application.applicant) {
      const jobTitle = application.jobPosting?.title || 'الوظيفة';
      
      if (status === 'Accepted') {
        await notificationService.notifyApplicationAccepted(
          application.applicant._id,
          application._id,
          jobTitle
        );
      } else if (status === 'Rejected') {
        await notificationService.notifyApplicationRejected(
          application.applicant._id,
          application._id,
          jobTitle
        );
      } else if (status === 'Reviewed' || status === 'Shortlisted') {
        await notificationService.notifyApplicationReviewed(
          application.applicant._id,
          application._id,
          jobTitle
        );
      }
    }
    
    res.status(200).json({ message: 'Application status updated', data: application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ applicant: req.user.id })
      .populate('jobPosting', 'title location department');
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
