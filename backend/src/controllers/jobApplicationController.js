const JobApplication = require('../models/JobApplication');
const JobPosting = require('../models/JobPosting');
const ApplicationDraft = require('../models/ApplicationDraft');
const notificationService = require('../services/notificationService');
const pusherService = require('../services/pusherService');
const logger = require('../utils/logger');

/**
 * Submit a final job application
 * POST /api/applications
 * Requirements: 2.7, 5.1
 */
exports.submitApplication = async (req, res) => {
  try {
    const {
      jobPostingId,
      fullName,
      email,
      phone,
      country,
      city,
      education,
      experience,
      computerSkills,
      softwareSkills,
      otherSkills,
      languages,
      files,
      coverLetter,
      expectedSalary,
      availableFrom,
      noticePeriod,
      customAnswers
    } = req.body;

    // Validate required fields
    if (!jobPostingId || !fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: jobPostingId, fullName, email, phone'
        }
      });
    }

    // Check if job posting exists
    const jobPosting = await JobPosting.findById(jobPostingId);
    if (!jobPosting) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job posting not found'
        }
      });
    }

    // Check for duplicate application
    const existingApplication = await JobApplication.findOne({
      jobPosting: jobPostingId,
      applicant: req.user.id
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_APPLICATION',
          message: 'You have already applied for this job'
        }
      });
    }

    // Validate custom questions if required
    if (jobPosting.customQuestions && jobPosting.customQuestions.length > 0) {
      const requiredQuestions = jobPosting.customQuestions.filter(q => q.required);
      const answeredQuestionIds = (customAnswers || []).map(a => a.questionId);
      
      for (const question of requiredQuestions) {
        if (!answeredQuestionIds.includes(question.id)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'MISSING_REQUIRED_ANSWER',
              message: `Required question not answered: ${question.questionText}`,
              field: `customAnswers.${question.id}`
            }
          });
        }
      }
    }

    // Create application
    const jobApplication = new JobApplication({
      jobPosting: jobPostingId,
      applicant: req.user.id,
      fullName,
      email,
      phone,
      country,
      city,
      education: education || [],
      experience: experience || [],
      computerSkills: computerSkills || [],
      softwareSkills: softwareSkills || [],
      otherSkills: otherSkills || [],
      languages: languages || [],
      files: files || [],
      coverLetter,
      expectedSalary,
      availableFrom,
      noticePeriod,
      customAnswers: customAnswers || [],
      status: 'Submitted',
      statusHistory: [{
        status: 'Submitted',
        timestamp: new Date(),
        note: 'Application submitted'
      }],
      submittedAt: new Date()
    });

    await jobApplication.save();

    // Add application to job posting and increment applicant count
    await JobPosting.findByIdAndUpdate(jobPostingId, {
      $push: { applicants: jobApplication._id },
      $inc: { applicantCount: 1 }
    });

    // Delete draft after successful submission (Requirement 2.7)
    try {
      await ApplicationDraft.findOneAndDelete({
        jobPosting: jobPostingId,
        applicant: req.user.id
      });
      logger.info(`Draft deleted for user ${req.user.id} and job ${jobPostingId}`);
    } catch (draftError) {
      logger.error('Error deleting draft:', draftError);
      // Don't fail the application submission if draft deletion fails
    }

    // Send notification to employer (Requirement 5.4)
    if (jobPosting.postedBy) {
      try {
        await notificationService.notifyNewApplication(
          jobPosting.postedBy,
          jobApplication._id,
          fullName,
          jobPosting.title
        );
      } catch (notifError) {
        logger.error('Error sending notification:', notifError);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        applicationId: jobApplication._id,
        status: jobApplication.status,
        submittedAt: jobApplication.submittedAt
      },
      message: 'Application submitted successfully'
    });

  } catch (error) {
    logger.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBMISSION_ERROR',
        message: 'Failed to submit application',
        details: error.message
      }
    });
  }
};

// Legacy endpoint - kept for backward compatibility
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
    
    // Add application to job posting and increment applicant count
    const jobPosting = await JobPosting.findByIdAndUpdate(jobPostingId, {
      $push: { applicants: jobApplication._id },
      $inc: { applicantCount: 1 }
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

/**
 * Get application details
 * GET /api/applications/:applicationId
 * Requirements: 5.1
 */
exports.getApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await JobApplication.findById(applicationId)
      .populate('jobPosting', 'title location department company salary requirements customQuestions')
      .populate('applicant', 'firstName lastName email profilePicture')
      .populate('statusHistory.updatedBy', 'firstName lastName');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found'
        }
      });
    }

    // Authorization check: only applicant or job poster can view
    const isApplicant = application.applicant._id.toString() === req.user.id;
    const isJobPoster = application.jobPosting.postedBy && 
                        application.jobPosting.postedBy.toString() === req.user.id;

    if (!isApplicant && !isJobPoster && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You do not have permission to view this application'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });

  } catch (error) {
    logger.error('Error fetching application details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch application details',
        details: error.message
      }
    });
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

/**
 * Withdraw application
 * PATCH /api/applications/:applicationId/withdraw
 * Requirements: 6.1, 6.3, 6.4, 6.5, 6.6
 */
