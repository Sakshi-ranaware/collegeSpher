import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentTextIcon, PaperAirplaneIcon, CloudArrowUpIcon, XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ApplyLeavingCertificate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

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

  const [marksheetFile, setMarksheetFile] = useState(null);
  const [marksheetPreview, setMarksheetPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload an image (JPG, PNG) or PDF file');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setMarksheetFile(file);
    setError(null);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMarksheetPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setMarksheetPreview(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setMarksheetFile(null);
    setMarksheetPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!marksheetFile) {
      setError('Please upload your marksheet');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      submitData.append('marksheet', marksheetFile);

      await axios.post(`${API_BASE_URL}/student/apply`, submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
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
            Relevant departments (Labs, Library, Hostel, Exam, Training & Placement, etc.) will be notified to check your records.
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

          {/* Marksheet Upload Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
              Marksheet Upload <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please upload your latest marksheet (JPG, PNG, or PDF format, max 5MB)
            </p>
            
            {!marksheetFile ? (
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  Drag and drop your marksheet here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or <span className="text-blue-600 font-medium">browse</span> to upload
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports: JPG, PNG, PDF (Max 5MB)
                </p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    {marksheetPreview ? (
                      <img
                        src={marksheetPreview}
                        alt="Marksheet preview"
                        className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="h-20 w-20 bg-red-100 rounded-lg flex items-center justify-center">
                        <DocumentIcon className="h-10 w-10 text-red-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{marksheetFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(marksheetFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-green-600 font-medium mt-1">
                        ✓ Ready to upload
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    title="Remove file"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
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
              className={`inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Uploading...' : (
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
