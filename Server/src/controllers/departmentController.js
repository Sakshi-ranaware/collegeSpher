// src/controllers/departmentController.js
const LeavingCertificate = require('../models/LeavingCertificate');

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
    const application = await LeavingCertificate.findById(id);
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

    // Auto-update status logic
    // Ensure dueAmount is treated as a number
    if (deptStatus.dueAmount > 0) {
      deptStatus.status = 'dues_pending';
    } else {
      deptStatus.status = 'cleared';
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
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
