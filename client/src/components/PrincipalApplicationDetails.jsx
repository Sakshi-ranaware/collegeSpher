import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function PrincipalApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/principal/applications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
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

  const handleGenerateLC = async () => {
    const remark = prompt('Enter Principal Remark for LC:');
    if (remark === null) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/principal/generate/${id}`, 
        { remark }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('LC Generated Successfully!');
      navigate('/principal');
    } catch (err) {
      alert('Failed to generate LC');
      console.error(err);
    }
  };


  if (loading) {
     return (
       <div className="min-h-screen flex justify-center items-center bg-gray-50">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
       </div>
     );
   }

   if (!application) {
     return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-800">Application Not Found</h2>
            <p className="text-gray-500 mt-2">{error || "The application you requested does not exist."}</p>
            <button onClick={() => navigate('/principal')} className="mt-4 text-indigo-600 hover:underline">
                Go Back to Dashboard
            </button>
        </div>
     )
   }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-800 to-slate-900 px-8 py-6 relative">
             <button
                onClick={() => navigate('/principal')}
                className="absolute top-6 left-6 text-white hover:text-indigo-200 transition-colors"
                title="Back to Dashboard"
             >
                <ArrowLeftIcon className="h-6 w-6" />
             </button>
          <div className="flex flex-col items-center justify-center text-center">
             <DocumentTextIcon className="h-12 w-12 text-indigo-100 mb-2" />
            <h2 className="text-3xl font-bold text-white">Principal Review & Approval</h2>
            <p className="text-indigo-100 mt-1">Application #{application._id.slice(-6).toUpperCase()}</p>
             <span className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border-2 ${
                  application.workflowStage === 'completed' ? 'bg-green-500 border-green-400 text-white' :
                  'bg-indigo-500 border-indigo-400 text-white'
                }`}>
                  {application.workflowStage?.replace('_', ' ')}
             </span>
          </div>
        </div>

        <div className="px-8 py-8 space-y-8">
          {/* Personal Information */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-600 rounded-sm"></span>
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
                 <span className="w-2 h-6 bg-indigo-600 rounded-sm"></span>
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

           {/* Approval Status Summary */}
           <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
               <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                   <span className="w-2 h-6 bg-green-600 rounded-sm"></span>
                   Previous Approvals
               </h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x border-b">
                 {/* HOD Approval */}
                 <div className="p-6">
                     <h4 className="font-bold text-gray-700 mb-2">HOD Approval</h4>
                     <div className="flex items-center gap-2">
                         <CheckCircleIcon className="h-6 w-6 text-green-500" />
                         <div>
                             <p className="text-sm font-medium text-gray-900">Approved by HOD</p>
                             <p className="text-xs text-gray-500">{new Date(application.hodApproval?.date).toLocaleString()}</p>
                         </div>
                     </div>
                 </div>
                 
                 {/* Dept Clearance */}
                 <div className="p-6">
                     <h4 className="font-bold text-gray-700 mb-2">Department Clearance</h4>
                     <div className="flex items-center gap-2">
                         <CheckCircleIcon className="h-6 w-6 text-green-500" />
                         <div>
                             <p className="text-sm font-medium text-gray-900">All Departments Cleared</p>
                             <p className="text-xs text-gray-500">No Pending Dues</p>
                         </div>
                     </div>
                 </div>
             </div>

             {/* Department Status Table */}
              <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {application.noDuesStatuses.map((dept, idx) => (
                     <tr key={idx} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{dept.department}</td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                           dept.status === 'cleared' ? 'bg-green-100 text-green-800' : 
                           'bg-red-100 text-red-800'
                         }`}>
                           {dept.status?.replace('_', ' ').toUpperCase()}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={dept.remark}>{dept.remark || '-'}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </section>

           {/* Principal Action Section */}
           {(application.workflowStage === 'principal_pending') && (
               <section className="bg-indigo-50 rounded-xl p-8 border border-indigo-200 shadow-md mt-8 text-center">
                 <h3 className="text-xl font-bold text-indigo-900 mb-2">Final Authorization</h3>
                 <p className="text-indigo-700 mb-6">
                    By approving this application, you are authorizing the generation of the Leaving Certificate for this student.
                 </p>
                 
                  <button
                    onClick={handleGenerateLC}
                    className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg transition-all hover:scale-105"
                  >
                    <DocumentArrowDownIcon className="h-6 w-6 mr-2" />
                    Approve & Generate LC
                  </button>
               </section>
           )}

        </div>
      </div>
    </div>
  );
}

const DisplayField = ({ label, value, highlight = false }) => (
  <div className={`p-4 rounded-lg border ${highlight ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-gray-100'}`}>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
      {label}
    </label>
    <div className={`text-sm font-medium ${highlight ? 'text-indigo-900' : 'text-gray-900'} break-words`}>
      {value || <span className="text-gray-400 italic">Not Provided</span>}
    </div>
  </div>
);