exports.withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await JobApplication.findById(applicationId)
      .populate('jobPosting', 'title postedBy');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found'
        }
      });
    }

    // Authorization check: only applicant can withdraw
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You can only withdraw your own applications'
        }
      });
    }

    // Check if withdrawal is allowed (Requirement 6.5)
    const withdrawableStatuses = ['Submitted', 'Reviewed'];
    if (!withdrawableStatuses.includes(application.status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WITHDRAWAL_NOT_ALLOWED',
          message: `Cannot withdraw application with status: ${application.status}. Withdrawal is only allowed for Submitted or Reviewed applications.`
        }
      });
    }

    // Update status to Withdrawn (Requirement 6.3)
    application.status = 'Withdrawn';
    application.withdrawnAt = new Date();
    application.statusHistory.push({
      status: 'Withdrawn',
      timestamp: new Date(),
      note: 'Application withdrawn by applicant'
    });

    await application.save();

    // Send notification to employer (Requirement 6.4)
    if (application.jobPosting.postedBy) {
      try {
        await notificationService.createNotification({
          recipient: application.jobPosting.postedBy,
          type: 'application_withdrawn',
          title: 'Application Withdrawn',
          message: `${application.fullName} has withdrawn their application for "${application.jobPosting.title}"`,
          relatedData: { 
            jobApplication: application._id,
            jobPosting: application.jobPosting._id,
            withdrawnAt: application.withdrawnAt
          },
          priority: 'medium'
        });
      } catch (notifError) {
        logger.error('Error sending withdrawal notification:', notifError);
      }
    }

    // Send real-time update via Pusher (Requirement 5.5)
    try {
      if (pusherService.isInitialized) {
        await pusherService.sendNotificationToUser(req.user.id, {
          type: 'application_status_changed',
          applicationId: application._id,
          status: 'Withdrawn',
          timestamp: application.withdrawnAt
        });
      }
    } catch (pusherError) {
      logger.error('Error sending Pusher notification:', pusherError);
    }

    res.status(200).json({
      success: true,
      data: {
        applicationId: application._id,
        status: application.status,
        withdrawnAt: application.withdrawnAt
      },
      message: 'Application withdrawn successfully'
    });

  } catch (error) {
    logger.error('Error withdrawing application:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'WITHDRAWAL_ERROR',
        message: 'Failed to withdraw application',
        details: error.message
      }
    });
  }
};

/**
 * Update application status (HR only)
 * PATCH /api/applications/:applicationId/status
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const { applicationId } = req.params;

    // Validate status
    const validStatuses = ['Submitted', 'Reviewed', 'Shortlisted', 'Interview Scheduled', 'Accepted', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        }
      });
    }

    const application = await JobApplication.findById(applicationId)
      .populate('jobPosting', 'title postedBy')
      .populate('applicant', '_id firstName lastName');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found'
        }
      });
    }

    // Authorization check: only job poster or HR can update status
    const isJobPoster = application.jobPosting.postedBy && 
                        application.jobPosting.postedBy.toString() === req.user.id;
    const isHR = req.user.role === 'company' || req.user.role === 'admin';

    if (!isJobPoster && !isHR) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Only the job poster or HR can update application status'
        }
      });
    }

    // Update status and history (Requirements 5.2, 5.3)
    application.status = status;
    application.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`,
      updatedBy: req.user.id
    });

    if (status === 'Reviewed' && !application.reviewedAt) {
      application.reviewedAt = new Date();
      application.reviewedBy = req.user.id;
    }

    await application.save();

    // Send notification to applicant (Requirement 5.4)
    const jobTitle = application.jobPosting?.title || 'the position';
    
    try {
      if (status === 'Accepted') {
        await notificationService.notifyApplicationAccepted(
          application.applicant._id,
          application._id,
          jobTitle
        );

        // منح نقاط الإحالة عند قبول الطلب (غير متزامن)
        setImmediate(async () => {
          try {
            const rewardsService = require('../services/rewardsService');
            await rewardsService.awardJobReward(application.applicant._id);
          } catch (err) {
            logger.error('خطأ في منح نقاط الوظيفة:', err);
          }
        });
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
      } else if (status === 'Interview Scheduled') {
        await notificationService.createNotification({
          recipient: application.applicant._id,
          type: 'interview_scheduled',
          title: 'Interview Scheduled! 📅',
          message: `An interview has been scheduled for your application to "${jobTitle}"`,
          relatedData: { jobApplication: application._id },
          priority: 'urgent'
        });
      }
    } catch (notifError) {
      logger.error('Error sending status notification:', notifError);
    }

    // Send real-time update via Pusher (Requirement 5.5)
    try {
      if (pusherService.isInitialized) {
        await pusherService.sendNotificationToUser(application.applicant._id, {
          type: 'application_status_changed',
          applicationId: application._id,
          status: status,
          jobTitle: jobTitle,
          timestamp: new Date().toISOString()
        });
      }
    } catch (pusherError) {
      logger.error('Error sending Pusher notification:', pusherError);
    }

    res.status(200).json({
      success: true,
      data: {
        applicationId: application._id,
        status: application.status,
        updatedAt: new Date()
      },
      message: 'Application status updated successfully'
    });

  } catch (error) {
    logger.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update application status',
        details: error.message
      }
    });
  }
};

// Legacy endpoint - kept for backward compatibility
exports.updateApplicationStatusLegacy = async (req, res) => {
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
