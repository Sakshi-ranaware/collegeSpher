import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircleIcon, XCircleIcon, ClockIcon, 
  UserGroupIcon, DocumentTextIcon, ArrowPathIcon 
} from '@heroicons/react/24/outline';
import NoDuesForm from './NoDuesForm';
import Modal from './Modal';

const API_BASE_URL =import.meta.env.VITE_API_BASE_URL;

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('lc'); // 'lc' or 'alumni'
  const [lcApplications, setLcApplications] = useState([]);
  const [alumniApplications, setAlumniApplications] = useState([]);
  const [unapprovedUsers, setUnapprovedUsers] = useState([]);
  const [editingNoDuesId, setEditingNoDuesId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const [rejectionData, setRejectionData] = useState({ id: null, reason: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const lcRes = await axios.get(`${API_BASE_URL}/admin/lc/all`, headers);
      setLcApplications(lcRes.data);
    } catch (err) {
      console.error('Failed to fetch LC applications:', err);
    }

    try {
      const alumniRes = await axios.get(`${API_BASE_URL}/admin/alumni`, headers);
      setAlumniApplications(alumniRes.data);
    } catch (err) {
      console.error('Failed to fetch alumni applications:', err);
    }

    try {
      const usersRes = await axios.get(`${API_BASE_URL}/admin/users/unapproved`, headers);
      console.log('Unapproved users fetched:', usersRes.data.length);
      setUnapprovedUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to fetch unapproved users:', err);
    }

    setLoading(false);
  };

  const handleUserApproval = async (userId, status) => {
    if (status === 'rejected') {
      setRejectionData({ id: userId, reason: '' });
      setModalConfig({
        isOpen: true,
        title: 'Reject User',
        message: 'Please provide a reason for rejecting this staff member:',
        type: 'warning',
        confirmText: 'Reject',
        cancelText: 'Cancel',
        onConfirm: () => confirmUserRejection(userId)
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/admin/users/approve/${userId}`, 
        { status, reason: null }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalConfig({
        isOpen: true,
        title: 'Success',
        message: 'User approved successfully!',
        type: 'success'
      });
      fetchData();
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: err.response?.data?.message || 'Action failed',
        type: 'error'
      });
    }
  };

  const confirmUserRejection = async (userId) => {
    if (!rejectionData.reason) {
        setModalConfig({
            isOpen: true,
            title: 'Error',
            message: 'Reason is required',
            type: 'error'
        });
        return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/admin/users/approve/${userId}`, 
        { status: 'rejected', reason: rejectionData.reason }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalConfig({ isOpen: false });
      fetchData();
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: err.response?.data?.message || 'Rejection failed',
        type: 'error'
      });
    }
  };

  const handleLcApprove = (id) => {
    setRejectionData({ id, reason: 'PASSED AND PROMOTED' }); // reusing reason as remark
    setModalConfig({
      isOpen: true,
      title: 'Approve Leaving Certificate',
      message: 'Enter final remark for the certificate:',
      type: 'warning',
      confirmText: 'Approve',
      onConfirm: () => confirmLcApprove(id)
    });
  };

  const confirmLcApprove = async (id) => {
    if (!rejectionData.reason) {
        setModalConfig({
            isOpen: true,
            title: 'Error',
            message: 'Remark is required',
            type: 'error'
        });
        return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/admin/lc/approve/${id}`, { finalRemark: rejectionData.reason }, { headers: { Authorization: `Bearer ${token}` } });
      setModalConfig({ isOpen: false });
      await fetchData();
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: err.response?.data?.message || 'Failed to approve',
        type: 'error'
      });
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
          <button
            onClick={() => setActiveTab('users')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Staff Approvals ({unapprovedUsers.length})
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

                      <div className="flex space-x-2">
                        <button
                           onClick={() => setEditingNoDuesId(app._id)}
                           className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          No Dues Form
                        </button>
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
        ) : activeTab === 'alumni' ? (
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
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {unapprovedUsers.map((u) => (
                <li key={u._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-purple-600">{u.name}</p>
                      <p className="text-sm text-gray-500">{u.email} | Role: {u.role.toUpperCase()} {u.department ? `| Dept: ${u.department}` : ''}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUserApproval(u._id, 'approved')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUserApproval(u._id, 'rejected')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </li>
              ))}
              {unapprovedUsers.length === 0 && <p className="p-4 text-gray-500 text-center">No pending approvals.</p>}
            </ul>
          </div>
        )}
      </div>

      {editingNoDuesId && (
        <NoDuesForm 
          applicationId={editingNoDuesId} 
          onClose={() => {
            setEditingNoDuesId(null);
            fetchData();
          }} 
        />
      )}

      <Modal
        {...modalConfig}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
      >
        {(modalConfig.title === 'Reject User' || modalConfig.title === 'Approve Leaving Certificate') && (
          <textarea
            className="mt-4 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder={modalConfig.title === 'Reject User' ? "Enter reason..." : "Enter remark..."}
            value={rejectionData.reason}
            onChange={(e) => setRejectionData({ ...rejectionData, reason: e.target.value })}
            rows={3}
          />
        )}
      </Modal>
    </div>
  );
}
