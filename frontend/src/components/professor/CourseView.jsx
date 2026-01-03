import { useState } from 'react';
import { FileText, ClipboardList, UserCheck } from 'lucide-react';
import ContentManager from './ContentManager';
import AssignmentManager from './AssignmentManager';
import AttendanceManager from './AttendanceManager';

const CourseView = ({ course, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('content');

  const tabs = [
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList },
    { id: 'attendance', label: 'Attendance', icon: UserCheck }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'content':
        return <ContentManager course={course} onUpdate={onUpdate} />;
      case 'assignments':
        return <AssignmentManager course={course} onUpdate={onUpdate} />;
      case 'attendance':
        return <AttendanceManager course={course} onUpdate={onUpdate} />;
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
            <p className="text-sm text-gray-500 mt-1">{course.students?.length || 0} students enrolled</p>
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
