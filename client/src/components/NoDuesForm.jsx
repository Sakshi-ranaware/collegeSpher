
import { useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function NoDuesForm({ applicationId, onClose }) {
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [prn, setPrn] = useState('');
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  useEffect(() => {
    fetchData();
  }, [applicationId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      // We might need a specific endpoint to get just one application or reuse the list.
      // For now, let's assume we can fetch the single LC details or filter from a list if we had it.
      // But better to have a get-by-id endpoint or just pass the full object if available.
      // Since we only have ID, let's assume we might need to fetch or we can't. 
      // Actually, adminController doesn't have a get-one-LC endpoint explicitly shown in previous read, 
      // but we can add one or just rely on passing data.
      // However, to ensure fresh data, let's just make a quick endpoint or use what we have.
      // Wait, we don't have get-one. 
      // Let's rely on the parent updating or just fetch all and filter (inefficient but works for now)
      // OR, let's assume the parent passes the initial data?
      // No, for editing, we want fresh data. 
      // Let's assume we can use the 'updateNoDuesDetails' to also get data if we sent a GET? 
      // No, let's just fetch all and filter for now as a quick fix, or add get-one route.
      // Adding get-one route is better but takes time.
      // Let's try to fetch all and filter.
      const res = await axios.get(`${API_BASE_URL}/admin/lc/all`, { headers: { Authorization: `Bearer ${token}` } });
      const app = res.data.find(a => a._id === applicationId);
      if (app) {
        setFormData(app.noDuesStatuses);
        setStudentName(app.student?.name || 'Student');
        setPrn(app.prn);
      }
    } catch (err) {
      console.error(err);
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: 'Failed to load data. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, field, value) => {
    const newFormData = [...formData];
    newFormData[index][field] = value;
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/admin/lc/${applicationId}/nodues`, 
        { noDuesStatuses: formData }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalConfig({
        isOpen: true,
        title: 'Success',
        message: 'No Dues details updated successfully!',
        type: 'success',
        onConfirm: () => onClose()
      });
    } catch (err) {
      console.error(err);
      setModalConfig({
        isOpen: true,
        title: 'Update Failed',
        message: 'Failed to update details.',
        type: 'error'
      });
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full m-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-5 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              No Dues Certificate for Student
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Student: <span className="font-medium text-gray-900">{studentName}</span> | PRN: <span className="font-medium text-gray-900">{prn}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto bg-gray-50">
          <form id="no-dues-form" onSubmit={handleSubmit}>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-900 w-12">Sr.</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-900 w-1/4">Name of the Dept.</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-900 w-32">Dues Amount</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-900">Remark if any</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-900 w-48">Name of Authority</th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-900 w-32">Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 text-center text-gray-500 font-medium">
                        {index + 1}.
                      </td>
                      <td className="px-4 py-2 text-gray-900 font-medium">
                        {row.department}
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={row.dueAmount}
                          onChange={(e) => handleChange(index, 'dueAmount', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-1.5"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={row.remark}
                          onChange={(e) => handleChange(index, 'remark', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-1.5"
                          placeholder="Remark"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={row.authorityName}
                          onChange={(e) => handleChange(index, 'authorityName', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-1.5"
                          placeholder="Name"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={row.signature}
                          onChange={(e) => handleChange(index, 'signature', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-1.5"
                          placeholder="Sign"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="no-dues-form"
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
          >
            Save Details
          </button>
        </div>
      </div>
      <Modal 
        {...modalConfig} 
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} 
      />
    </div>
  );
}
