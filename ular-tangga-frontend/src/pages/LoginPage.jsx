import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error ketika user mulai mengetik
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email dan password harus diisi');
      return;
    }

    const result = await login(formData);
    
    if (!result.success) {
      setError(result.error);
    }
    // Jika success, AuthContext akan handle redirect otomatis
  };

  const fillDemoAccount = (role) => {
    const accounts = {
      admin: { email: 'admin@example.com', password: 'password123' },
      teacher: { email: 'teacher@example.com', password: 'password123' },
      student: { email: 'student@test.com', password: 'password' }
    };
    
    setFormData(accounts[role]);
  };

  return (
    <AnimatedBackground variant="default" particleCount={15}>
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2 hover:scale-105 transition-transform">
              🎮 QuizBattle Arena ✨
            </h1>
          </Link>
          <p className="text-gray-600">Masuk untuk memulai petualangan</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-pink-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white border border-pink-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent disabled:opacity-50"
                placeholder="Masukkan email Anda"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white border border-pink-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent disabled:opacity-50"
                placeholder="Masukkan password Anda"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-pink-300 disabled:to-rose-300 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Masuk...
                </div>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-600">
              Belum punya akun?{' '}
              <Link to="/register" className="text-pink-600 hover:text-pink-700 font-semibold">
                Daftar di sini
              </Link>
            </p>
            <Link to="/" className="block text-gray-500 hover:text-gray-700 text-sm">
              ← Kembali ke beranda
            </Link>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-pink-200/50">
          <h3 className="text-gray-700 font-semibold mb-3 text-center">Demo Accounts:</h3>
          <div className="space-y-2">
            <button
              onClick={() => fillDemoAccount('admin')}
              className="w-full text-left bg-purple-100 hover:bg-purple-200 px-3 py-2 rounded text-sm text-gray-700 transition-colors border border-purple-200"
            >
              👑 <strong>Admin:</strong> admin@example.com
            </button>
            <button
              onClick={() => fillDemoAccount('teacher')}
              className="w-full text-left bg-green-100 hover:bg-green-200 px-3 py-2 rounded text-sm text-gray-700 transition-colors border border-green-200"
            >
              👨‍🏫 <strong>Guru:</strong> teacher@example.com
            </button>
            <button
              onClick={() => fillDemoAccount('student')}
              className="w-full text-left bg-blue-100 hover:bg-blue-200 px-3 py-2 rounded text-sm text-gray-700 transition-colors border border-blue-200"
            >
              👨‍🎓 <strong>Siswa:</strong> student@test.com
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-2 text-center">Password: <strong>password</strong></p>
        </div>
      </div>
      </div>
    </AnimatedBackground>
  );
};

export default LoginPage;