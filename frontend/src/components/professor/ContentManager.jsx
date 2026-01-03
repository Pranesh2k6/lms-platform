import { useState } from 'react';
import { Plus, Download, FileText } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import FileUpload from '../shared/FileUpload';

const ContentManager = ({ course, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('file', selectedFile);

      await api.post(`/courses/${course._id}/lectures`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Material added successfully!');
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setShowForm(false);
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add material');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop().toLowerCase();
    // Documents
    if (ext === 'pdf') return '📄';
    if (ext === 'ppt' || ext === 'pptx') return '📊';
    if (ext === 'doc' || ext === 'docx') return '📝';
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼️';
    // Videos
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return '🎥';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Course Materials</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Material
        </button>
      </div>

      {/* Add Material Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Material</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., Introduction to Programming"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Add a brief description about this material..."
              />
            </div>

            <FileUpload
              onFileSelect={setSelectedFile}
              label="Upload File (Documents, Images, Videos)"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  'Add Material'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setTitle('');
                  setDescription('');
                  setSelectedFile(null);
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Materials List */}
      <div className="space-y-3">
        {course.lectures && course.lectures.length > 0 ? (
          course.lectures.map((lecture, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">
                  {getFileIcon(lecture.file?.originalName)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{lecture.title}</h4>
                  {lecture.description && (
                    <p className="text-sm text-gray-600 mt-1">{lecture.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">{lecture.file?.originalName}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(lecture.file?.size)} • Added {new Date(lecture.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`http://localhost:5001${lecture.file?.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            No materials added yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManager;
