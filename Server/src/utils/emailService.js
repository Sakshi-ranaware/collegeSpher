const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: `"CollegeSphere Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    return null;
  }
};

// Professional Email Templates
const headerStyle = `
  background-color: #1a237e;
  color: white;
  padding: 20px;
  text-align: center;
  border-radius: 8px 8px 0 0;
`;

const bodyStyle = `
  padding: 30px;
  background-color: #f8f9fa;
  color: #333;
  line-height: 1.6;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const footerStyle = `
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: #666;
  border-top: 1px solid #eee;
`;

const buttonStyle = `
  display: inline-block;
  padding: 12px 24px;
  background-color: #1a237e;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  margin-top: 20px;
`;

exports.getDuesPendingTemplate = (studentName, department, amount, remark) => {
  return `
    <div style="max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="${headerStyle}">
        <h1 style="margin: 0;">CollegeSphere</h1>
      </div>
      <div style="${bodyStyle}">
        <h2>Pending Dues Notification</h2>
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>This is to inform you that there are pending dues recorded against your name in the <strong>${department}</strong> department.</p>
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #f44336; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Department:</strong> ${department}</p>
          <p style="margin: 5px 0;"><strong>Due Amount:</strong> ₹${amount}</p>
          <p style="margin: 5px 0;"><strong>Authority Remark:</strong> ${remark || 'N/A'}</p>
        </div>
        <p>Please clear these dues at the earliest to proceed with your Leaving Certificate application.</p>
        <p>If you have already cleared this, please contact the department authority with proof of payment.</p>
      </div>
      <div style="${footerStyle}">
        <p>&copy; ${new Date().getFullYear()} CollegeSphere Management System. All rights reserved.</p>
        <p>This is an automated message, please do not reply.</p>
      </div>
    </div>
  `;
};

exports.getLCClearedTemplate = (studentName) => {
  return `
    <div style="max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="${headerStyle}">
        <h1 style="margin: 0;">CollegeSphere</h1>
      </div>
      <div style="${bodyStyle}">
        <h2 style="color: #2e7d32;">Clearance Successful!</h2>
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>Congratulations! All your dues have been cleared across all departments. Your Leaving Certificate (LC) process has moved to the final stage.</p>
        <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50; margin: 20px 0;">
          <p style="margin: 0; font-size: 16px;"><strong>Status:</strong> All Dues Cleared</p>
          <p style="margin: 10px 0 0 0;">You can now visit the <strong>HOD or Principal's office</strong> to collect your physical Leaving Certificate.</p>
        </div>
        <p>Thank you for your cooperation.</p>
      </div>
      <div style="${footerStyle}">
        <p>&copy; ${new Date().getFullYear()} CollegeSphere Management System. All rights reserved.</p>
        <p>This is an automated message, please do not reply.</p>
      </div>
    </div>
  `;
};

exports.getAccountApprovalTemplate = (name, role) => {
  return `
    <div style="max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="${headerStyle}">
        <h1 style="margin: 0;">CollegeSphere</h1>
      </div>
      <div style="${bodyStyle}">
        <h2 style="color: #2e7d32;">Account Approved!</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your registration as <strong>${role.toUpperCase()}</strong> has been approved by the Administrator.</p>
        <p>You can now log in to the portal using your registered email and password.</p>
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || '#'}/login" style="${buttonStyle}">Login to Portal</a>
        </div>
      </div>
      <div style="${footerStyle}">
        <p>&copy; ${new Date().getFullYear()} CollegeSphere Management System. All rights reserved.</p>
        <p>This is an automated message, please do not reply.</p>
      </div>
    </div>
  `;
};

exports.getAccountRejectionTemplate = (name, role, reason) => {
  return `
    <div style="max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="${headerStyle}">
        <h1 style="margin: 0;">CollegeSphere</h1>
      </div>
      <div style="${bodyStyle}">
        <h2 style="color: #f44336;">Account Application Rejected</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>We regret to inform you that your registration as <strong>${role.toUpperCase()}</strong> has been rejected by the Administrator.</p>
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #f44336; margin: 20px 0;">
          <p style="margin: 0;"><strong>Reason:</strong> ${reason || 'Information provided does not match our records.'}</p>
        </div>
        <p>If you believe this is an error, please contact the college administration directly.</p>
      </div>
      <div style="${footerStyle}">
        <p>&copy; ${new Date().getFullYear()} CollegeSphere Management System. All rights reserved.</p>
        <p>This is an automated message, please do not reply.</p>
      </div>
    </div>
  `;
};

exports.getOTPTemplate = (name, otp) => {
  return `
    <div style="max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="${headerStyle}">
        <h1 style="margin: 0;">CollegeSphere</h1>
      </div>
      <div style="${bodyStyle}">
        <h2 style="color: #1a237e;">Password Reset Verification</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
        <div style="background-color: #fff; padding: 30px; border-radius: 8px; border: 2px dashed #1a237e; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a237e;">${otp}</span>
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      </div>
      <div style="${footerStyle}">
        <p>&copy; ${new Date().getFullYear()} CollegeSphere Management System. All rights reserved.</p>
        <p>This is an automated message, please do not reply.</p>
      </div>
    </div>
  `;
};
