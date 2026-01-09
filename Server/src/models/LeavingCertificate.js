// src/models/LeavingCertificate.js
const mongoose = require('mongoose');

const leavingCertificateSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Personal Details
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    motherName: { type: String },
    religion: { type: String },
    caste: { type: String },
    nationality: { type: String, default: 'Indian' },
    dob: { type: Date },
    birthPlace: { type: String },

    // Academic Details
    prn: { type: String, required: true },
    admissionYear: { type: String },
    branch: { type: String },
    lastExamYear: { type: String },
    result: { type: String, enum: ['Pass', 'Fail', 'ATKT'] },
    reason: { type: String },

    // Process Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    noDuesStatuses: [
      {
        department: String,
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
        remark: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      },
    ],
    certificateUrl: String,
    finalRemark: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeavingCertificate', leavingCertificateSchema);
