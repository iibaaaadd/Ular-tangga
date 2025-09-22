import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-6xl font-bold text-white mb-4 animate-bounce">
          🐍 Ular Tangga Game 🪜
        </h1>
        <p className="text-xl text-white/90 mb-8">
          Game edukatif dengan soal-soal menarik untuk belajar sambil bermain!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link
            to="/login"
            className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl block"
          >
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-2xl font-bold text-white mb-2">Login</h3>
            <p className="text-white/80">Masuk untuk memulai bermain</p>
          </Link>

          <Link
            to="/register"
            className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl block"
          >
            <div className="text-5xl mb-4">✍️</div>
            <h3 className="text-2xl font-bold text-white mb-2">Daftar</h3>
            <p className="text-white/80">Buat akun baru untuk bergabung</p>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Fitur Unggulan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">3 Tipe Soal</h3>
              <p className="text-white/80 text-sm">Menjodohkan, Esai, dan Benar/Salah</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-time</h3>
              <p className="text-white/80 text-sm">Multiplayer hingga 4 pemain per papan</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">Analytics</h3>
              <p className="text-white/80 text-sm">Laporan lengkap hasil pembelajaran</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;