/**
 * Course Controller
 * Handles all course-related endpoints including filtering, enrollment, progress tracking
 */

const EducationalCourse = require('../models/EducationalCourse');
const CourseEnrollment = require('../models/CourseEnrollment');
const CourseLesson = require('../models/CourseLesson');
const FilterService = require('../services/filterService');
const ProgressService = require('../services/progressService');
const certificateService = require('../services/certificateService');
const User = require('../models/User');
const crypto = require('crypto');

// Initialize services
const filterService = new FilterService();

// Initialize progress service
const notificationService = require('../services/notificationService');
const progressService = new ProgressService(
  CourseEnrollment,
  EducationalCourse,
  CourseLesson,
  certificateService,
  notificationService
);

/**
 * GET /courses
 * Get all courses with filtering and pagination
 */
exports.getCourses = async (req, res) => {
  try {
    // Extract query parameters
    const {
      level,
      category,
      minDuration,
      maxDuration,
      isFree,
      minRating,
      search,
      sort = 'newest',
      page = 1,
      limit = 12,
      view = 'grid'
    } = req.query;

    // Validate filters
    const validation = filterService.validateFilters({
      level,
      category,
      minDuration,
      maxDuration,
      isFree,
      minRating
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filter parameters',
        errors: validation.errors
      });
    }

    // Build filter query
    const filterQuery = filterService.buildFilterQuery({
      level,
      category,
      minDuration,
      maxDuration,
      isFree,
      minRating,
      search
    });

    // Build sort object
    const sortObject = filterService.buildSortObject(sort);

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [courses, totalCount] = await Promise.all([
      EducationalCourse.find(filterQuery)
        .sort(sortObject)
        .skip(skip)
        .limit(limitNum)
        .populate('instructor', 'fullName profilePicture')
        .select('-content -syllabus') // Exclude heavy fields
        .lean(),
      EducationalCourse.countDocuments(filterQuery)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          level,
          category,
          minDuration,
          maxDuration,
          isFree,
          minRating,
          search,
          sort,
          view
        }
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
};

/**
 * GET /courses/:id
 * Get course details by ID
 */
exports.getCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await EducationalCourse.findById(id)
      .populate('instructor', 'fullName profilePicture email')
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course is published (unless user is instructor or admin)
    if (course.status !== 'Published') {
      const userId = req.user?._id?.toString();
      const instructorId = course.instructor?._id?.toString();
      const isAdmin = req.user?.role === 'admin';

      if (userId !== instructorId && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Course is not published'
        });
      }
    }

    // Get lessons for syllabus
    const lessons = await CourseLesson.find({ course: id })
      .sort({ order: 1 })
      .select('title description order section duration isFree content')
      .lean();

    // Group lessons by section
    const syllabusWithLessons = course.syllabus.map(section => ({
      ...section,
      lessons: lessons.filter(lesson => lesson.section === section.section)
    }));

    // Check if user is enrolled (if authenticated)
    let enrollment = null;
    if (req.user) {
      enrollment = await CourseEnrollment.findOne({
        student: req.user._id,
        course: id
      }).select('status progress certificateIssued');
    }

    res.status(200).json({
      success: true,
      data: {
        course: {
          ...course,
          syllabus: syllabusWithLessons
        },
        enrollment,
        isEnrolled: !!enrollment
      }
    });
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course details',
      error: error.message
    });
  }
};

/**
 * GET /courses/:id/preview
 * Get preview content for a course (no authentication required)
 */
exports.getPreviewContent = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await EducationalCourse.findById(id)
      .select('title description level category totalDuration totalLessons thumbnail previewVideo stats syllabus')
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.status !== 'Published') {
      return res.status(403).json({
        success: false,
        message: 'Course preview not available'
      });
    }

    // Get first free lesson
    const freeLesson = await CourseLesson.findOne({
      course: id,
      isFree: true
    })
      .sort({ order: 1 })
      .select('title description duration videoUrl textContent')
      .lean();

    // Get syllabus outline (titles only, no content)
    const syllabusOutline = course.syllabus.map(section => ({
      section: section.section,
      lessons: section.lessons.map(lesson => ({
        title: lesson.title,
        duration: lesson.duration,
        isFree: lesson.isFree
      }))
    }));

    // Increment preview views counter
    await EducationalCourse.findByIdAndUpdate(
      id,
      { $inc: { 'stats.previewViews': 1 } },
      { new: false }
    );

    res.status(200).json({
      success: true,
      data: {
        course: {
          title: course.title,
          description: course.description,
          level: course.level,
          category: course.category,
          totalDuration: course.totalDuration,
          totalLessons: course.totalLessons,
          thumbnail: course.thumbnail,
          previewVideo: course.previewVideo,
          stats: course.stats
        },
        freeLesson,
        syllabusOutline
      }
    });
  } catch (error) {
    console.error('Error fetching preview content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch preview content',
      error: error.message
    });
  }
};

