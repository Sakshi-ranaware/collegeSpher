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
    noDuesStatuses: {
      type: [
        {
          department: String,
          status: { type: String, enum: ['pending', 'cleared', 'dues_pending'], default: 'pending' },
          dueAmount: { type: Number, default: 0 },
          remark: { type: String, default: '' },
          authorityName: { type: String, default: '' },
          signature: { type: String, default: '' }, // Text based signature for now
          updatedAt: { type: Date, default: Date.now }
        }
      ],
      default: [
        { department: 'Lab 1' },
        { department: 'Lab 2' },
        { department: 'Lab 3' },
        { department: 'Lab 4' },
        { department: 'Lab 5' },
        { department: 'Lab 6' },
        { department: 'Training & Placement' },
        { department: 'Alumni Association' },
        { department: 'Transport' },
        { department: 'Workshop' },
        { department: 'Hostel' },
        { department: 'Canteen' },
        { department: 'Stationery' },
        { department: 'Library' },
        { department: 'IT Infra' },
        { department: 'Sports' },
        { department: 'Exam' }
      ]
    },
    workflowStage: {
      type: String,
      enum: ['dept_pending', 'hod_pending', 'principal_pending', 'completed'],
      default: 'dept_pending'
    },
    hodApproval: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      date: Date,
      remark: String
    },
    principalApproval: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      date: Date,
      remark: String
    },
    certificateUrl: String,
    finalRemark: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeavingCertificate', leavingCertificateSchema);
