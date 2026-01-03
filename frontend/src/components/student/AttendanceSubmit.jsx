import { useState } from 'react';
import { Key } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AttendanceSubmit = ({ course, onUpdate }) => {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 4) {
      toast.error('Please enter a 4-digit code');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/courses/${course._id}/attendance/submit`, { code });
      toast.success('Attendance marked successfully!');
      setCode('');
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired code');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayRecord = course.attendanceRecords?.find(
    (record) => record.date === today
  );

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Mark Attendance</h3>

      {todayRecord ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-green-900">
                Attendance Marked
              </h4>
              <p className="text-sm text-green-700">
                You are marked present for today
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              Enter the 4-digit attendance code provided by your professor
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attendance Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                placeholder="1234"
                className="w-full px-4 py-3 text-2xl text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none tracking-widest font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || code.length !== 4}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Key className="w-5 h-5" />
                  Submit Attendance
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Attendance History */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Attendance History</h4>
        <div className="space-y-2">
          {course.attendanceRecords && course.attendanceRecords.length > 0 ? (
            course.attendanceRecords
              .slice()
              .reverse()
              .map((record, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-700">{new Date(record.date).toLocaleDateString()}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    record.status === 'present'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {record.status === 'present' ? 'Present' : 'Absent'}
                  </span>
                </div>
              ))
          ) : (
            <p className="text-gray-500 text-sm">No attendance records yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceSubmit;
