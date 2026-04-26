
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircleIcon, XCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function HODDashboard({ user }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  useEffect(() => {
    if (!user) return;
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/hod/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id, status) => {
    const remark = prompt('Enter remark for HOD Approval:');
    if (!remark) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/hod/approve/${id}`, 
        { status, remark }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchApplications();
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleDownload = async (app) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/hod/application/${app._id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `LC_${app.prn}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
      setModalConfig({
        isOpen: true,
        title: 'Download Failed',
        message: 'Failed to download the certificate. Please try again later.',
        type: 'error'
      });
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">HOD Dashboard - Review Applications</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {applications.map((app) => (
            <li key={app._id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-lg font-bold text-gray-900">Student: {app.student?.name}</h3>
                   <div className="flex gap-2 text-sm text-gray-500 mt-1">
                      <span>PRN: <span className="font-mono text-gray-700">{app.prn}</span></span>
                      <span>•</span>
                      <span>
                        Status: 
                        <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          app.workflowStage === 'completed' ? 'bg-green-100 text-green-800' :
                          app.workflowStage === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {app.workflowStage}
                        </span>
                      </span>
                   </div>
                </div>
                
                <div className="flex gap-3">
                  {app.workflowStage === 'completed' && (
                    <button
                      onClick={() => handleDownload(app)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Download LC
                    </button>
                  )}
                  <button
                      onClick={() => window.location.href = `/hod/application/${app._id}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                    View Application
                  </button>
                </div>
              </div>

            </li>
          ))}
          {applications.length === 0 && (
             <li className="p-12 text-center flex flex-col items-center">
                 <CheckCircleIcon className="h-12 w-12 text-gray-300 mb-3" />
                 <p className="text-gray-500 text-lg">No pending applications found.</p>
             </li>
          )}
        </ul>
      </div>
      <Modal 
        {...modalConfig} 
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} 
      />
    </div>
  );
}
