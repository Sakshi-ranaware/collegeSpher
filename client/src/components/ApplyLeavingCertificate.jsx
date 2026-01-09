import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentTextIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export default function ApplyLeavingCertificate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    motherName: '',
    religion: '',
    caste: '',
    nationality: 'Indian',
    dob: '',
    birthPlace: '',
    prn: '',
    admissionYear: '',
    branch: '',
    lastExamYear: '',
    result: '',
    reason: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/student/apply`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/dashboard'); 
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
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
          <div className="flex items-center space-x-4">
            <DocumentTextIcon className="h-10 w-10 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Leaving Certificate Application</h2>
              <p className="text-blue-100 mt-1">Initiate No-Dues Clearance Process</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-blue-50 border-l-4 border-blue-500">
          <p className="text-sm text-blue-800">
            Applying for a Leaving Certificate will automatically trigger the <strong>No Dues Clearance</strong> process.
            Relevant departments (Library, Hostel, Exam, Labs) will be notified to check your records.
          </p>
        </div>

        <form onSubmit={handleApply} className="px-8 py-8 space-y-8">
          {/* Personal Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
              <Input label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} />
              <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
              <Input label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} required />
              <Input label="Date of Birth" name="dob" value={formData.dob} onChange={handleChange} type="date" required />
              <Input label="Place of Birth" name="birthPlace" value={formData.birthPlace} onChange={handleChange} />
              <Input label="Religion" name="religion" value={formData.religion} onChange={handleChange} />
              <Input label="Caste" name="caste" value={formData.caste} onChange={handleChange} />
              <Input label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} />
            </div>
          </section>

          {/* Academic Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Academic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="University PRN" name="prn" value={formData.prn} onChange={handleChange} required />
              <Input label="Admission Year" name="admissionYear" value={formData.admissionYear} onChange={handleChange} required />
              <Select label="Branch" name="branch" value={formData.branch} onChange={handleChange} options={['Computer', 'IT', 'E&TC', 'Mechanical', 'Civil']} required />
              <Input label="Last Exam Year" name="lastExamYear" value={formData.lastExamYear} onChange={handleChange} required />
              <Select label="Result" name="result" value={formData.result} onChange={handleChange} options={['Pass', 'Fail', 'ATKT']} required />
              <Input label="Reason for Leaving" name="reason" value={formData.reason} onChange={handleChange} className="md:col-span-3" required />
            </div>
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
              className={`inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Processing...' : (
                <>
                  <PaperAirplaneIcon className="h-5 w-5 mr-2 -rotate-45" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
      className="appearance-none block w-full px-3 py-2 border border-blue-100 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
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
      className="block w-full px-3 py-2 border border-blue-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
    >
      <option value="">Select option</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);
