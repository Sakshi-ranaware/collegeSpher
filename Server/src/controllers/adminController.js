// src/controllers/adminController.js
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const LeavingCertificate = require('../models/LeavingCertificate');
const AlumniRegistration = require('../models/AlumniRegistration');
const User = require('../models/User');
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
