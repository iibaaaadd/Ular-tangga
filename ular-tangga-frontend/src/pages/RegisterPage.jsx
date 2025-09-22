import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white mb-2 hover:scale-105 transition-transform">
              🐍 Ular Tangga 🪜
            </h1>
          </Link>
          <p className="text-white/80">Daftar untuk mulai bermain</p>
        </div>

        {/* Register Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
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
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent disabled:opacity-50"
                placeholder="Masukkan nama lengkap"
              />
            </div>

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
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent disabled:opacity-50"
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
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent disabled:opacity-50"
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-white mb-2">
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
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent disabled:opacity-50"
                placeholder="Ulangi password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
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
            <p className="text-white/80">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-green-300 hover:text-green-200 font-semibold">
                Masuk di sini
              </Link>
            </p>
            <Link to="/" className="block text-white/60 hover:text-white/80 text-sm">
              ← Kembali ke beranda
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3 text-center">📝 Informasi Registrasi:</h3>
          <div className="space-y-2 text-sm text-white/80">
            <div className="flex items-start space-x-2">
              <span>�‍🎓</span>
              <div>
                <strong className="text-blue-300">Akun Siswa:</strong> Anda akan terdaftar sebagai siswa dan dapat bermain game serta melihat leaderboard
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span>�</span>
              <div>
                <strong className="text-yellow-300">Role Lain:</strong> Untuk menjadi guru atau admin, hubungi administrator sistem
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span>�</span>
              <div>
                <strong className="text-green-300">Mulai Bermain:</strong> Setelah registrasi, join kelas dengan kode dari guru Anda
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;