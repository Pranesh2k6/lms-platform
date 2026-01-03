import { Download } from 'lucide-react';

const CourseMaterials = ({ course }) => {
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
      <h3 className="text-xl font-bold text-gray-900 mb-6">Course Materials</h3>

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
            No materials available yet
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseMaterials;
