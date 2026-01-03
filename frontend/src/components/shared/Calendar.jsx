import { useState, useEffect } from 'react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Calendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'personal',
    scopeId: '',
    allDay: true
  });

  useEffect(() => {
    fetchEvents();
    if (user.role === 'professor') {
      fetchCourses();
    }
  }, [user.role]);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/calendar');
      setEvents(data);
    } catch (error) {
      toast.error('Failed to load events');
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/dashboard');
      setCourses(data.assignedCourses || []);
    } catch (error) {
      console.error('Failed to load courses');
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const startDate = new Date(selectedDate);
    startDate.setHours(9, 0, 0, 0);
    const endDate = new Date(selectedDate);
    endDate.setHours(10, 0, 0, 0);

    try {
      await api.post('/calendar', {
        title: formData.title,
        start: startDate,
        end: endDate,
        allDay: formData.allDay,
        type: formData.type,
        scopeId: formData.type === 'global' ? null : formData.scopeId || user.id
      });

      toast.success('Event created successfully!');
      setFormData({ title: '', type: 'personal', scopeId: '', allDay: true });
      setShowEventModal(false);
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    }
  };

  const getEventsForDate = (date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayEvents = getEventsForDate(date);
      if (dayEvents.length > 0) {
        return (
          <div className="flex justify-center gap-1 mt-1">
            {dayEvents.slice(0, 3).map((event, idx) => (
              <div
                key={idx}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    event.type === 'global'
                      ? '#EF4444'
                      : event.type === 'course'
                      ? '#3B82F6'
                      : '#10B981'
                }}
                title={event.title}
              />
            ))}
          </div>
        );
      }
    }
    return null;
  };

  const selectedDayEvents = getEventsForDate(selectedDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Calendar</h3>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">Global Events</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">Course Events</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Personal Events</span>
            </div>
          </div>
        </div>

        <ReactCalendar
          onChange={setSelectedDate}
          value={selectedDate}
          onClickDay={handleDateClick}
          tileContent={getTileContent}
          className="w-full border-0"
        />
      </div>

      {/* Events for Selected Date */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h4 className="text-lg font-bold text-gray-900 mb-4">
          {selectedDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </h4>

        {selectedDayEvents.length > 0 ? (
          <div className="space-y-3">
            {selectedDayEvents.map((event) => (
              <div
                key={event._id}
                className="p-3 rounded-lg border-l-4"
                style={{
                  borderColor:
                    event.type === 'global'
                      ? '#EF4444'
                      : event.type === 'course'
                      ? '#3B82F6'
                      : '#10B981',
                  backgroundColor:
                    event.type === 'global'
                      ? '#FEE2E2'
                      : event.type === 'course'
                      ? '#DBEAFE'
                      : '#D1FAE5'
                }}
              >
                <p className="font-semibold text-gray-900">{event.title}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)} Event
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No events for this date</p>
        )}

        {(user.role === 'admin' || user.role === 'professor' || user.role === 'student') && (
          <button
            onClick={() => setShowEventModal(true)}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        )}
      </div>

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add Event</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Team Meeting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value, scopeId: '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {user.role === 'admin' && <option value="global">Global Event</option>}
                  {user.role === 'professor' && <option value="course">Course Event</option>}
                  <option value="personal">Personal Event</option>
                </select>
              </div>

              {formData.type === 'course' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Course
                  </label>
                  <select
                    value={formData.scopeId}
                    onChange={(e) => setFormData({ ...formData, scopeId: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title} ({course.courseCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={formData.allDay}
                  onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="allDay" className="text-sm text-gray-700">
                  All day event
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Create Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
