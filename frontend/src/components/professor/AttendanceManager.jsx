import { useState } from 'react';
import { Key, RefreshCw } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AttendanceManager = ({ course, onUpdate }) => {
  const [activeCode, setActiveCode] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post(`/courses/${course._id}/attendance/generate`);
      setActiveCode(data.code);
      toast.success(`Attendance code generated: ${data.code}`);
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate code');
    } finally {
      setGenerating(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todaySession = course.attendanceSessions?.find(
    (session) => session.date === today && session.isActive
  );

  const todayRecords = course.attendanceRecords?.filter(
    (record) => record.date === today
  ) || [];

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Attendance Management</h3>

      {/* Generate Code Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Generate Attendance Code</h4>
        <p className="text-sm text-gray-600 mb-4">
          Generate a 4-digit code for students to mark their attendance for today
        </p>

        <button
          onClick={handleGenerateCode}
          disabled={generating}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {generating ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Generate New Code
            </>
          )}
        </button>

        {(activeCode || todaySession) && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">Active Code for Today:</span>
            </div>
            <div className="text-4xl font-bold text-green-600 tracking-wider">
              {activeCode || todaySession.code}
            </div>
            <p className="text-sm text-green-700 mt-2">
              Share this code with students to mark their attendance
            </p>
          </div>
        )}
      </div>

      {/* Today's Attendance */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Today's Attendance ({todayRecords.length} / {course.students?.length || 0})
        </h4>

        {todayRecords.length > 0 ? (
          <div className="space-y-2">
            {todayRecords.map((record, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                    {record.studentId?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {record.studentId?.name || 'Unknown Student'}
                    </p>
                    <p className="text-sm text-gray-500">{record.studentId?.email}</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  Present
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No attendance recorded yet for today
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManager;
