import { useAuth } from '../context/AuthContext';
import Navbar from '../components/shared/Navbar';
import AdminDashboard from '../components/admin/AdminDashboard';
import ProfessorDashboard from '../components/professor/ProfessorDashboard';
import StudentDashboard from '../components/student/StudentDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'professor':
        return <ProfessorDashboard />;
      case 'student':
        return <StudentDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Unknown user role</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{renderDashboard()}</main>
    </div>
  );
};

export default Dashboard;
