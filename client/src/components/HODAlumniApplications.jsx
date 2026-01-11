import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  AcademicCapIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function HODAlumniApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/hod/alumni/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch applications');
      setLoading(false);
      console.error(err);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (!confirm(`Are you sure you want to ${newStatus} this application?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/hod/alumni/approve/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setApplications(apps => 
        apps.map(app => 
          app._id === id ? { ...app, status: newStatus } : app
        )
      );
      alert(`Application ${newStatus} successfully`);
    } catch (err) {
      alert('Failed to update status');
      console.error(err);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = 
      app.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.universityPrn?.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-6 sm:px-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <AcademicCapIcon className="h-8 w-8 text-white" />
                <h1 className="text-2xl font-bold text-white">
                  Alumni Applications
                </h1>
              </div>
              <div className="text-blue-100 text-sm font-medium px-3 py-1 bg-blue-800/50 rounded-full">
                {applications.length} Total Applications
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex gap-2">
                {['all', 'pending', 'approved', 'rejected'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filter === f
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or PRN..."
                  className="pl-10 block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      Loading applications...
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                              {app.firstName?.[0]}{app.lastName?.[0]}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {app.firstName} {app.middleName} {app.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {app.email}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Mob: {app.mobile}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">PRN: {app.universityPrn}</div>
                        <div className="text-sm text-gray-500">Passout: {app.lastExamYear}</div>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Result: {app.result}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">{app.currentStatus}</div>
                        {app.currentStatus === 'Employed' && (
                          <div className="text-xs text-gray-500">
                            {app.employmentDetails?.designation} at {app.employmentDetails?.companyName}
                          </div>
                        )}
                        {app.currentStatus === 'Higher Studies' && (
                          <div className="text-xs text-gray-500">
                            {app.higherStudiesDetails?.courseName} at {app.higherStudiesDetails?.instituteName}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          app.status === 'approved' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {app.status === 'approved' && <CheckCircleIcon className="w-4 h-4 mr-1" />}
                          {app.status === 'rejected' && <XCircleIcon className="w-4 h-4 mr-1" />}
                          {app.status === 'pending' && <ClockIcon className="w-4 h-4 mr-1" />}
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {app.status === 'pending' && (
                          <div className="flex space-x-3">
                             <button
                               onClick={() => window.location.href = `/hod/alumni/application/${app._id}`}
                               className="text-indigo-600 hover:text-indigo-900 flex items-center font-medium"
                             >
                               View Details
                             </button>
                          </div>
                        )}
                        {app.status !== 'pending' && (
                             <button
                               onClick={() => window.location.href = `/hod/alumni/application/${app._id}`}
                               className="text-gray-600 hover:text-gray-900 flex items-center text-sm"
                             >
                               View Details
                             </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
