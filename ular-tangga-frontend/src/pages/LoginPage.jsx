import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      admin: { email: 'admin@test.com', password: 'password' },
      teacher: { email: 'teacher@test.com', password: 'password' },
      student: { email: 'student@test.com', password: 'password' }
    };
    
    setFormData(accounts[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white mb-2 hover:scale-105 transition-transform">
              🐍 Ular Tangga 🪜
            </h1>
          </Link>
          <p className="text-white/80">Masuk untuk memulai permainan</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
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
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50"
                placeholder="Masukkan email Anda"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
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
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50"
                placeholder="Masukkan password Anda"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
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
            <p className="text-white/80">
              Belum punya akun?{' '}
              <Link to="/register" className="text-blue-300 hover:text-blue-200 font-semibold">
                Daftar di sini
              </Link>
            </p>
            <Link to="/" className="block text-white/60 hover:text-white/80 text-sm">
              ← Kembali ke beranda
            </Link>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3 text-center">Demo Accounts:</h3>
          <div className="space-y-2">
            <button
              onClick={() => fillDemoAccount('admin')}
              className="w-full text-left bg-purple-500/20 hover:bg-purple-500/30 px-3 py-2 rounded text-sm text-white transition-colors"
            >
              👑 <strong>Admin:</strong> admin@test.com
            </button>
            <button
              onClick={() => fillDemoAccount('teacher')}
              className="w-full text-left bg-green-500/20 hover:bg-green-500/30 px-3 py-2 rounded text-sm text-white transition-colors"
            >
              👨‍🏫 <strong>Guru:</strong> teacher@test.com
            </button>
            <button
              onClick={() => fillDemoAccount('student')}
              className="w-full text-left bg-blue-500/20 hover:bg-blue-500/30 px-3 py-2 rounded text-sm text-white transition-colors"
            >
              👨‍🎓 <strong>Siswa:</strong> student@test.com
            </button>
          </div>
          <p className="text-white/60 text-xs mt-2 text-center">Password: <strong>password</strong></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;