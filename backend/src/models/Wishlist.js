const mongoose = require('mongoose');

/**
 * Wishlist Model
 * 
 * Manages user wishlists for courses they're interested in.
 * Each user has one wishlist that can contain multiple courses.
 * 
 * Requirements: 8.1, 8.2, 8.3
 */
const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Each user has exactly one wishlist
  },
  
  courses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EducationalCourse',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: 500,
      default: ''
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
wishlistSchema.index({ user: 1 }); // Unique index for user lookup
wishlistSchema.index({ 'courses.course': 1 }); // Index for checking if course is in wishlist

/**
 * Add a course to the wishlist
 * @param {ObjectId} courseId - The course to add
 * @param {String} notes - Optional notes about the course
 * @returns {Object} The updated wishlist
 */
wishlistSchema.methods.addCourse = function(courseId, notes = '') {
  // Check if course already exists in wishlist
  const existingIndex = this.courses.findIndex(
    item => item.course.toString() === courseId.toString()
  );
  
  if (existingIndex !== -1) {
    // Course already in wishlist, update notes if provided
    if (notes) {
      this.courses[existingIndex].notes = notes;
    }
    return this;
  }
  
  // Add new course to wishlist
  this.courses.push({
    course: courseId,
    addedAt: new Date(),
    notes: notes
  });
  
  return this;
};

/**
 * Remove a course from the wishlist
 * @param {ObjectId} courseId - The course to remove
 * @returns {Object} The updated wishlist
 */
wishlistSchema.methods.removeCourse = function(courseId) {
  this.courses = this.courses.filter(
    item => item.course.toString() !== courseId.toString()
  );
  return this;
};

/**
 * Check if a course is in the wishlist
 * @param {ObjectId} courseId - The course to check
 * @returns {Boolean} True if course is in wishlist
 */
wishlistSchema.methods.hasCourse = function(courseId) {
  return this.courses.some(
    item => item.course.toString() === courseId.toString()
  );
};

/**
 * Get a specific course item from the wishlist
 * @param {ObjectId} courseId - The course to get
 * @returns {Object|null} The course item or null if not found
 */
wishlistSchema.methods.getCourse = function(courseId) {
  return this.courses.find(
    item => item.course.toString() === courseId.toString()
  ) || null;
};

/**
 * Update notes for a course in the wishlist
 * @param {ObjectId} courseId - The course to update
 * @param {String} notes - The new notes
 * @returns {Boolean} True if course was found and updated
 */
wishlistSchema.methods.updateNotes = function(courseId, notes) {
  const courseItem = this.courses.find(
    item => item.course.toString() === courseId.toString()
  );
  
  if (courseItem) {
    courseItem.notes = notes;
    return true;
  }
  
  return false;
};

/**
 * Get the total number of courses in the wishlist
 * @returns {Number} The count of courses
 */
wishlistSchema.methods.getCount = function() {
  return this.courses.length;
};

/**
 * Static method to find or create a wishlist for a user
 * @param {ObjectId} userId - The user ID
 * @returns {Object} The user's wishlist
 */
wishlistSchema.statics.findOrCreate = async function(userId) {
  let wishlist = await this.findOne({ user: userId });
  
  if (!wishlist) {
    wishlist = await this.create({ user: userId, courses: [] });
  }
  
  return wishlist;
};

/**
 * Static method to add a course to a user's wishlist
 * @param {ObjectId} userId - The user ID
 * @param {ObjectId} courseId - The course ID
 * @param {String} notes - Optional notes
 * @returns {Object} The updated wishlist
 */
wishlistSchema.statics.addCourseToUserWishlist = async function(userId, courseId, notes = '') {
  const wishlist = await this.findOrCreate(userId);
  wishlist.addCourse(courseId, notes);
  await wishlist.save();
  return wishlist;
};

/**
 * Static method to remove a course from a user's wishlist
 * @param {ObjectId} userId - The user ID
 * @param {ObjectId} courseId - The course ID
 * @returns {Object} The updated wishlist
 */
wishlistSchema.statics.removeCourseFromUserWishlist = async function(userId, courseId) {
  const wishlist = await this.findOne({ user: userId });
  
  if (!wishlist) {
    throw new Error('Wishlist not found');
  }
  
  wishlist.removeCourse(courseId);
  await wishlist.save();
  return wishlist;
};

/**
 * Static method to check if a course is in a user's wishlist
 * @param {ObjectId} userId - The user ID
 * @param {ObjectId} courseId - The course ID
 * @returns {Boolean} True if course is in wishlist
 */
wishlistSchema.statics.userHasCourse = async function(userId, courseId) {
  const wishlist = await this.findOne({ user: userId });
  
  if (!wishlist) {
    return false;
  }
  
  return wishlist.hasCourse(courseId);
};

// Virtual for course count
wishlistSchema.virtual('courseCount').get(function() {
  return this.courses.length;
});

// Ensure virtuals are included in JSON output
wishlistSchema.set('toJSON', { virtuals: true });
wishlistSchema.set('toObject', { virtuals: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
