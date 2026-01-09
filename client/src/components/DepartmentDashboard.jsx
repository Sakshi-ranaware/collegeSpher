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

export default function DepartmentDashboard() {
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

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/department/applications/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update the local state to reflect the change
      setApplications(applications.map(app => 
        app._id === id ? { ...app, status } : app
      ));
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
                  <div className="flex space-x-2">
                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(application._id, 'approved')}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(application._id, 'rejected')}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        application.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : application.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {application.status === 'approved' ? (
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                      ) : application.status === 'rejected' ? (
                        <XCircleIcon className="h-3 w-3 mr-1" />
                      ) : (
                        <ClockIcon className="h-3 w-3 mr-1" />
                      )}
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
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