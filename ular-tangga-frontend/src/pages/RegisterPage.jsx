import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'student' // Default role
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();

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

    // Validasi form
    if (!formData.name || !formData.email || !formData.password) {
      setError('Nama, email, dan password harus diisi');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError('Konfirmasi password tidak sama');
      return;
    }

    const result = await register(formData);
    
    if (!result.success) {
      setError(result.error);
    }
    // Jika success, AuthContext akan handle redirect otomatis
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
          <p className="text-gray-600">Daftar untuk mulai petualangan</p>
        </div>

        {/* Register Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-pink-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white border border-pink-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent disabled:opacity-50"
                placeholder="Masukkan nama lengkap"
              />
            </div>

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
                placeholder="Masukkan email"
              />
            </div>

            <div>
              <input
                type="hidden"
                name="role"
                value="student"
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
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password
              </label>
              <input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white border border-pink-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent disabled:opacity-50"
                placeholder="Ulangi password"
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
                  Mendaftar...
                </div>
              ) : (
                'Daftar'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-600">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-pink-600 hover:text-pink-700 font-semibold">
                Masuk di sini
              </Link>
            </p>
            <Link to="/" className="block text-gray-500 hover:text-gray-700 text-sm">
              ← Kembali ke beranda
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-pink-200/50">
          <h3 className="text-gray-700 font-semibold mb-3 text-center">📝 Informasi Registrasi:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <span>👨‍🎓</span>
              <div>
                <strong className="text-pink-600">Akun Siswa:</strong> Anda akan terdaftar sebagai siswa dan dapat bermain game serta melihat leaderboard
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span>👑</span>
              <div>
                <strong className="text-rose-600">Role Lain:</strong> Untuk menjadi guru atau admin, hubungi administrator sistem
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span>🎮</span>
              <div>
                <strong className="text-pink-600">Mulai Bermain:</strong> Setelah registrasi, join kelas dengan kode dari guru Anda
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AnimatedBackground>
  );
};

export default RegisterPage;