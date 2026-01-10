
const LeavingCertificate = require('../models/LeavingCertificate');

// Get all applications for HOD Review
// HOD sees all applications where departments might have filled data
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await LeavingCertificate.find({})
    .populate('student', 'name email').sort('-createdAt');
    console.log('HOD Fetching Apps:', applications.length);
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// HOD Approval
// Transitions to Principal Pending
exports.approveApplication = async (req, res) => {
  const { id } = req.params;
  const { status, remark } = req.body; // status: approved/rejected
  
  try {
    const application = await LeavingCertificate.findById(id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.hodApproval = {
      status,
      remark,
      date: Date.now()
    };
    
    if (status === 'approved') {
      application.workflowStage = 'principal_pending';
    } else {
      application.workflowStage = 'dept_pending'; // Send back? Or just stay rejected? 
      // User requirement says send for next approval, so reject might mean hold.
    }

    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
