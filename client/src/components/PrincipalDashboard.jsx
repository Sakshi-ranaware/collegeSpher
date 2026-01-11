
import { useState, useEffect } from 'react';
import axios from 'axios';
import { DocumentArrowDownIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function PrincipalDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/principal/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLC = async (id) => {
    const remark = prompt('Enter Principal Remark for LC:');
    if (!remark) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/principal/generate/${id}`, 
        { remark }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('LC Generated Successfully!');
      fetchApplications();
    } catch (err) {
      alert('Failed to generate LC');
    }
  };

  // Filter applications based on tab
  const pendingApps = applications.filter(app => app.workflowStage === 'principal_pending');
  const historyApps = applications.filter(app => app.workflowStage === 'completed');

  const [activeTab, setActiveTab] = useState('pending');

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Principal Dashboard</h1>
            <p className="mt-2 sm:mt-0 text-sm text-gray-500">
               Manage Leaving Certificate Approvals
            </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('pending')}
              className={`${
                activeTab === 'pending'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200`}
            >
              <span>Pending Review</span>
              {pendingApps.length > 0 && (
                <span className="bg-indigo-100 text-indigo-600 py-0.5 px-2.5 rounded-full text-xs font-bold">
                  {pendingApps.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200`}
            >
              Application History
              {historyApps.length > 0 && (
                <span className="bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs font-bold">
                  {historyApps.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          
          {activeTab === 'pending' && (
             <div className="space-y-4">
               {pendingApps.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <DocumentArrowDownIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Pending Applications</h3>
                    <p className="mt-1 text-sm text-gray-500">Good job! You've cleared all pending requests.</p>
                  </div>
               ) : (
                 pendingApps.map((app) => (
                    <div key={app._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                             <h3 className="text-lg font-bold text-gray-900">{app.student?.name}</h3>
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                Pending Action
                             </span>
                          </div>
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                             <p>PRN: <span className="font-mono text-gray-700">{app.prn}</span></p>
                             <p>HOD Approved: <span className="font-medium">{new Date(app.hodApproval?.date).toLocaleDateString()}</span></p>
                          </div>
                       </div>
                       <div>
                          <button
                             onClick={() => window.location.href = `/principal/application/${app._id}`}
                             className="inline-flex items-center justify-center w-full md:w-auto px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all hover:scale-105"
                           >
                             View & Approve
                          </button>
                       </div>
                    </div>
                 ))
               )}
             </div>
          )}

          {activeTab === 'history' && (
             <div className="space-y-4">
                {historyApps.length === 0 ? (
                   <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                      <p className="text-gray-500 italic">No history available yet.</p>
                   </div>
                ) : (
                  historyApps.map((app) => (
                     <div key={app._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-75 hover:opacity-100 transition-opacity">
                        <div className="flex-1">
                           <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-700">{app.student?.name}</h3>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                 LC Issued
                              </span>
                           </div>
                           <div className="flex flex-col sm:flex-row gap-x-6 gap-y-1 text-sm text-gray-500">
                              <p>PRN: <span className="font-mono text-gray-600">{app.prn}</span></p>
                              <p className="flex items-center gap-1">
                                 <CheckCircleIcon className="h-4 w-4 text-green-500"/> 
                                 Approved on {new Date(app.principalApproval?.date).toLocaleDateString()}
                              </p>
                           </div>
                        </div>
                        <div>
                    <div className="flex space-x-2">
                        <button 
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const response = await axios.get(
                                  `${API_BASE_URL}/principal/application/${app._id}/download`,
                                  { 
                                    headers: { Authorization: `Bearer ${token}` },
                                    responseType: 'blob' 
                                  }
                                );
                                
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `Leaving_Certificate_${app.prn}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                              } catch (err) {
                                console.error('Download failed:', err);
                                alert('Failed to download certificate.');
                              }
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-1" /> Download LC
                        </button>
                        <button
                            onClick={() => window.location.href = `/principal/application/${app._id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-600 bg-white hover:bg-gray-50"
                        >
                        View Details
                        </button>
                    </div>
                  </div>
                     </div>
                  ))
                )}
             </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
