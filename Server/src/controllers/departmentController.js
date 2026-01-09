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

// Approve or reject specific student application for this department
exports.updateStatus = async (req, res) => {
  const { id } = req.params; // LeavingCertificate ID
  const { status, remark } = req.body; // status: approved/rejected
  const { department } = req.user;
  try {
    const application = await LeavingCertificate.findById(id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const deptStatus = application.noDuesStatuses.find((d) => d.department === department);
    if (!deptStatus) return res.status(400).json({ message: 'Department not involved' });
    if (deptStatus.status !== 'pending') return res.status(400).json({ message: 'Already processed' });

    deptStatus.status = status;
    deptStatus.remark = remark;

    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
