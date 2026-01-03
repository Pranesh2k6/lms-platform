import { BookOpen, Users, User } from 'lucide-react';

const CourseCard = ({ course, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 overflow-hidden"
    >
      {/* Color Header */}
      <div
        className="h-3"
        style={{ backgroundColor: course.colorIdentifier || '#3B82F6' }}
      ></div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {course.title}
            </h3>
            <p className="text-sm font-medium text-gray-500">{course.courseCode}</p>
          </div>
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${course.colorIdentifier}20` }}
          >
            <BookOpen
              className="w-6 h-6"
              style={{ color: course.colorIdentifier || '#3B82F6' }}
            />
          </div>
        </div>

        {course.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Footer Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
          {course.instructor && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{course.instructor.name}</span>
            </div>
          )}
          {course.students && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.students.length} students</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
