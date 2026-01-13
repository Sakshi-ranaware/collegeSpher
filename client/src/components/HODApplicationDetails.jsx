import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function HODApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/hod/applications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // Finding locally as per current pattern
        const foundApp = response.data.find(app => app._id === id);
        
        if (foundApp) {
             setApplication(foundApp);
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
  }, [id]);

  const handleApproval = async (status) => {
    const remark = prompt(`Enter remark for ${status.toUpperCase()}:`);
    if (remark === null) return; // Cancelled

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/hod/approve/${id}`, 
        { status, remark }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Action successful');
      navigate('/hod');
    } catch (err) {
      console.error('Action failed:', err);
      alert('Action failed');
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
            <button onClick={() => navigate('/hod')} className="mt-4 text-blue-600 hover:underline">
                Go Back to Dashboard
            </button>
        </div>
     )
   }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 px-8 py-6 relative">
             <button
                onClick={() => navigate('/hod')}
                className="absolute top-6 left-6 text-white hover:text-purple-100 transition-colors"
                title="Back to Dashboard"
             >
                <ArrowLeftIcon className="h-6 w-6" />
             </button>
          <div className="flex flex-col items-center justify-center text-center">
             <DocumentTextIcon className="h-12 w-12 text-purple-100 mb-2" />
            <h2 className="text-3xl font-bold text-white">HOD Application Review</h2>
            <p className="text-purple-100 mt-1">Application #{application._id.slice(-6).toUpperCase()}</p>
             <span className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border-2 ${
                  application.workflowStage === 'completed' ? 'bg-green-500 border-green-400 text-white' :
                  application.workflowStage === 'rejected' ? 'bg-red-500 border-red-400 text-white' :
                  'bg-yellow-500 border-yellow-400 text-white'
                }`}>
                  {application.workflowStage?.replace('_', ' ')}
             </span>
          </div>
        </div>

        {/* Info Banner */}
         <div className="px-8 py-6 bg-purple-50 border-l-4 border-purple-500 flex items-start gap-3">
             <div className="shrink-0 mt-0.5">
                  <CheckCircleIcon className="h-5 w-5 text-purple-600" />
             </div>
             <div>
                 <h4 className="text-sm font-bold text-purple-900">Review Process</h4>
                 <p className="text-sm text-purple-700 mt-1">
                    Check all department clearances below before giving final approval.
                 </p>
             </div>
        </div>


        <div className="px-8 py-8 space-y-8">
          {/* Personal Information */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-purple-600 rounded-sm"></span>
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
                 <span className="w-2 h-6 bg-purple-600 rounded-sm"></span>
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

          {/* Marksheet Section */}
          {application.marksheetUrl && (() => {
            // Helper to convert Cloudinary image URL to raw URL for PDFs
            const getMarksheetUrl = (url) => {
              if (url.toLowerCase().endsWith('.pdf') && url.includes('/image/upload/')) {
                return url.replace('/image/upload/', '/raw/upload/');
              }
              return url;
            };
            const marksheetUrl = getMarksheetUrl(application.marksheetUrl);
            const isPdf = application.marksheetUrl.toLowerCase().endsWith('.pdf');
            
            return (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-6 bg-green-600 rounded-sm"></span>
                    Student Marksheet
                </h3>
              </div>
              <div className="p-6">
                {isPdf ? (
                  <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Student Result Document</p>
                        <p className="text-sm text-gray-500">Click to view the uploaded marksheet</p>
                      </div>
                    </div>
                    <a
                      href={marksheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-5 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                    >
                      View Result
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img
                      src={marksheetUrl}
                      alt="Student Marksheet"
                      className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                      style={{ maxHeight: '400px', objectFit: 'contain' }}
                    />
                    <a
                      href={marksheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Open in new tab →
                    </a>
                  </div>
                )}
              </div>
            </section>
            );
          })()}

           {/* Department Status Summary */}
           <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
               <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                   <span className="w-2 h-6 bg-indigo-600 rounded-sm"></span>
                   Department Status Summary
               </h3>
             </div>
             
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Amount</th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Authority</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {application.noDuesStatuses.map((dept, idx) => (
                     <tr key={idx} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{dept.department}</td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                           dept.status === 'cleared' ? 'bg-green-100 text-green-800' : 
                           dept.status === 'rejected' ? 'bg-red-100 text-red-800' :
                           dept.status === 'dues_pending' ? 'bg-yellow-100 text-yellow-800' :
                           'bg-gray-100 text-gray-800'
                         }`}>
                           {dept.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">₹{dept.dueAmount}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={dept.remark}>{dept.remark || '-'}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {dept.authorityName && (
                                <div className="flex flex-col">
                                    <span className="font-medium">{dept.authorityName}</span>
                                    <span className="text-xs text-gray-400 font-mono italic">Sig: {dept.signature}</span>
                                </div>
                            ) || '-'}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </section>

           {/* HOD Action Section */}
           {(application.workflowStage === 'hod_pending' || application.workflowStage === 'dept_pending') && (
               <section className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-inner mt-8">
                 <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                     <span className="w-2 h-6 bg-purple-600 rounded-sm"></span>
                     HOD Final Action
                 </h3>
                 
                 <div className="flex flex-col sm:flex-row gap-4 justify-end">
                      <button
                        onClick={() => handleApproval('rejected')}
                        className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-md transition-all hover:scale-105"
                      >
                        <XCircleIcon className="h-5 w-5 mr-2" />
                        Reject Application
                      </button>
                      <button
                        onClick={() => handleApproval('approved')}
                        className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-md transition-all hover:scale-105"
                      >
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        Approve & Forward to Principal
                      </button>
                 </div>
               </section>
           )}

        </div>
      </div>
    </div>
  );
}

const DisplayField = ({ label, value, highlight = false }) => (
  <div className={`p-4 rounded-lg border ${highlight ? 'bg-purple-50 border-purple-100' : 'bg-white border-gray-100'}`}>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
      {label}
    </label>
    <div className={`text-sm font-medium ${highlight ? 'text-purple-900' : 'text-gray-900'} break-words`}>
      {value || <span className="text-gray-400 italic">Not Provided</span>}
    </div>
  </div>
);
