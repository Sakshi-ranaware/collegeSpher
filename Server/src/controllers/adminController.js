// src/controllers/adminController.js
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const LeavingCertificate = require('../models/LeavingCertificate');
const AlumniRegistration = require('../models/AlumniRegistration');
const User = require('../models/User');
const Department = require('../models/Department');
const { sendEmail, getAccountApprovalTemplate, getAccountRejectionTemplate } = require('../utils/emailService');

// --- Leaving Certificate Management ---

// List pending LC applications (all departments approved)
exports.getPendingFinal = async (req, res) => {
  try {
    const applications = await LeavingCertificate.find({
      status: 'pending',
      noDuesStatuses: { $not: { $elemMatch: { status: { $ne: 'approved' } } } },
    }).populate('student', 'name email').sort('-createdAt');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List all LC applications
exports.getAllLeavingCertificates = async (req, res) => {
  try {
    const applications = await LeavingCertificate.find().populate('student', 'name email').sort('-createdAt');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Final approve LC and generate PDF
exports.finalApprove = async (req, res) => {
  const { id } = req.params;
  const { finalRemark } = req.body;
  try {
    const application = await LeavingCertificate.findById(id).populate('student');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status !== 'pending') return res.status(400).json({ message: 'Already processed' });
    
    // Check department status if strictly required, for now we assume admin can override or check UI
    
    // Ensure certificates directory exists
    const certDir = path.join(__dirname, '..', '..', 'certificates');
    if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

    const fileName = `LC_${application.student._id}_${Date.now()}.pdf`;
    const filePath = path.join(certDir, fileName);
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.fontSize(20).text('Leaving Certificate', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${application.firstName} ${application.middleName} ${application.lastName}`);
    doc.text(`PRN: ${application.prn}`);
    doc.text(`Approved Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Remark: ${finalRemark || 'Satisfactory'}`);
    doc.end();

    writeStream.on('finish', async () => {
      application.status = 'approved';
      application.certificateUrl = `/certificates/${fileName}`;
      application.finalRemark = finalRemark;
      await application.save();
      res.json(application);
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Alumni Management ---

exports.getAlumniApplications = async (req, res) => {
  try {
    const applications = await AlumniRegistration.find().populate('student', 'name email').sort('-createdAt');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAlumniStatus = async (req, res) => {
  const { id } = req.params;
  const { status, adminRemark } = req.body;
  try {
    const application = await AlumniRegistration.findById(id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    
    application.status = status;
    application.adminRemark = adminRemark;
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update No Dues Details for a specific LC Application
exports.updateNoDuesDetails = async (req, res) => {
  const { id } = req.params;
  const { noDuesStatuses } = req.body; // Expecting the full array or specific updates
  
  try {
    const application = await LeavingCertificate.findById(id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (noDuesStatuses && Array.isArray(noDuesStatuses)) {
       noDuesStatuses.forEach(update => {
         const index = application.noDuesStatuses.findIndex(item => item.department === update.department);
         if (index !== -1) {
           application.noDuesStatuses[index].dueAmount = update.dueAmount;
           application.noDuesStatuses[index].remark = update.remark;
           application.noDuesStatuses[index].authorityName = update.authorityName;
           application.noDuesStatuses[index].signature = update.signature;
           application.noDuesStatuses[index].updatedAt = Date.now();
         }
       });
    }

    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- User Approval Management ---

exports.getUnapprovedUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: false }).sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveUser = async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body; // status: approved / rejected
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (status === 'approved') {
      user.isApproved = true;
      await user.save();
      
      // Send approval email
      const html = getAccountApprovalTemplate(user.name, user.role);
      await sendEmail(user.email, 'Account Approved - CollegeSphere', `Dear ${user.name}, your account as ${user.role} has been approved.`, html);
      
      res.json({ message: 'User approved successfully', user });
    } else {
      // Send rejection email before deleting
      const html = getAccountRejectionTemplate(user.name, user.role, reason);
      await sendEmail(user.email, 'Account Registration Rejected - CollegeSphere', `Dear ${user.name}, your account registration has been rejected.`, html);
      
      await User.findByIdAndDelete(id);
      res.json({ message: 'User registration rejected and account deleted' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Department Management ---

exports.getDepartments = async (req, res) => {
  try {
    let departments = await Department.find().sort('name');
    
    if (departments.length === 0) {
      const defaultDepts = [
        'Lab 1', 'Lab 2', 'Lab 3', 'Lab 4', 'Lab 5', 'Lab 6',
        'Training and Placement', 'Alumni Association', 'Transport',
        'Workshop', 'Hostel', 'Canteen', 'Stationary', 'Library',
        'IT Infra', 'Sports', 'Exam'
      ];
      
      const seedData = defaultDepts.map(name => ({ name }));
      await Department.insertMany(seedData);
      
      departments = await Department.find().sort('name');
    }
    
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Department name is required' });
    const exists = await Department.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Department already exists' });
    const department = await Department.create({ name });
    res.status(201).json(department);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await Department.findByIdAndDelete(id);
    res.json({ message: 'Department removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Staff Management ---

exports.getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['hod', 'department'] } }).select('-password').sort('department name');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addStaff = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      isApproved: true
    });

    res.status(201).json({ message: 'Staff added successfully', user: { _id: user._id, name, email, role, department } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeStaff = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'Staff removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleStaffApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isApproved = isApproved;
    await user.save();
    res.json({ message: 'Approval status updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
