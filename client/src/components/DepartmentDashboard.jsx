import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Modal from './Modal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function DepartmentDashboard({ user }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  useEffect(() => {
    if (!user) return;

    const fetchApplications = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/department/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(response.data);
      } catch (err) {
        setError('Failed to fetch applications');
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const handleUpdate = async (id, dueAmount, remark, authorityName, signature, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/department/applications/${id}`,
        { dueAmount, remark, authorityName, signature, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh list to show saved data
      const response = await axios.get(`${API_BASE_URL}/department/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
         setApplications(response.data);
      setModalConfig({
        isOpen: true,
        title: 'Success',
        message: 'Status updated successfully.',
        type: 'success'
      });
      setSelectedApp(null); // Close modal if open
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Helper to get current dept status safely
  const getDeptStatus = (app) => app.noDuesStatuses.find(d => d.department === user.department) || {};

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Department Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Review and process leaving certificate applications
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        {applications.length === 0 ? (
          <div className="text-center p-12">
            <ClipboardDocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications to review</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are currently no pending applications.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {applications.map((application) => {
              const deptStatus = getDeptStatus(application);
              
              // Initialize defaults if not present
               if (!application.tempAmount) application.tempAmount = deptStatus.dueAmount || 0;
               if (!application.tempRemark) application.tempRemark = deptStatus.remark || '';
               if (!application.tempAuth) application.tempAuth = deptStatus.authorityName || '';
               if (!application.tempSign) application.tempSign = deptStatus.signature || '';

              return (
                <li key={application._id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                         <p className="text-sm font-medium text-primary-600">
                           #{application._id.slice(-6).toUpperCase()}
                         </p>
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                           deptStatus.status === 'cleared' ? 'bg-green-100 text-green-800' :
                           deptStatus.status === 'rejected' ? 'bg-red-100 text-red-800' :
                           deptStatus.status === 'dues_pending' ? 'bg-yellow-100 text-yellow-800' :
                           'bg-gray-100 text-gray-800'
                         }`}>
                           {deptStatus.status ? deptStatus.status.replace('_', ' ').toUpperCase() : 'PENDING'}
                         </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-900 font-semibold">
                         {application.firstName} {application.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {application.branch} | {application.admissionYear}
                      </p>
                    </div>
                     <div className="mt-4 sm:mt-0">
                        <button
                          onClick={() => window.location.href = `/department/application/${application._id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          View Application
                        </button>
                     </div>
                  </div>

                  {/* Actions Area */}
                  {/* Actions Area */}
                  <div className="mt-4 border-t pt-5 bg-gradient-to-r from-gray-50 to-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                        <span className="w-1.5 h-4 bg-indigo-500 rounded-full mr-2"></span>
                        Quick Status Update
                    </h4>
                    <div className="grid grid-cols-1 gap-y-5 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
                      
                      {/* Due Amount Input */}
                      <div className="group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 group-focus-within:text-indigo-600 transition-colors">
                            Due Amount (₹)
                        </label>
                        <div className="relative">
                            <input
                              type="number"
                              defaultValue={deptStatus.dueAmount || 0}
                              onChange={(e) => { application.tempAmount = e.target.value; }}
                              className="block w-full rounded-lg border-gray-200 bg-gray-50/50 text-gray-900 shadow-sm focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 transition-all duration-200 ease-in-out hover:border-gray-300"
                            />
                        </div>
                      </div>

                      {/* Remark Input */}
                      <div className="sm:col-span-2 group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 group-focus-within:text-indigo-600 transition-colors">
                            Remark
                        </label>
                        <div className="relative">
                            <input
                              type="text"
                              defaultValue={deptStatus.remark || ''}
                              onChange={(e) => { application.tempRemark = e.target.value; }}
                              className="block w-full rounded-lg border-gray-200 bg-gray-50/50 text-gray-900 shadow-sm focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 transition-all duration-200 ease-in-out hover:border-gray-300"
                              placeholder="Reason for pending/rejection..."
                            />
                        </div>
                      </div>

                       {/* Auth & Sign Inputs */}
                       <div className="group">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 group-focus-within:text-indigo-600 transition-colors">
                            Authorization
                        </label>
                        <div className="flex gap-2">
                           <input
                            type="text"
                            placeholder="Name"
                            defaultValue={deptStatus.authorityName || ''}
                            onChange={(e) => { application.tempAuth = e.target.value; }}
                            className="block w-full rounded-lg border-gray-200 bg-gray-50/50 text-gray-900 shadow-sm focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 transition-all duration-200 ease-in-out hover:border-gray-300"
                          />
                          <input
                            type="text"
                            placeholder="Sign"
                            defaultValue={deptStatus.signature || ''}
                            onChange={(e) => { application.tempSign = e.target.value; }}
                            className="block w-full rounded-lg border-gray-200 bg-gray-50/50 text-gray-900 shadow-sm focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 transition-all duration-200 ease-in-out hover:border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {deptStatus.status !== 'cleared' && (
                      <div className="mt-5 flex gap-3 justify-end border-t border-gray-100 pt-4">
                         <button
                          onClick={() => handleUpdate(application._id, application.tempAmount, application.tempRemark, application.tempAuth, application.tempSign, 'cleared')}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdate(application._id, application.tempAmount, application.tempRemark, application.tempAuth, application.tempSign, 'dues_pending')}
                           className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                        >
                           <ClockIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                          Pending
                        </button>
                         <button
                          onClick={() => handleUpdate(application._id, application.tempAmount, application.tempRemark, application.tempAuth, application.tempSign, 'rejected')}
                           className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                           <XCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>


      <Modal 
        {...modalConfig} 
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} 
      />
    </div>
  );
}