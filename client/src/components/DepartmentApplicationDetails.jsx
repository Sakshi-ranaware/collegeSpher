import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function DepartmentApplicationDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status state
  const [statusParams, setStatusParams] = useState({
    dueAmount: 0,
    remark: '',
    authorityName: '',
    signature: ''
  });

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/department/applications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // Filter locally since the endpoint returns all assigned apps
        // A better approach would be a specific endpoint /department/applications/:id
        // For now, we reuse the existing one and find selected app
        const foundApp = response.data.find(app => app._id === id);
        
        if (foundApp) {
             setApplication(foundApp);
             // Pre-fill status params if existing
             const deptStatus = foundApp.noDuesStatuses.find(d => d.department === user.department) || {};
             setStatusParams({
                 dueAmount: deptStatus.dueAmount || 0,
                 remark: deptStatus.remark || '',
                 authorityName: deptStatus.authorityName || '',
                 signature: deptStatus.signature || ''
             });
        } else {
            setError('Application not found or access denied.');
        }

      } catch (err) {
        setError('Failed to fetch application details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id, user.department]);

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusParams(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (status) => {
      try {
        const token = localStorage.getItem('token');
        await axios.put(
          `${API_BASE_URL}/department/applications/${id}`,
          { ...statusParams, status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(`Application marked as ${status.toUpperCase()}`);
        navigate('/department-dashboard');
      } catch (err) {
        console.error('Error updating application status:', err);
        alert('Failed to update application status');
      }
  };


  if (loading) {
     return (
       <div className="min-h-screen flex justify-center items-center bg-gray-50">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
       </div>
     );
   }

   if (!application) {
     return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-800">Application Not Found</h2>
            <p className="text-gray-500 mt-2">{error || "The application you requested does not exist."}</p>
            <button onClick={() => navigate('/department-dashboard')} className="mt-4 text-blue-600 hover:underline">
                Go Back to Dashboard
            </button>
        </div>
     )
   }

   const deptStatus = application.noDuesStatuses.find(d => d.department === user.department) || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-8 py-6 relative">
             <button
                onClick={() => navigate('/department-dashboard')}
                className="absolute top-6 left-6 text-white hover:text-blue-100 transition-colors"
                title="Back to Dashboard"
             >
                <ArrowLeftIcon className="h-6 w-6" />
             </button>
          <div className="flex flex-col items-center justify-center text-center">
             <DocumentTextIcon className="h-12 w-12 text-blue-100 mb-2" />
            <h2 className="text-3xl font-bold text-white">Application Review</h2>
            <p className="text-blue-100 mt-1">Application #{application._id.slice(-6).toUpperCase()}</p>
             <span className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border-2 ${
                  deptStatus.status === 'cleared' ? 'bg-green-500 border-green-400 text-white' :
                  deptStatus.status === 'rejected' ? 'bg-red-500 border-red-400 text-white' :
                  deptStatus.status === 'dues_pending' ? 'bg-yellow-500 border-yellow-400 text-white' :
                  'bg-gray-700 border-gray-500 text-gray-300'
                }`}>
                  {deptStatus.status ? deptStatus.status.replace('_', ' ') : 'PENDING ACTION'}
             </span>
          </div>
        </div>

        {/* Info Banner */}
         <div className="px-8 py-6 bg-indigo-50 border-l-4 border-indigo-500 flex items-start gap-3">
             <div className="shrink-0 mt-0.5">
                  <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
             </div>
             <div>
                 <h4 className="text-sm font-bold text-indigo-900">Student Details (Read Only)</h4>
                 <p className="text-sm text-indigo-700 mt-1">
                    Review the details submitted by the student below before taking action.
                 </p>
             </div>
        </div>


        <div className="px-8 py-8 space-y-8">
          {/* Personal Information */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-600 rounded-sm"></span>
                Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DisplayField label="First Name" value={application.firstName} />
              <DisplayField label="Middle Name" value={application.middleName} />
              <DisplayField label="Last Name" value={application.lastName} />
              <DisplayField label="Mother's Name" value={application.motherName} />
              <DisplayField label="Date of Birth" value={new Date(application.dob).toLocaleDateString()} />
              <DisplayField label="Place of Birth" value={application.birthPlace} />
              <DisplayField label="Religion" value={application.religion} />
              <DisplayField label="Caste" value={application.caste} />
              <DisplayField label="Nationality" value={application.nationality} />
            </div>
          </section>

          {/* Academic Information */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-6 flex items-center gap-2">
                 <span className="w-2 h-6 bg-blue-600 rounded-sm"></span>
                 Academic Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DisplayField label="University PRN" value={application.prn} highlight />
              <DisplayField label="Admission Year" value={application.admissionYear} />
              <DisplayField label="Branch" value={application.branch} highlight />
              <DisplayField label="Last Exam Year" value={application.lastExamYear} />
              <DisplayField label="Result" value={application.result} />
              <div className="md:col-span-3">
                  <DisplayField label="Reason for Leaving" value={application.reason} />
              </div>
            </div>
          </section>

           {/* Action Section */}
           <section className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-inner">
             <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                 <span className="w-2 h-6 bg-purple-600 rounded-sm"></span>
                 Department Action
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Due Amount (₹)</label>
                   <input
                        type="number"
                        name="dueAmount"
                        value={statusParams.dueAmount}
                        onChange={handleStatusChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                    />
                </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Remark / Reason</label>
                   <input
                        type="text"
                        name="remark"
                        value={statusParams.remark}
                        onChange={handleStatusChange}
                        placeholder="e.g. Cleared, Book Missing, Fees Pending"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                    />
                </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Authority Name</label>
                   <input
                        type="text"
                        name="authorityName"
                        value={statusParams.authorityName}
                        onChange={handleStatusChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                    />
                </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Digital Signature (Type Name)</label>
                   <input
                        type="text"
                        name="signature"
                        value={statusParams.signature}
                        onChange={handleStatusChange}
                         className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                    />
                </div>
             </div>

             {deptStatus.status !== 'cleared' && (
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end border-t border-gray-200 pt-6">
                  <button
                    onClick={() => handleUpdate('cleared')}
                    className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md transition-all hover:scale-105"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Approve (No Dues)
                  </button>
                  <button
                    onClick={() => handleUpdate('dues_pending')}
                    className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 shadow-md transition-all hover:scale-105"
                  >
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Mark Pending
                  </button>
                   <button
                    onClick={() => handleUpdate('rejected')}
                    className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-md transition-all hover:scale-105"
                  >
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Reject Application
                  </button>
              </div>
             )}
           </section>

        </div>
      </div>
    </div>
  );
}

const DisplayField = ({ label, value, highlight = false }) => (
  <div className={`p-4 rounded-lg border ${highlight ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100'}`}>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
      {label}
    </label>
    <div className={`text-sm font-medium ${highlight ? 'text-blue-900' : 'text-gray-900'} break-words`}>
      {value || <span className="text-gray-400 italic">Not Provided</span>}
    </div>
  </div>
);
