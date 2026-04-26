// src/controllers/departmentController.js
const LeavingCertificate = require('../models/LeavingCertificate');
const { sendEmail, getDuesPendingTemplate, getLCClearedTemplate } = require('../utils/emailService');

// Get applications assigned to department of logged-in department user
exports.getAssignedApplications = async (req, res) => {
  const { department } = req.user;
  try {
    const applications = await LeavingCertificate.find({
      'noDuesStatuses.department': department,
    });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update specific department details (No Dues Row)
exports.updateStatus = async (req, res) => {
  const { id } = req.params; 
  const { dueAmount, remark, authorityName, signature } = req.body; 
  const { department } = req.user;
  
  try {
    const application = await LeavingCertificate.findById(id).populate('student');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Find the department using flexible matching (trim)
    const deptStatus = application.noDuesStatuses.find(
      (d) => d.department.trim() === department.trim()
    );

    if (!deptStatus) {
      return res.status(400).json({ 
        message: `Department '${department}' not assigned to this application. Available: ${application.noDuesStatuses.map(d => d.department).join(', ')}` 
      });
    }

    // Capture new values or keep old ones
    if (dueAmount !== undefined) deptStatus.dueAmount = Number(dueAmount);
    if (remark !== undefined) deptStatus.remark = remark;
    if (authorityName !== undefined) deptStatus.authorityName = authorityName;
    if (signature !== undefined) deptStatus.signature = signature;

    // Update status if provided explicitly, otherwise infer from dueAmount
    if (req.body.status) {
        deptStatus.status = req.body.status;
        // If cleared, ensure dueAmount is 0
        if (req.body.status === 'cleared') {
            deptStatus.dueAmount = 0;
        }
    } else {
        // Auto-update status logic (legacy/fallback)
        if (deptStatus.dueAmount > 0) {
            deptStatus.status = 'dues_pending';
        } else {
            deptStatus.status = 'cleared';
        }
    }
    
    deptStatus.updatedAt = Date.now();

    // Check if ALL departments are cleared
    const allCleared = application.noDuesStatuses.every(
      (status) => status.status === 'cleared'
    );

    if (allCleared) {
      application.workflowStage = 'hod_pending';
    }

    await application.save();

    // Send emails based on status
    const studentEmail = application.student.email;
    const studentName = application.student.name;

    if (deptStatus.status === 'dues_pending') {
        const subject = `Urgent: Pending Dues in ${department} - CollegeSphere`;
        const text = `Dear ${studentName}, you have a pending due of ₹${deptStatus.dueAmount} in the ${department} department. Remark: ${deptStatus.remark}. Please clear it at the earliest.`;
        const html = getDuesPendingTemplate(studentName, department, deptStatus.dueAmount, deptStatus.remark);
        await sendEmail(studentEmail, subject, text, html);
    }

    if (allCleared) {
        const subject = `Your Leaving Certificate is Ready for Pickup - CollegeSphere`;
        const text = `Dear ${studentName}, all your dues have been cleared. Your LC is now ready for pickup at the HOD or Principal's office.`;
        const html = getLCClearedTemplate(studentName);
        await sendEmail(studentEmail, subject, text, html);
    }

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
