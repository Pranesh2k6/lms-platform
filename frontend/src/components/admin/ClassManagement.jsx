import { useState, useEffect } from 'react';
import { Plus, Users, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ClassManagement = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  // Form states
  const [newSection, setNewSection] = useState({
    name: '',
    program: '',
    batch: ''
  });
  const [studentEmails, setStudentEmails] = useState('');

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/sections');
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();

    if (!newSection.name || !newSection.program || !newSection.batch) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await api.post('/sections', newSection);
      toast.success('Section created successfully');
      setShowCreateModal(false);
      setNewSection({ name: '', program: '', batch: '' });
      fetchSections();
    } catch (error) {
      console.error('Error creating section:', error);
      toast.error(error.response?.data?.message || 'Failed to create section');
    }
  };

  const handleAddStudents = async (e) => {
    e.preventDefault();

    if (!studentEmails.trim()) {
      toast.error('Please enter student emails');
      return;
    }

    try {
      const { data } = await api.post(`/sections/${selectedSection._id}/students`, {
        emails: studentEmails
      });

      toast.success(`${data.results.added.length} students added successfully`);

      if (data.results.alreadyInSection.length > 0) {
        toast('Some students were already in this section', { icon: 'ℹ️' });
      }

      setShowAddStudentsModal(false);
      setStudentEmails('');
      setSelectedSection(null);
      fetchSections();
    } catch (error) {
      console.error('Error adding students:', error);
      toast.error(error.response?.data?.message || 'Failed to add students');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Are you sure you want to delete this section? Students will be removed from this section.')) {
      return;
    }

    try {
      await api.delete(`/sections/${sectionId}`);
      toast.success('Section deleted successfully');
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Failed to delete section');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Class Management</h2>
          <p className="text-gray-600 mt-1">Create and manage sections for organizing students</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Create Section
        </button>
      </div>

      {/* Sections List */}
      {sections.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No sections created yet</p>
          <p className="text-sm text-gray-500 mt-1">Create your first section to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div
              key={section._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{section.name}</h3>
                  <p className="text-sm text-gray-600">{section.program}</p>
                  <p className="text-xs text-gray-500">Batch: {section.batch}</p>
                </div>
                <button
                  onClick={() => handleDeleteSection(section._id)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Delete section"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                <Users className="w-4 h-4" />
                <span>{section.students?.length || 0} students</span>
              </div>

              <button
                onClick={() => {
                  setSelectedSection(section);
                  setShowAddStudentsModal(true);
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
              >
                Add Students
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Section Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Section</h3>

            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name
                </label>
                <input
                  type="text"
                  value={newSection.name}
                  onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                  placeholder="e.g., Section A, Section B"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program
                </label>
                <select
                  value={newSection.program}
                  onChange={(e) => setNewSection({ ...newSection, program: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Program</option>
                  <option value="B.Tech CSE">B.Tech CSE</option>
                  <option value="B.Tech ECE">B.Tech ECE</option>
                  <option value="B.Tech Mechanical">B.Tech Mechanical</option>
                  <option value="B.Tech Civil">B.Tech Civil</option>
                  <option value="B.Tech EEE">B.Tech EEE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch
                </label>
                <input
                  type="text"
                  value={newSection.batch}
                  onChange={(e) => setNewSection({ ...newSection, batch: e.target.value })}
                  placeholder="e.g., 2024-2028"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewSection({ name: '', program: '', batch: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Students Modal */}
      {showAddStudentsModal && selectedSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Add Students to {selectedSection.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedSection.program} • Batch {selectedSection.batch}
            </p>

            <form onSubmit={handleAddStudents} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Emails (comma-separated)
                </label>
                <textarea
                  value={studentEmails}
                  onChange={(e) => setStudentEmails(e.target.value)}
                  placeholder="student1@college.edu, student2@college.edu, ..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter student email addresses separated by commas
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStudentsModal(false);
                    setStudentEmails('');
                    setSelectedSection(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
