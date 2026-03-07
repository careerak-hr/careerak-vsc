const ApplicationDraft = require('../models/ApplicationDraft');
const JobPosting = require('../models/JobPosting');

/**
 * Create or update a draft application
 * POST /api/applications/drafts
 * Requirements: 2.1, 2.2, 2.3, 11.1
 */
exports.createOrUpdateDraft = async (req, res) => {
  try {
    const { jobPostingId, step, formData, files, customAnswers } = req.body;
    const applicantId = req.user.id;

    // Validate required fields
    if (!jobPostingId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Job posting ID is required',
          field: 'jobPostingId'
        }
      });
    }

    // Verify job posting exists
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

    // Validate step number
    if (step && (step < 1 || step > 5)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Step must be between 1 and 5',
          field: 'step'
        }
      });
    }

    // Prepare draft data
    const draftData = {
      jobPosting: jobPostingId,
      applicant: applicantId,
      lastSaved: new Date()
    };

    if (step !== undefined) {
      draftData.step = step;
    }

    if (formData) {
      draftData.formData = formData;
    }

    if (files) {
      draftData.files = files;
    }

    if (customAnswers) {
      draftData.customAnswers = customAnswers;
    }

    // Use findOneAndUpdate with upsert to create or update
    const draft = await ApplicationDraft.findOneAndUpdate(
      { applicant: applicantId, jobPosting: jobPostingId },
      draftData,
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: {
        draftId: draft._id,
        savedAt: draft.lastSaved
      }
    });
  } catch (error) {
    console.error('Create/Update Draft Error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid draft data',
          details: Object.keys(error.errors).map(key => ({
            field: key,
            message: error.errors[key].message
          }))
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to save draft'
      }
    });
  }
};

/**
 * Get draft for a specific job posting
 * GET /api/applications/drafts/:jobPostingId
 * Requirements: 2.3, 2.4, 4.10
 */
exports.getDraft = async (req, res) => {
  try {
    const { jobPostingId } = req.params;
    const applicantId = req.user.id;

    // Validate job posting ID
    if (!jobPostingId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Job posting ID is required'
        }
      });
    }

    // Find draft
    const draft = await ApplicationDraft.findOne({
      applicant: applicantId,
      jobPosting: jobPostingId
    });

    if (!draft) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DRAFT_NOT_FOUND',
          message: 'No draft found for this job posting'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        draftId: draft._id,
        step: draft.step,
        formData: draft.formData,
        files: draft.files,
        customAnswers: draft.customAnswers,
        savedAt: draft.lastSaved
      }
    });
  } catch (error) {
    console.error('Get Draft Error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to retrieve draft'
      }
    });
  }
};

/**
 * Delete a draft
 * DELETE /api/applications/drafts/:draftId
 * Requirements: 2.7
 */
exports.deleteDraft = async (req, res) => {
  try {
    const { draftId } = req.params;
    const applicantId = req.user.id;

    // Validate draft ID
    if (!draftId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Draft ID is required'
        }
      });
    }

    // Find and delete draft (ensure user owns the draft)
    const draft = await ApplicationDraft.findOneAndDelete({
      _id: draftId,
      applicant: applicantId
    });

    if (!draft) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DRAFT_NOT_FOUND',
          message: 'Draft not found or you do not have permission to delete it'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Draft deleted successfully'
    });
  } catch (error) {
    console.error('Delete Draft Error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete draft'
      }
    });
  }
};

/**
 * Get all drafts for the authenticated user
 * GET /api/applications/drafts
 * Helper endpoint for user to see all their drafts
 */
exports.getAllDrafts = async (req, res) => {
  try {
    const applicantId = req.user.id;

    const drafts = await ApplicationDraft.find({ applicant: applicantId })
      .populate('jobPosting', 'title company location')
      .sort({ lastSaved: -1 });

    res.status(200).json({
      success: true,
      data: drafts.map(draft => ({
        draftId: draft._id,
        jobPosting: draft.jobPosting,
        step: draft.step,
        savedAt: draft.lastSaved
      }))
    });
  } catch (error) {
    console.error('Get All Drafts Error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to retrieve drafts'
      }
    });
  }
};
