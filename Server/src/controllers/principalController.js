
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const LeavingCertificate = require('../models/LeavingCertificate');

// Get all applications pending Principal Review
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await LeavingCertificate.find({
      workflowStage: 'principal_pending'
    }).populate('student', 'name email').sort('-createdAt');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate LC (Final Approval)
exports.generateLC = async (req, res) => {
  const { id } = req.params;
  const { remark } = req.body;
  
  try {
    const application = await LeavingCertificate.findById(id).populate('student');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.workflowStage !== 'principal_pending') {
      return res.status(400).json({ message: 'Application not ready for LC generation' });
    }

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
    doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`);
    doc.text('This is to certify that the above student has cleared all dues.');
    doc.moveDown();
    doc.text(`Principal Remark: ${remark || 'None'}`);
    doc.end();

    writeStream.on('finish', async () => {
      application.workflowStage = 'completed';
      application.certificateUrl = `/certificates/${fileName}`;
      application.principalApproval = {
        status: 'approved',
        date: Date.now(),
        remark
      };
      application.status = 'approved';
      await application.save();
      res.json(application);
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
