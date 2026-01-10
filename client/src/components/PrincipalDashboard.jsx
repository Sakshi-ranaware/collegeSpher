
import { useState, useEffect } from 'react';
import axios from 'axios';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Principal Dashboard - Final Approval</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {applications.map((app) => (
            <li key={app._id} className="p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Student: {app.student?.name}</h3>
                <p className="text-sm text-gray-500">PRN: {app.prn} | Stage: {app.workflowStage}</p>
                <p className="text-xs text-gray-400 mt-1">HOD Approved on: {new Date(app.hodApproval?.date).toLocaleDateString()}</p>
              </div>

              <div>
                {app.workflowStage === 'principal_pending' ? (
                   <button
                    onClick={() => handleGenerateLC(app._id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5 mr-1" />
                    Approve & Generate LC
                  </button>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    LC Generated
                  </span>
                )}
              </div>
            </li>
          ))}
          {applications.length === 0 && <p className="p-6 text-center text-gray-500">No applications pending for Principal review.</p>}
        </ul>
      </div>
    </div>
  );
}
