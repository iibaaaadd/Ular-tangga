import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Komponen untuk melindungi route yang membutuhkan autentikasi
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Tampilkan loading spinner saat mengecek auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
          <p className="text-white">Memuat...</p>
        </div>
      </div>
    );
  }

  // Redirect ke login jika user belum login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Komponen untuk route yang hanya boleh diakses jika belum login
export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Tampilkan loading spinner saat mengecek auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
          <p className="text-white">Memuat...</p>
        </div>
      </div>
    );
  }

  // Redirect ke home jika user sudah login
  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

// Komponen untuk route yang membutuhkan role tertentu
export const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Tampilkan loading spinner saat mengecek auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
          <p className="text-white">Memuat...</p>
        </div>
      </div>
    );
  }

  // Redirect ke login jika user belum login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Tampilkan error 403 jika role tidak sesuai
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-pink-600">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-2xl">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-white mb-4">Akses Ditolak</h1>
          <p className="text-white/80 mb-6">
            Anda tidak memiliki izin untuk mengakses halaman ini.
            <br />
            Role yang dibutuhkan: <strong>{allowedRoles.join(', ')}</strong>
            <br />
            Role Anda: <strong>{user.role}</strong>
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors"
          >
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  return children;
};