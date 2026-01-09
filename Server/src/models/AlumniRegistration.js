// src/models/AlumniRegistration.js
const mongoose = require('mongoose');

const alumniRegistrationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Personal Details
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    universityPrn: { type: String },
    
    // Address
    address: {
      village: String,
      taluka: String,
      district: String,
      state: String,
      pinCode: String,
      country: { type: String, default: 'India' }
    },
    
    // Contact
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    
    // Academic Details at Institute
    admissionYear: { type: String },
    course: { type: String }, // CO, IT, ET, ME, B.VOC
    lastExamYear: { type: String },
    result: { type: String },
    
    // Employment / Higher Education
    currentStatus: { type: String, enum: ['Employed', 'Higher Studies', 'Entrepreneur', 'Other'] },
    
    employmentDetails: {
      companyName: String,
      designation: String,
      joiningDate: Date,
      address: String,
      website: String
    },
    
    higherStudiesDetails: {
      courseName: String, // ME/MS
      instituteName: String,
      address: String
    },

    // Admin Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminRemark: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('AlumniRegistration', alumniRegistrationSchema);
