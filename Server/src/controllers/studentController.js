// src/controllers/studentController.js
const LeavingCertificate = require('../models/LeavingCertificate');
const AlumniRegistration = require('../models/AlumniRegistration');
const Department = require('../models/Department');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

// Debug cloudinary config on load
console.log('Cloudinary config check:', {
  cloud_name: cloudinary.config().cloud_name ? 'SET' : 'MISSING',
  api_key: cloudinary.config().api_key ? 'SET' : 'MISSING',
  api_secret: cloudinary.config().api_secret ? 'SET (length: ' + cloudinary.config().api_secret.length + ')' : 'MISSING'
});

exports.applyLeavingCertificate = async (req, res) => {
  try {
    const existingApplication = await LeavingCertificate.findOne({ student: req.user._id, status: { $in: ['pending', 'approved'] } });
    if (existingApplication) {
      return res.status(400).json({ message: 'Application already exists or approved' });
    }

    const {
      firstName, middleName, lastName, motherName, religion, caste, nationality, dob, birthPlace,
      prn, admissionYear, branch, lastExamYear, result, lastSchool, reason
    } = req.body;

    // Handle marksheet upload to Cloudinary
    let marksheetUrl = null;
    if (req.file) {
      let filePath = null;
      try {
        // Save file to temp directory first (matching working pattern from principalController)
        const tempDir = path.join(__dirname, '..', '..', 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        
        const fileExt = path.extname(req.file.originalname) || '.jpg';
        const fileName = `marksheet_${req.user._id}_${Date.now()}${fileExt}`;
        filePath = path.join(tempDir, fileName);
        
        // Write buffer to temp file
        fs.writeFileSync(filePath, req.file.buffer);
        
        // Determine resource_type based on file mimetype
        // PDFs need 'raw', images need 'image'
        const isPdf = req.file.mimetype === 'application/pdf';
        const resourceType = isPdf ? 'raw' : 'image';
        
        // Upload to Cloudinary using file path (storing in student_result folder)
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: 'student_result',
          resource_type: resourceType,
          public_id: `marksheet_${req.user._id}_${Date.now()}`,
          timeout: 120000,
          access_mode: 'public',  // Ensure file is publicly accessible
          type: 'upload'  // Standard upload (publicly accessible)
        });
        
        // Clean up temp file
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        
        marksheetUrl = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        // Clean up temp file if upload fails
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(500).json({ message: 'Failed to upload marksheet' });
      }
    }

    const dbDepartments = await Department.find();
    let departments = dbDepartments.map(d => d.name);
    
    // Fallback if no departments are in the DB yet
    if (departments.length === 0) {
      departments = [
        'Lab 1', 'Lab 2', 'Lab 3', 'Lab 4', 'Lab 5', 'Lab 6',
        'Training and Placement', 'Alumni Association', 'Transport',
        'Workshop', 'Hostel', 'Canteen', 'Stationary', 'Library',
        'IT Infra', 'Sports', 'Exam'
      ];
    }
    const noDuesStatuses = departments.map((dept) => ({ department: dept }));

    const application = await LeavingCertificate.create({
      student: req.user._id,
      firstName, middleName, lastName, motherName, religion, caste, nationality, dob, birthPlace,
      prn, admissionYear, branch, lastExamYear, result, lastSchool, reason,
      noDuesStatuses,
      marksheetUrl,
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

const generateCertificatePDF = require('../utils/pdfGenerator');

// Download Certificate PDF
exports.downloadCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await LeavingCertificate.findById(id).populate('student');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if approved (optional strictly, but good practice)
    if (application.status !== 'approved') {
       return res.status(400).json({ message: 'Certificate not yet approved' });
    }

    // If a final certificate has been generated and uploaded, redirect to it
    if (application.certificateUrl) {
      return res.redirect(application.certificateUrl);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=LC_${application.prn}.pdf`);

    generateCertificatePDF(application, res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating certificate' });
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

// Cancel/Delete LC Application
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await LeavingCertificate.findOne({ _id: id, student: req.user._id });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status === 'approved') {
      return res.status(400).json({ message: 'Cannot cancel an approved application' });
    }

    await LeavingCertificate.findByIdAndDelete(id);
    res.json({ message: 'Application cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
