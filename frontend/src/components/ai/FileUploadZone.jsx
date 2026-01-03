import { useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const FileUploadZone = ({ onFileProcessed }) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please upload an image, PDF, Excel, or CSV file.');
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const uploadFile = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/ai-agent/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success(`Parsed ${response.data.count} student(s) from file`);
        onFileProcessed(response.data);
        setFile(null);
      } else {
        toast.error(response.data.error || 'Failed to parse file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-8 h-8" />;

    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="w-8 h-8" />;
    } else {
      return <FileSpreadsheet className="w-8 h-8" />;
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            Drag & drop a file here, or click to select
          </p>
          <p className="text-xs text-gray-500">
            Supports: Images (JPG, PNG), PDF, Excel, CSV (Max 10MB)
          </p>
          <input
            id="fileInput"
            type="file"
            className="hidden"
            accept="image/*,.pdf,.xlsx,.xls,.csv"
            onChange={handleChange}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="text-blue-600">{getFileIcon()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-gray-400 hover:text-gray-600"
              disabled={uploading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={uploadFile}
            disabled={uploading}
            className="w-full mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {uploading ? 'Processing...' : 'Parse & Upload'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
