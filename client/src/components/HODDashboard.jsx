
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function HODDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">HOD Dashboard - Review Applications</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {applications.map((app) => (
            <li key={app._id} className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Student: {app.student?.name}</h3>
                <p className="text-sm text-gray-500">PRN: {app.prn} | Status: {app.workflowStage}</p>
              </div>

              {/* Read-Only View of No Dues Form */}
              <div className="overflow-x-auto border rounded-md mb-4 bg-gray-50 p-2">
                <table className="min-w-full text-xs text-left">
                  <thead className="border-b">
                    <tr>
                      <th className="px-2 py-1">Dept</th>
                      <th className="px-2 py-1">Due Amount</th>
                      <th className="px-2 py-1">Remark</th>
                      <th className="px-2 py-1">Authority</th>
                      <th className="px-2 py-1">Sign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {app.noDuesStatuses.map((row, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-gray-100">
                        <td className="px-2 py-1 font-medium">{row.department}</td>
                        <td className="px-2 py-1">{row.dueAmount}</td>
                        <td className="px-2 py-1">{row.remark}</td>
                        <td className="px-2 py-1">{row.authorityName}</td>
                        <td className="px-2 py-1">{row.signature}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-x-3">
                {(app.workflowStage === 'dept_pending' || app.workflowStage === 'hod_pending') && (
                  <>
                     <button
                      onClick={() => handleApproval(app._id, 'approved')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-1" />
                      Approve & Send to Principal
                    </button>
                    <button
                      onClick={() => handleApproval(app._id, 'rejected')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                       <XCircleIcon className="h-5 w-5 mr-1" />
                      Reject (Send Back)
                    </button>
                  </>
                )}
                {app.hodApproval?.status === 'approved' && (
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                    Approved by HOD
                  </span>
                )}
              </div>
            </li>
          ))}
          {applications.length === 0 && <p className="p-6 text-center text-gray-500">No pending applications.</p>}
        </ul>
      </div>
    </div>
  );
}
