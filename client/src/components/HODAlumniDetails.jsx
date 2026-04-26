import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  UserCircleIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Modal from './Modal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function HODAlumniDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch all to find one (simplest without new endpoint, though dedicated endpoint is better)
      const response = await axios.get(`${API_BASE_URL}/hod/alumni/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const foundApp = response.data.find(app => app._id === id);
      if (foundApp) {
        setApplication(foundApp);
      } else {
        setError('Application not found');
      }
    } catch (err) {
      setError('Failed to fetch application details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (newStatus) => {
    setModalConfig({
      isOpen: true,
      title: 'Confirm Action',
      message: `Are you sure you want to ${newStatus} this application?`,
      type: 'warning',
      onConfirm: () => performStatusUpdate(newStatus)
    });
  };

  const performStatusUpdate = async (newStatus) => {

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/hod/alumni/approve/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setModalConfig({
        isOpen: true,
        title: 'Success',
        message: `Application ${newStatus} successfully`,
        type: 'success',
        onConfirm: () => navigate('/hod/alumni-applications')
      });
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: 'Failed to update status',
        type: 'error'
      });
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!application) return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 text-gray-500">
        {error || 'Application not found'}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-8 py-6 relative">
             <button
                onClick={() => navigate('/hod/alumni-applications')}
                className="absolute top-6 left-6 text-white hover:text-blue-200 transition-colors"
                title="Back to List"
             >
                <ArrowLeftIcon className="h-6 w-6" />
             </button>
          <div className="flex flex-col items-center justify-center text-center">
             <AcademicCapIcon className="h-12 w-12 text-blue-100 mb-2" />
            <h2 className="text-3xl font-bold text-white">Alumni Registration Review</h2>
            <p className="text-blue-100 mt-1">Application #{application._id.slice(-6).toUpperCase()}</p>
             <span className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border-2 ${
                  application.status === 'approved' ? 'bg-green-500 border-green-400 text-white' :
                  application.status === 'rejected' ? 'bg-red-500 border-red-400 text-white' :
                  'bg-yellow-500 border-yellow-400 text-white'
                }`}>
                  {application.status}
             </span>
          </div>
        </div>

        <div className="px-8 py-8 space-y-8">
          {/* Personal Information */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-6 flex items-center gap-2">
                <UserCircleIcon className="h-5 w-5 text-blue-600" />
                Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DisplayField label="First Name" value={application.firstName} />
              <DisplayField label="Middle Name" value={application.middleName} />
              <DisplayField label="Last Name" value={application.lastName} />
              <DisplayField label="Email" value={application.email} />
              <DisplayField label="Mobile" value={application.mobile} />
              <DisplayField 
                label="Address" 
                value={typeof application.address === 'object' 
                  ? `${application.address.village || ''}, ${application.address.taluka || ''}, ${application.address.district || ''}, ${application.address.state || ''} - ${application.address.pinCode || ''}, ${application.address.country || ''}`.replace(/, ,/g, ',').replace(/^, /, '').replace(/, $/, '') 
                  : application.address} 
                fullWidth 
              />
            </div>
          </section>

          {/* Academic Information */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-6 flex items-center gap-2">
                 <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                 Academic History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DisplayField label="University PRN" value={application.universityPrn} highlight />
              <DisplayField label="Passout Year" value={application.lastExamYear} />
              <DisplayField label="Result/CGPA" value={application.result} />
            </div>
          </section>

          {/* Current Status */}
          <section>
             <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-6 flex items-center gap-2">
                 <BriefcaseIcon className="h-5 w-5 text-blue-600" />
                 Current Professional Status
            </h3>
            <div className="bg-gray-50 rounded-lg p-6">
                <div className="mb-4">
                    <span className="text-sm font-semibold text-gray-500 uppercase">Status:</span>
                    <span className="ml-2 text-lg font-bold text-gray-900">{application.currentStatus}</span>
                </div>
                
                {application.currentStatus === 'Employed' && application.employmentDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <DisplayField label="Company Name" value={application.employmentDetails.companyName} />
                         <DisplayField label="Designation" value={application.employmentDetails.designation} />
                         <DisplayField label="Experience (Years)" value={application.employmentDetails.experience} />
                         <DisplayField label="Location" value={application.employmentDetails.location} />
                    </div>
                )}

                {application.currentStatus === 'Higher Studies' && application.higherStudiesDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <DisplayField label="Course Name" value={application.higherStudiesDetails.courseName} />
                         <DisplayField label="Institute Name" value={application.higherStudiesDetails.instituteName} />
                         <DisplayField label="Admission Year" value={application.higherStudiesDetails.admissionYear} />
                    </div>
                 )}

                 {application.currentStatus === 'Entrepreneur' && application.entrepreneurDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <DisplayField label="Company Name" value={application.entrepreneurDetails.companyName} />
                         <DisplayField label="Website" value={application.entrepreneurDetails.companyWebsite} />
                         <DisplayField label="Nature of Business" value={application.entrepreneurDetails.natureOfBusiness} fullWidth />
                    </div>
                 )}
            </div>
          </section>

           {/* Actions */}
           {application.status === 'pending' && (
               <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100 justify-end">
                  <button
                    onClick={() => handleStatusUpdate('rejected')}
                    className="inline-flex justify-center items-center px-6 py-3 border border-red-300 text-base font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('approved')}
                    className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg transition-transform hover:scale-105"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Approve Registration
                  </button>
               </div>
           )}

        </div>
      </div>
      <Modal 
        {...modalConfig} 
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} 
      />
    </div>
  );
}

const DisplayField = ({ label, value, highlight = false, fullWidth = false }) => (
  <div className={`p-4 rounded-lg border ${highlight ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100'} ${fullWidth ? 'md:col-span-2' : ''}`}>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
      {label}
    </label>
    <div className={`text-sm font-medium ${highlight ? 'text-blue-900' : 'text-gray-900'} break-words`}>
      {value || <span className="text-gray-400 italic">Not Provided</span>}
    </div>
  </div>
);
