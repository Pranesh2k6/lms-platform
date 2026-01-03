import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Download, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import FileUpload from '../shared/FileUpload';

const AssignmentSubmit = ({ course, onUpdate }) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    fetchAssignments();
  }, [course._id]);

  const fetchAssignments = async () => {
    try {
      const { data } = await api.get(`/assignments/course/${course._id}`);
      setAssignments(data);
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (assignmentId, file) => {
    setSelectedFiles({ ...selectedFiles, [assignmentId]: file });
  };

  const handleSubmit = async (assignmentId) => {
    const file = selectedFiles[assignmentId];
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setSubmitting({ ...submitting, [assignmentId]: true });

    try {
      const formData = new FormData();
      formData.append('file', file);

      await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Assignment submitted successfully!');
      setSelectedFiles({ ...selectedFiles, [assignmentId]: null });
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting({ ...submitting, [assignmentId]: false });
    }
  };

  const hasSubmitted = (assignment) => {
    return assignment.submissions?.some((sub) => sub.studentId._id === user.id);
  };

  const getMySubmission = (assignment) => {
    return assignment.submissions?.find((sub) => sub.studentId._id === user.id);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Assignments</h3>

      <div className="space-y-4">
        {assignments.length > 0 ? (
          assignments.map((assignment) => {
            const submitted = hasSubmitted(assignment);
            const mySubmission = getMySubmission(assignment);
            const isPastDue = new Date(assignment.dueDate) < new Date();

            return (
              <div
                key={assignment._id}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {assignment.title}
                    </h4>
                    {assignment.description && (
                      <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                    )}
                  </div>
                  {submitted && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Due: {new Date(assignment.dueDate).toLocaleString()}
                  </span>
                  {isPastDue && !submitted && (
                    <span className="text-red-600 font-medium ml-2">Overdue</span>
                  )}
                </div>

                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-green-900 font-medium mb-1">
                          ✓ Submitted
                        </p>
                        <p className="text-sm text-green-700 mb-2">
                          Submitted on: {new Date(mySubmission?.submittedAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-green-700">
                          File: {mySubmission?.file?.originalName}
                        </p>
                      </div>
                      <a
                        href={`http://localhost:5001${mySubmission?.file?.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <FileUpload
                      onFileSelect={(file) => handleFileSelect(assignment._id, file)}
                      label="Upload your assignment"
                    />
                    <button
                      onClick={() => handleSubmit(assignment._id)}
                      disabled={!selectedFiles[assignment._id] || submitting[assignment._id]}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting[assignment._id] ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Submit Assignment
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            No assignments yet
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentSubmit;
