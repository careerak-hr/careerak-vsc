const TrainingCourse = require('../models/TrainingCourse');

exports.createTrainingCourse = async (req, res) => {
  try {
    const { title, description, objective, department, skillsFocused, duration, schedule, budget } = req.body;
    
    const trainingCourse = new TrainingCourse({
      title,
      description,
      objective,
      department,
      skillsFocused,
      duration,
      schedule,
      budget,
      trainer: req.user.id
    });

    await trainingCourse.save();
    res.status(201).json({ message: 'Training course created', data: trainingCourse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTrainingCourses = async (req, res) => {
  try {
    const courses = await TrainingCourse.find()
      .populate('trainer', 'firstName lastName')
      .populate('trainees.employeeId', 'firstName lastName');
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTrainingCourseById = async (req, res) => {
  try {
    const course = await TrainingCourse.findById(req.params.id)
      .populate('trainer', 'firstName lastName')
      .populate('trainees.employeeId', 'firstName lastName email department');
    if (!course) return res.status(404).json({ error: 'Training course not found' });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.enrollTrainee = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const course = await TrainingCourse.findByIdAndUpdate(
      req.params.id,
      { $push: { trainees: { employeeId, status: 'Enrolled' } } },
      { new: true }
    );
    res.status(200).json({ message: 'Trainee enrolled', data: course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCourseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const course = await TrainingCourse.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    res.status(200).json({ message: 'Course status updated', data: course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
