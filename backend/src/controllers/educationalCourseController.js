const EducationalCourse = require('../models/EducationalCourse');

exports.createCourse = async (req, res) => {
  try {
    const { title, description, content, category, duration, level, maxParticipants, startDate, endDate } = req.body;
    
    const course = new EducationalCourse({
      title,
      description,
      content,
      category,
      duration,
      level,
      maxParticipants,
      startDate,
      endDate,
      instructor: req.user.id
    });

    await course.save();
    res.status(201).json({ message: 'Educational course created', data: course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await EducationalCourse.find({ status: 'Published' })
      .populate('instructor', 'firstName lastName');
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await EducationalCourse.findById(req.params.id)
      .populate('instructor', 'firstName lastName')
      .populate('enrolledParticipants', 'firstName lastName email');
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.enrollInCourse = async (req, res) => {
  try {
    const course = await EducationalCourse.findByIdAndUpdate(
      req.params.id,
      { $push: { enrolledParticipants: req.user.id } },
      { new: true }
    );
    res.status(200).json({ message: 'Enrolled in course', data: course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await EducationalCourse.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.status(200).json({ message: 'Course updated', data: course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
