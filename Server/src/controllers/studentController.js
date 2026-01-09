// src/controllers/studentController.js
const LeavingCertificate = require('../models/LeavingCertificate');
const AlumniRegistration = require('../models/AlumniRegistration');

// Student applies for Leaving Certificate
exports.applyLeavingCertificate = async (req, res) => {
  try {
    const existingApplication = await LeavingCertificate.findOne({ student: req.user._id, status: { $in: ['pending', 'approved'] } });
    if (existingApplication) {
      return res.status(400).json({ message: 'Application already exists or approved' });
    }

    const {
      firstName, middleName, lastName, motherName, religion, caste, nationality, dob, birthPlace,
      prn, admissionYear, branch, lastExamYear, result, reason
    } = req.body;

    const departments = ['Library', 'Hostel', 'Exam', 'Labs'];
    const noDuesStatuses = departments.map((dept) => ({ department: dept }));

    const application = await LeavingCertificate.create({
      student: req.user._id,
      firstName, middleName, lastName, motherName, religion, caste, nationality, dob, birthPlace,
      prn, admissionYear, branch, lastExamYear, result, reason,
      noDuesStatuses,
    });

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get student's LC applications
exports.getMyApplications = async (req, res) => {
  try {
    const list = await LeavingCertificate.find({ student: req.user._id }).sort('-createdAt');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student applies for Alumni Registration
exports.registerAlumni = async (req, res) => {
  try {
    const existingApplication = await AlumniRegistration.findOne({ student: req.user._id });
    if (existingApplication) {
      return res.status(400).json({ message: 'Alumni registration already exists' });
    }

    const application = await AlumniRegistration.create({
      student: req.user._id,
      ...req.body
    });

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get student's Alumni applications
exports.getAlumniApplications = async (req, res) => {
  try {
    const list = await AlumniRegistration.find({ student: req.user._id }).sort('-createdAt');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