/**
 * POST /courses/:id/enroll
 * Enroll user in a course
 */
exports.enrollInCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { referralToken } = req.body; // Get referral token from request body

    // Check if course exists and is published
    const course = await EducationalCourse.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.status !== 'Published') {
      return res.status(403).json({
        success: false,
        message: 'Course is not available for enrollment'
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = await CourseEnrollment.findOne({
      student: userId,
      course: id
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course',
        enrollment: existingEnrollment
      });
    }

    // Handle payment if course is paid
    if (!course.price.isFree) {
      // TODO: Integrate payment processing
      // For now, we'll create enrollment assuming payment is handled
      const { transactionId, amount } = req.body;
      
      if (!transactionId) {
        return res.status(400).json({
          success: false,
          message: 'Payment required for this course'
        });
      }
    }

    // Prepare enrollment data
    const enrollmentData = {
      course: id,
      student: userId,
      status: 'active',
      progress: {
        completedLessons: [],
        percentageComplete: 0,
        lastAccessedAt: new Date()
      },
      payment: !course.price.isFree ? {
        amount: req.body.amount || course.price.amount,
        currency: course.price.currency,
        transactionId: req.body.transactionId,
        paidAt: new Date()
      } : undefined
    };

    // Check for referral token and validate it
    let referralInfo = null;
    if (referralToken) {
      const referral = course.referrals.find(
        r => r.token === referralToken && r.expiresAt > new Date()
      );

      if (referral) {
        // Add referral information to enrollment
        enrollmentData.referral = {
          token: referralToken,
          referrerId: referral.referrerId,
          referredAt: new Date()
        };

        referralInfo = {
          referrerId: referral.referrerId,
          token: referralToken
        };

        // Increment referral enrollment count
        await EducationalCourse.updateOne(
          { _id: id, 'referrals.token': referralToken },
          { $inc: { 'referrals.$.enrollments': 1 } }
        );
      }
    }

    // Create enrollment
    const enrollment = new CourseEnrollment(enrollmentData);
    await enrollment.save();

    // Update course stats
    await EducationalCourse.findByIdAndUpdate(
      id,
      {
        $inc: {
          'stats.totalEnrollments': 1,
          'stats.activeEnrollments': 1
        }
      }
    );

    // TODO: Send enrollment notification
    // await notificationService.sendEnrollmentNotification(enrollment);

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        enrollment,
        referral: referralInfo ? {
          credited: true,
          referrerId: referralInfo.referrerId
        } : null
      }
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course',
      error: error.message
    });
  }
};

/**
 * GET /courses/my-courses
 * Get user's enrolled courses
 */
exports.getMyEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    // Build query
    const query = { student: userId };
    if (status && ['active', 'completed', 'dropped'].includes(status)) {
      query.status = status;
    }

    // Get enrollments with populated course data
    const enrollments = await CourseEnrollment.find(query)
      .populate({
        path: 'course',
        select: 'title description level category totalDuration totalLessons thumbnail instructor stats badges',
        populate: {
          path: 'instructor',
          select: 'fullName profilePicture'
        }
      })
      .populate('progress.currentLesson', 'title order')
      .sort({ 'progress.lastAccessedAt': -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        enrollments,
        count: enrollments.length
      }
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled courses',
      error: error.message
    });
  }
};

/**
 * GET /courses/:id/progress
 * Get course progress for enrolled user
 */
exports.getCourseProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Get enrollment
    const enrollment = await CourseEnrollment.findOne({
      student: userId,
      course: id
    })
      .populate('progress.completedLessons', 'title order duration')
      .populate('progress.currentLesson', 'title order duration')
      .lean();

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Get next lesson
    const nextLesson = await progressService.getNextLesson(enrollment._id);

    res.status(200).json({
      success: true,
      data: {
        enrollment,
        nextLesson,
        progress: {
          percentageComplete: enrollment.progress.percentageComplete,
          completedLessons: enrollment.progress.completedLessons.length,
          lastAccessedAt: enrollment.progress.lastAccessedAt
        }
      }
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course progress',
      error: error.message
    });
  }
};

/**
 * POST /courses/:id/lessons/:lessonId/complete
 * Mark a lesson as complete
 */
