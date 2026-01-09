import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircleIcon, XCircleIcon, ClockIcon, 
  UserGroupIcon, DocumentTextIcon, ArrowPathIcon 
} from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('lc'); // 'lc' or 'alumni'
  const [lcApplications, setLcApplications] = useState([]);
  const [alumniApplications, setAlumniApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [lcRes, alumniRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/lc/all`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/admin/alumni`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setLcApplications(lcRes.data);
      setAlumniApplications(alumniRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLcApprove = async (id) => {
    const remark = prompt('Enter final remark for certificate:');
    if (!remark) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/admin/lc/approve/${id}`, { finalRemark: remark }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchData();
    } catch (err) {
      alert('Failed to approve: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAlumniStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/admin/alumni/${id}/status`, { status, adminRemark: 'Processed by Admin' }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">Manage all student applications and registrations.</p>
        </div>
      </div>

      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('lc')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'lc'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Leaving Certificates
          </button>
          <button
            onClick={() => setActiveTab('alumni')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alumni'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Alumni Registrations
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'lc' ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {lcApplications.map((app) => (
                <li key={app._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-600">Student: {app.student?.name}</p>
                      <p className="text-sm text-gray-500">PRN: {app.prn} | Status: {app.status}</p>
                    </div>
                    <div>
                      {app.status === 'pending' && (
                        <button
                          onClick={() => handleLcApprove(app._id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          Generate Cert
                        </button>
                      )}
                      {app.status === 'approved' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Approved
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {lcApplications.length === 0 && <p className="p-4 text-gray-500 text-center">No applications found.</p>}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {alumniApplications.map((app) => (
                <li key={app._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-indigo-600">{app.firstName} {app.lastName}</p>
                      <p className="text-sm text-gray-500">Status: {app.currentStatus} | Current: {app.status}</p>
                    </div>
                    <div className="flex space-x-2">
                      {app.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleAlumniStatus(app._id, 'approved')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAlumniStatus(app._id, 'rejected')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          app.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {app.status}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {alumniApplications.length === 0 && <p className="p-4 text-gray-500 text-center">No applications found.</p>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
