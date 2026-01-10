import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function DepartmentDashboard({ user }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
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
  }, []);

  const handleUpdate = async (id, dueAmount, remark, authorityName, signature) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/department/applications/${id}`,
        { dueAmount, remark, authorityName, signature },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh list to show saved data
      const response = await axios.get(`${API_BASE_URL}/department/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(response.data);
      alert('Updated successfully');
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
            {applications.map((application) => (
              <li key={application._id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary-600">
                      Application #{application._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Student: {application.studentName || 'N/A'}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Reason: {application.reason}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Applied on: {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                      {/* Editable Row for Department */}
                      <div className="mt-4 border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Update Department Dues Status</h4>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-700">Due Amount</label>
                            <input
                              type="number"
                              defaultValue={application.noDuesStatuses.find(d => d.department === user.department)?.dueAmount || 0}
                              onChange={(e) => {
                                application.tempAmount = e.target.value;
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <label className="block text-xs font-medium text-gray-700">Remark</label>
                            <input
                              type="text"
                              defaultValue={application.noDuesStatuses.find(d => d.department === user.department)?.remark || ''}
                              onChange={(e) => {
                                application.tempRemark = e.target.value;
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                           <div className="sm:col-span-3">
                            <label className="block text-xs font-medium text-gray-700">Authority Name</label>
                            <input
                              type="text"
                              defaultValue={application.noDuesStatuses.find(d => d.department === user.department)?.authorityName || ''}
                              onChange={(e) => {
                                application.tempAuth = e.target.value;
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                           <div className="sm:col-span-3">
                            <label className="block text-xs font-medium text-gray-700">Signature (Type Name)</label>
                            <input
                              type="text"
                              defaultValue={application.noDuesStatuses.find(d => d.department === user.department)?.signature || ''}
                              onChange={(e) => {
                                application.tempSign = e.target.value;
                              }}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => handleUpdate(application._id, application.tempAmount, application.tempRemark, application.tempAuth, application.tempSign)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Save Details
                          </button>
                        </div>
                      </div>
                   
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}