exports.markLessonComplete = async (req, res) => {
  try {
    const { id, lessonId } = req.params;
    const userId = req.user._id;

    // Verify enrollment
    const enrollment = await CourseEnrollment.findOne({
      student: userId,
      course: id
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Verify lesson belongs to course
    const lesson = await CourseLesson.findOne({
      _id: lessonId,
      course: id
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found in this course'
      });
    }

    // Mark lesson complete using progress service
    const updatedEnrollment = await progressService.markLessonComplete(
      enrollment._id,
      lessonId
    );

    // Populate for response
    await updatedEnrollment.populate('progress.completedLessons', 'title order');

    // Check if course was just completed
    const justCompleted = updatedEnrollment.status === 'completed' && 
                          enrollment.status !== 'completed';

    res.status(200).json({
      success: true,
      message: justCompleted ? 'Congratulations! You completed the course!' : 'Lesson marked as complete',
      data: {
        enrollment: updatedEnrollment,
        progress: {
          percentageComplete: updatedEnrollment.progress.percentageComplete,
          completedLessons: updatedEnrollment.progress.completedLessons.length,
          status: updatedEnrollment.status
        },
        certificate: justCompleted && updatedEnrollment.certificateIssued.issued ? {
          issued: true,
          certificateUrl: updatedEnrollment.certificateIssued.certificateUrl,
          certificateId: updatedEnrollment.certificateIssued.certificateId
        } : null
      }
    });
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark lesson complete',
      error: error.message
    });
  }
};

/**
 * GET /courses/:id/certificate
 * Get course completion certificate
 */
exports.getCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Get enrollment
    const enrollment = await CourseEnrollment.findOne({
      student: userId,
      course: id
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Check if course is completed
    if (enrollment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Course not completed yet',
        progress: enrollment.progress.percentageComplete
      });
    }

    // Check if certificate was issued
    if (!enrollment.certificateIssued.issued) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not issued for this course'
      });
    }

    // Track certificate download (optional)
    // You could add a downloads counter here

    res.status(200).json({
      success: true,
      data: {
        certificate: {
          certificateUrl: enrollment.certificateIssued.certificateUrl,
          certificateId: enrollment.certificateIssued.certificateId,
          issuedAt: enrollment.certificateIssued.issuedAt,
          completedAt: enrollment.completedAt
        }
      }
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate',
      error: error.message
    });
  }
};

/**
 * POST /courses/:id/share
 * Generate unique shareable URL with tracking token
 * Requirements: 8.5
 */
exports.shareCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id; // Optional authentication

    // Check if course exists and is published
    const course = await EducationalCourse.findById(id).select('title status');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.status !== 'Published') {
      return res.status(403).json({
        success: false,
        message: 'Cannot share unpublished course'
      });
    }

    // Generate unique tracking token
    const token = crypto.randomBytes(16).toString('hex');
    
    // Store referral information
    const referralData = {
      token,
      courseId: id,
      referrerId: userId || null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    };

    // Store in course document (or create a separate CourseReferral model)
    await EducationalCourse.findByIdAndUpdate(
      id,
      {
        $push: {
          referrals: referralData
        }
      }
    );

    // Generate shareable URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const shareableUrl = `${baseUrl}/courses/shared/${token}`;

    res.status(200).json({
      success: true,
      message: 'Shareable link generated successfully',
      data: {
        shareableUrl,
        token,
        expiresAt: referralData.expiresAt,
        course: {
          id: course._id,
          title: course.title
        }
      }
    });
  } catch (error) {
    console.error('Error generating shareable link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate shareable link',
      error: error.message
    });
  }
};

/**
 * GET /courses/shared/:token
 * Decode sharing token and redirect to course details
 * Requirements: 8.6
 */
exports.getSharedCourse = async (req, res) => {
  try {
    const { token } = req.params;

    // Find course with this referral token
    const course = await EducationalCourse.findOne({
      'referrals.token': token,
      'referrals.expiresAt': { $gt: new Date() }
    }).select('_id title referrals');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired share link'
      });
    }

    // Find the specific referral
    const referral = course.referrals.find(r => r.token === token);

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    // Track referral source (increment view count)
    await EducationalCourse.updateOne(
      { _id: course._id, 'referrals.token': token },
      {
        $inc: { 'referrals.$.views': 1 },
        $set: { 'referrals.$.lastAccessedAt': new Date() }
      }
    );

    // Return course ID and referral info for frontend to handle redirect
    res.status(200).json({
      success: true,
      data: {
        courseId: course._id,
        referralToken: token,
        referrerId: referral.referrerId,
        course: {
          id: course._id,
          title: course.title
        },
        redirectUrl: `/courses/${course._id}`
      }
    });
  } catch (error) {
    console.error('Error processing shared link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process shared link',
      error: error.message
    });
  }
};

module.exports = exports;
