import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect user ke dashboard yang sesuai berdasarkan role
    if (user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'teacher':
          navigate('/teacher/dashboard', { replace: true });
          break;
        case 'student':
          navigate('/student/dashboard', { replace: true });
          break;
        default:
          // Default fallback ke student dashboard
          navigate('/student/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
  };

  // Loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Memuat Dashboard</h2>
          <p className="text-white/80">
            Mengarahkan ke dashboard {user?.role === 'admin' ? 'Admin' : user?.role === 'teacher' ? 'Guru' : 'Siswa'}...
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;