
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const LeavingCertificate = require('../models/LeavingCertificate');
const generateCertificatePDF = require('../utils/pdfGenerator');

const cloudinary = require('../config/cloudinary');

// Get all applications pending Principal Review
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await LeavingCertificate.find({
      workflowStage: { $in: ['principal_pending', 'completed'] }
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

    // Temporary file path
    const tempDir = path.join(__dirname, '..', '..', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const fileName = `LC_${application.student._id}_${Date.now()}.pdf`;
    const filePath = path.join(tempDir, fileName);
    const writeStream = fs.createWriteStream(filePath);
    // Use the improved PDF generator
    generateCertificatePDF(application, writeStream);

    writeStream.on('finish', async () => {
      try {
        // Check file size, log it
        const stats = fs.statSync(filePath);
        console.log(`Uploading PDF to Cloudinary. Size: ${stats.size} bytes`);

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'leaving_certificates',
          resource_type: 'auto',
          public_id: path.parse(fileName).name,
          timeout: 120000 
        });

        // Clean up temp file
        fs.unlinkSync(filePath);

        application.workflowStage = 'completed';
        application.certificateUrl = result.secure_url;
        application.principalApproval = {
          status: 'approved',
          date: Date.now(),
          remark
        };
        application.status = 'approved';
        await application.save();
        res.json(application);
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        // Clean up temp file if upload fails
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(500).json({ message: 'Error uploading certificate to cloud' });
      }
    });

    writeStream.on('error', (err) => {
      console.error('PDF generation error:', err);
      res.status(500).json({ message: 'Error generating PDF' });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Download LC PDF
exports.downloadLC = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await LeavingCertificate.findById(id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Ensure it is completed
    if (application.workflowStage !== 'completed') {
       return res.status(400).json({ message: 'Certificate not yet generated' });
    }

    if (!application.certificateUrl) {
        return res.status(404).json({ message: 'Certificate URL not found' });
    }

    // Redirect to the Cloudinary URL
    res.redirect(application.certificateUrl);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error downloading certificate' });
  }
};
