import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  ArrowRightIcon, 
  CheckBadgeIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const API_BASE_URL =import.meta.env.VITE_API_BASE_URL;

export default function Dashboard({ user }) {
  const [lcApplication, setLcApplication] = useState(null);
  const [alumniApplication, setAlumniApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [lcRes, alumniRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/student/applications`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/student/alumni/applications`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        if (lcRes.data.length > 0) setLcApplication(lcRes.data[0]);
        if (alumniRes.data.length > 0) setAlumniApplication(alumniRes.data[0]);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatusBadge = ({ status }) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Student'}!</h1>
        <p className="text-blue-100">Managing your academic clearance and alumni journey starts here.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Leaving Certificate Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              </div>
              {lcApplication && <StatusBadge status={lcApplication.status} />}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Leaving Certificate</h2>
            <p className="text-gray-500 mb-6">Apply for your Leaving Certificate and track No Dues clearance status.</p>
            
            {lcApplication ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Application Date:</span>
                  <span className="font-medium text-gray-900">{new Date(lcApplication.createdAt).toLocaleDateString()}</span>
                </div>
                {lcApplication.status === 'approved' ? (
                  <button 
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await axios.get(
                          `${API_BASE_URL}/student/application/${lcApplication._id}/download`,
                          { 
                            headers: { Authorization: `Bearer ${token}` },
                            responseType: 'blob' // Important for file download
                          }
                        );
                        
                        // Create blob link to download
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `Leaving_Certificate_${lcApplication.prn || 'copy'}.pdf`);
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                      } catch (err) {
                        console.error('Download failed:', err);
                        alert('Failed to download certificate. Please try again.');
                      }
                    }}
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 cursor-pointer"
                  >
                    <ArrowRightIcon className="h-4 w-4 mr-2" /> Download Certificate
                  </button>
                ) : (
                  <Link to="/no-dues" className="w-full flex justify-center items-center py-2 px-4 border border-blue-200 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50">
                    Track Status
                  </Link>
                )}
              </div>
            ) : (
              <Link to="/apply" className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-medium transition-colors">
                Apply Now <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Alumni Registration Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <UserGroupIcon className="h-8 w-8 text-indigo-600" />
              </div>
              {alumniApplication && <StatusBadge status={alumniApplication.status} />}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Alumni Association</h2>
            <p className="text-gray-500 mb-6">Register to become a part of our prestigious alumni network.</p>

            {alumniApplication ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className="font-medium text-gray-900 flex items-center">
                    {alumniApplication.status === 'approved' ? (
                      <><CheckBadgeIcon className="h-5 w-5 text-green-500 mr-2" /> Application Approved</>
                    ) : (
                      <><ClockIcon className="h-5 w-5 text-yellow-500 mr-2" /> Under Review</>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <Link to="/alumni" className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-medium transition-colors">
                Register Now <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
