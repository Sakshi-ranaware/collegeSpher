import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserGroupIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

const API_BASE_URL =import.meta.env.VITE_API_BASE_URL;

export default function ApplyAlumni() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    universityPrn: '',
    address: {
      village: '',
      taluka: '',
      district: '',
      state: '',
      pinCode: '',
      country: 'India'
    },
    mobile: '',
    email: '',
    admissionYear: '',
    course: '',
    lastExamYear: '',
    result: '',
    currentStatus: 'Employed',
    employmentDetails: {
      companyName: '',
      designation: '',
      joiningDate: '',
      address: '',
      website: ''
    },
    higherStudiesDetails: {
      courseName: '',
      instituteName: '',
      address: ''
    }
  });

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/student/alumni/apply`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/dashboard'); // Or a success page
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-600 px-8 py-6">
          <div className="flex items-center space-x-4">
            <UserGroupIcon className="h-10 w-10 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Alumni Association Registration</h2>
              <p className="text-indigo-100 mt-1">Join our network of graduates</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
          {/* Personal Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
              <Input label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} />
              <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
              <Input label="University PRN" name="universityPrn" value={formData.universityPrn} onChange={handleChange} />
              <Input label="Mobile No" name="mobile" value={formData.mobile} onChange={handleChange} required type="tel" />
              <Input label="Email ID" name="email" value={formData.email} onChange={handleChange} required type="email" />
            </div>
          </section>

          {/* Address */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Permanent Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input label="Village/Town" name="village" value={formData.address.village} onChange={(e) => handleChange(e, 'address')} />
              <Input label="Taluka" name="taluka" value={formData.address.taluka} onChange={(e) => handleChange(e, 'address')} />
              <Input label="District" name="district" value={formData.address.district} onChange={(e) => handleChange(e, 'address')} />
              <Input label="State" name="state" value={formData.address.state} onChange={(e) => handleChange(e, 'address')} />
              <Input label="Pin Code" name="pinCode" value={formData.address.pinCode} onChange={(e) => handleChange(e, 'address')} />
              <Input label="Country" name="country" value={formData.address.country} onChange={(e) => handleChange(e, 'address')} />
            </div>
          </section>

          {/* Academic Details */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Academic Details at NMIET</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Input label="Admission Year" name="admissionYear" value={formData.admissionYear} onChange={handleChange} />
              <Select label="Course/Branch" name="course" value={formData.course} onChange={handleChange} options={['CO', 'IT', 'ET', 'ME', 'B.VOC']} />
              <Input label="Last Exam Year" name="lastExamYear" value={formData.lastExamYear} onChange={handleChange} />
              <Input label="Final Result (CGPA/%/Class)" name="result" value={formData.result} onChange={handleChange} />
            </div>
          </section>

          {/* Current Status */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Current Status</h3>
            <div className="mb-4">
               <Select 
                label="I am currently..." 
                name="currentStatus" 
                value={formData.currentStatus} 
                onChange={handleChange} 
                options={['Employed', 'Higher Studies', 'Entrepreneur', 'Other']} 
              />
            </div>

            {formData.currentStatus === 'Employed' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                 <Input label="Company Name" name="companyName" value={formData.employmentDetails.companyName} onChange={(e) => handleChange(e, 'employmentDetails')} />
                 <Input label="Designation" name="designation" value={formData.employmentDetails.designation} onChange={(e) => handleChange(e, 'employmentDetails')} />
                 <Input label="Joining Date" name="joiningDate" value={formData.employmentDetails.joiningDate} onChange={(e) => handleChange(e, 'employmentDetails')} type="date" />
                 <Input label="Company Website" name="website" value={formData.employmentDetails.website} onChange={(e) => handleChange(e, 'employmentDetails')} />
                 <Input label="Company Address" name="address" value={formData.employmentDetails.address} onChange={(e) => handleChange(e, 'employmentDetails')} className="md:col-span-2" />
              </div>
            )}

            {formData.currentStatus === 'Higher Studies' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                <Input label="Course Name (e.g. ME/MS)" name="courseName" value={formData.higherStudiesDetails.courseName} onChange={(e) => handleChange(e, 'higherStudiesDetails')} />
                <Input label="Institute Name" name="instituteName" value={formData.higherStudiesDetails.instituteName} onChange={(e) => handleChange(e, 'higherStudiesDetails')} />
                <Input label="Institute Address" name="address" value={formData.higherStudiesDetails.address} onChange={(e) => handleChange(e, 'higherStudiesDetails')} className="md:col-span-2" />
              </div>
            )}
          </section>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-5 w-5 mr-2 -rotate-45" />
                  Submit Registration
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable Components
const Input = ({ label, name, value, onChange, required, type = "text", className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      required={required}
      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  </div>
);

const Select = ({ label, name, value, onChange, options, required, className = "" }) => (
  <div className={className}>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      required={required}
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
      <option value="">Select option</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);
