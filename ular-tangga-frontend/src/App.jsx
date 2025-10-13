import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute, RoleProtectedRoute } from './components/ProtectedRoute';

// Import pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Import role-based dashboards
import AdminDashboard from './pages/admin/Dashboard';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';

// Import room components
import RoomController from './components/room/RoomController';

// Placeholder components untuk halaman lain
const GameRoom = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-2xl text-center">
      <h1 className="text-3xl font-bold text-white mb-4">🎮 Game Room</h1>
      <p className="text-white/80">Halaman ini akan dikembangkan selanjutnya</p>
      <a href="/home" className="inline-block mt-4 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors">
        ← Kembali ke Beranda
      </a>
    </div>
  </div>
);

const Leaderboard = () => (
  <div className="min-h-screen bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center">
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-2xl text-center">
      <h1 className="text-3xl font-bold text-white mb-4">🏆 Leaderboard</h1>
      <p className="text-white/80">Halaman ini akan dikembangkan selanjutnya</p>
      <a href="/home" className="inline-block mt-4 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors">
        ← Kembali ke Beranda
      </a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing page untuk yang belum login */}
          <Route path="/" element={
            <GuestRoute>
              <LandingPage />
            </GuestRoute>
          } />
          
          {/* Home page untuk yang sudah login */}
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          
          {/* Guest only routes (redirect jika sudah login) */}
          <Route path="/login" element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          } />
          <Route path="/register" element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          } />

          {/* Protected routes (butuh login) */}
          <Route path="/game" element={
            <ProtectedRoute>
              <GameRoom />
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          } />

          {/* Admin dashboard */}
          <Route path="/admin/dashboard" element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleProtectedRoute>
          } />

          {/* Teacher dashboard */}
          <Route path="/teacher/dashboard" element={
            <RoleProtectedRoute allowedRoles={['teacher', 'admin']}>
              <TeacherDashboard />
            </RoleProtectedRoute>
          } />

          {/* Student dashboard */}
          <Route path="/student/dashboard" element={
            <RoleProtectedRoute allowedRoles={['student', 'admin']}>
              <StudentDashboard />
            </RoleProtectedRoute>
          } />

          {/* Room routes - accessible by teachers and students */}
          <Route path="/room/:roomCode" element={
            <ProtectedRoute>
              <RoomController />
            </ProtectedRoute>
          } />
          <Route path="/room/:roomCode/study" element={
            <ProtectedRoute>
              <RoomController />
            </ProtectedRoute>
          } />
          <Route path="/room/:roomCode/game" element={
            <ProtectedRoute>
              <RoomController />
            </ProtectedRoute>
          } />

          {/* Legacy admin & teacher routes - redirect to new dashboards */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
