import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL =import.meta.env.VITE_API_BASE_URL;

const statusStyles = {
  pending: { icon: ClockIcon, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  approved: { icon: CheckCircleIcon, color: 'text-green-500', bg: 'bg-green-50' },
  rejected: { icon: ExclamationCircleIcon, color: 'text-red-500', bg: 'bg-red-50' },
};

export default function NoDuesStatus({ user }) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchApplication = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/student/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Assuming getting the most recent application
        if (response.data && response.data.length > 0) {
          setApplication(response.data[0]);
        }
      } catch (err) {
        console.error('Error fetching status:', err);
        setError('Failed to load application status');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
           <div className="flex">
             <div className="flex-shrink-0">
               <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
             </div>
             <div className="ml-3">
               <p className="text-sm text-red-700">{error}</p>
             </div>
           </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="bg-white rounded-lg shadow-sm p-12">
           <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
           <h3 className="mt-2 text-sm font-medium text-gray-900">No Active Application</h3>
           <p className="mt-1 text-sm text-gray-500">You haven't applied for a leaving certificate yet.</p>
           <div className="mt-6">
             <Link to="/apply" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
               Apply Now
             </Link>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
             <h2 className="text-xl font-semibold text-gray-800">Clearance Status</h2>
             <p className="text-sm text-gray-500 mt-1">Application ID: {application._id}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Overall Status:</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[application.status].bg} ${statusStyles[application.status].color}`}>
               {application.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Department Grid */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {application.noDuesStatuses.map((item, index) => {
              let iconColor = 'text-yellow-600';
              let bgColor = 'bg-yellow-50';
              let borderColor = 'border-yellow-100';
              let Icon = ClockIcon;
              let statusText = 'Pending';
              
              if (item.status === 'cleared' || item.status === 'approved') {
                  iconColor = 'text-green-600';
                  bgColor = 'bg-green-50';
                  borderColor = 'border-green-100';
                  Icon = CheckCircleIcon;
                  statusText = 'Cleared';
              } else if (item.status === 'dues_pending' || item.status === 'rejected') {
                  iconColor = 'text-red-600';
                  bgColor = 'bg-red-50';
                  borderColor = 'border-red-100';
                  Icon = ExclamationCircleIcon;
                  statusText = 'Dues Pending';
              }

              return (
                <div key={index} className={`relative flex flex-col p-5 rounded-2xl border ${borderColor} ${bgColor} transition-all hover:shadow-md`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-white shadow-sm`}>
                        <Icon className={`h-7 w-7 ${iconColor}`} aria-hidden="true" />
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${iconColor} bg-white/50 border border-current/10`}>
                      {statusText}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {item.department}
                    </h3>
                    <div className="space-y-2">
                      {item.dueAmount > 0 && (
                        <div className="flex items-center text-red-700 font-bold bg-red-100/50 rounded-lg px-3 py-1 text-xs">
                          Due: ₹{item.dueAmount}
                        </div>
                      )}
                      {item.remark && (
                        <p className="text-xs text-gray-600 italic line-clamp-2">
                          "{item.remark}"
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {item.authorityName && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-[10px] text-gray-400 font-medium">
                      <span className="truncate">Auth: {item.authorityName}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Remark & Certificate Mockup */}
        {(application.status === 'approved' || application.finalRemark) && (
          <div className="bg-gray-50 px-6 py-5 border-t border-gray-200">
            {application.finalRemark && (
               <div className="mb-4">
                 <h4 className="text-sm font-medium text-gray-900">Final Remarks</h4>
                 <p className="mt-1 text-sm text-gray-600">{application.finalRemark}</p>
               </div>
            )}
            
            {application.status === 'approved' && (
              <div className="mt-4 flex justify-center">
                <button 
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={() => window.print()}
                >
                  <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Download/Print Certificate
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentTextIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}
