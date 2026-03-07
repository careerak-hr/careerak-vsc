/**
 * Wishlist Controller
 * Handles all wishlist-related endpoints for course wishlisting
 * 
 * Requirements: 8.1, 8.2, 8.3
 */

const Wishlist = require('../models/Wishlist');
const EducationalCourse = require('../models/EducationalCourse');

/**
 * GET /wishlist
 * Get user's wishlist with populated course details
 * 
 * Requirements: 8.3
 */
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find or create wishlist for user
    let wishlist = await Wishlist.findOne({ user: userId })
      .populate({
        path: 'courses.course',
        select: 'title description thumbnail price level totalDuration totalLessons stats badges category instructor',
        populate: {
          path: 'instructor',
          select: 'fullName profilePicture'
        }
      })
      .lean();

    // If no wishlist exists, create an empty one
    if (!wishlist) {
      wishlist = {
        user: userId,
        courses: [],
        courseCount: 0
      };
    }

    // Filter out any null courses (in case a course was deleted)
    if (wishlist.courses) {
      wishlist.courses = wishlist.courses.filter(item => item.course !== null);
    }

    return res.status(200).json({
      success: true,
      data: {
        wishlist,
        count: wishlist.courses.length
      }
    });

  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message
    });
  }
};

/**
 * POST /wishlist/:courseId
 * Add a course to user's wishlist
 * 
 * Requirements: 8.1
 */
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;
    const { notes } = req.body;

    // Validate course exists and is published
    const course = await EducationalCourse.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.status !== 'Published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add unpublished course to wishlist'
      });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, courses: [] });
    }

    // Check if course already in wishlist
    const existingIndex = wishlist.courses.findIndex(
      item => item.course.toString() === courseId.toString()
    );

    if (existingIndex !== -1) {
      // Course already in wishlist - update notes if provided
      if (notes !== undefined) {
        wishlist.courses[existingIndex].notes = notes;
      }
      
      await wishlist.save();
      
      // Populate course details
      await wishlist.populate({
        path: 'courses.course',
        select: 'title description thumbnail price level totalDuration totalLessons stats badges category instructor',
        populate: {
          path: 'instructor',
          select: 'fullName profilePicture'
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Course already in wishlist',
        data: {
          wishlist,
          addedCourse: wishlist.courses[existingIndex]
        }
      });
    }

    // Add course to wishlist
    wishlist.courses.push({
      course: courseId,
      addedAt: new Date(),
      notes: notes || ''
    });

    await wishlist.save();

    // Populate course details
    await wishlist.populate({
      path: 'courses.course',
      select: 'title description thumbnail price level totalDuration totalLessons stats badges category instructor',
      populate: {
        path: 'instructor',
        select: 'fullName profilePicture'
      }
    });

    // Get the newly added course
    const addedCourse = wishlist.courses[wishlist.courses.length - 1];

    return res.status(201).json({
      success: true,
      message: 'Course added to wishlist successfully',
      data: {
        wishlist,
        addedCourse
      }
    });

  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add course to wishlist',
      error: error.message
    });
  }
};

/**
 * DELETE /wishlist/:courseId
 * Remove a course from user's wishlist
 * 
 * Requirements: 8.2
 */
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    // Find wishlist
    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Check if course is in wishlist
    const courseIndex = wishlist.courses.findIndex(
      item => item.course.toString() === courseId.toString()
    );

    if (courseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Course not found in wishlist'
      });
    }

    // Remove course from wishlist
    wishlist.courses.splice(courseIndex, 1);
    await wishlist.save();

    // Populate remaining courses
    await wishlist.populate({
      path: 'courses.course',
      select: 'title description thumbnail price level totalDuration totalLessons stats badges category instructor',
      populate: {
        path: 'instructor',
        select: 'fullName profilePicture'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Course removed from wishlist successfully',
      data: {
        wishlist,
        count: wishlist.courses.length
      }
    });

  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove course from wishlist',
      error: error.message
    });
  }
};

/**
 * POST /wishlist/:courseId/notes
 * Update notes for a wishlisted course
 * 
 * Requirements: 8.3
 */
exports.updateWishlistNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;
    const { notes } = req.body;

    // Validate notes
    if (notes === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Notes field is required'
      });
    }

    if (notes.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Notes cannot exceed 500 characters'
      });
    }

    // Find wishlist
    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Find course in wishlist
    const courseItem = wishlist.courses.find(
      item => item.course.toString() === courseId.toString()
    );

    if (!courseItem) {
      return res.status(404).json({
        success: false,
        message: 'Course not found in wishlist'
      });
    }

    // Update notes
    courseItem.notes = notes;
    await wishlist.save();

    // Populate course details
    await wishlist.populate({
      path: 'courses.course',
      select: 'title description thumbnail price level totalDuration totalLessons stats badges category instructor',
      populate: {
        path: 'instructor',
        select: 'fullName profilePicture'
      }
    });

    // Find the updated course item
    const updatedCourseItem = wishlist.courses.find(
      item => item.course._id.toString() === courseId.toString()
    );

    return res.status(200).json({
      success: true,
      message: 'Notes updated successfully',
      data: {
        wishlistItem: updatedCourseItem
      }
    });

  } catch (error) {
    console.error('Error updating wishlist notes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notes',
      error: error.message
    });
  }
};
