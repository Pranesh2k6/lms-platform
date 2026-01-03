import { useState, useEffect } from 'react';
import { BookOpen, Calendar } from 'lucide-react';
import api from '../../utils/api';
import CourseCard from '../shared/CourseCard';
import CourseView from './CourseView';
import CalendarView from '../shared/Calendar';
import toast from 'react-hot-toast';

const ProfessorDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/dashboard');
      setCourses(data.assignedCourses || []);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'calendar', label: 'Calendar', icon: Calendar }
  ];

  const renderContent = () => {
    if (selectedCourse) {
      return (
        <div>
          <button
            onClick={() => setSelectedCourse(null)}
            className="mb-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Courses
          </button>
          <CourseView course={selectedCourse} onUpdate={fetchDashboard} />
        </div>
      );
    }

    switch (activeTab) {
      case 'courses':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length > 0 ? (
              courses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onClick={() => setSelectedCourse(course)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                No courses assigned yet
              </div>
            )}
          </div>
        );
      case 'calendar':
        return <CalendarView />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Professor Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your courses and assignments</p>
      </div>

      {!selectedCourse && (
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div>{renderContent()}</div>
    </div>
  );
};

export default ProfessorDashboard;
