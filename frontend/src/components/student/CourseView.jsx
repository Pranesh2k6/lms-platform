import { useState } from 'react';
import { FileText, ClipboardList, UserCheck } from 'lucide-react';
import CourseMaterials from './CourseMaterials';
import AssignmentSubmit from './AssignmentSubmit';
import AttendanceSubmit from './AttendanceSubmit';

const CourseView = ({ course, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('materials');

  const tabs = [
    { id: 'materials', label: 'Materials', icon: FileText },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList },
    { id: 'attendance', label: 'Attendance', icon: UserCheck }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'materials':
        return <CourseMaterials course={course} />;
      case 'assignments':
        return <AssignmentSubmit course={course} onUpdate={onUpdate} />;
      case 'attendance':
        return <AttendanceSubmit course={course} onUpdate={onUpdate} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Course Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: course.colorIdentifier }}
          >
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
            <p className="text-gray-600">{course.courseCode}</p>
            <p className="text-sm text-gray-500 mt-1">
              Instructor: {course.instructor?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Content */}
      <div>{renderContent()}</div>
    </div>
  );
};

export default CourseView;
