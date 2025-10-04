import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const LandingPage = () => {
  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-100 to-pink-200 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-pink-300/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl w-full">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="inline-block mb-6"
              variants={floatingVariants}
              animate="animate"
            >
              <div className="text-8xl mb-4 filter drop-shadow-lg">
                🎮✨
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-pink-700 bg-clip-text text-transparent mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              QuizBattle Arena
            </motion.h1>
            
            <motion.div
              className="flex justify-center items-center gap-2 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="h-1 w-12 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full"></div>
              <span className="text-2xl">⚡</span>
              <div className="h-1 w-12 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full"></div>
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Platform pembelajaran interaktif yang mengubah cara belajar menjadi pengalaman yang 
              <span className="text-pink-600 font-semibold"> menyenangkan</span> dan 
              <span className="text-rose-600 font-semibold"> kompetitif</span>!
            </motion.p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-20"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Link
                to="/login"
                className="group relative bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-8 text-center hover:from-pink-600 hover:to-rose-600 transition-all duration-300 block overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-y-6 scale-110 group-hover:scale-125 transition-transform duration-300"></div>
                <div className="relative z-10">
                  <motion.div 
                    className="text-6xl mb-4"
                    whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    �
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white mb-2">Masuk Game</h3>
                  <p className="text-pink-100">Bergabung dengan jutaan pemain</p>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link
                to="/register"
                className="group relative bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-8 text-center hover:from-rose-600 hover:to-pink-600 transition-all duration-300 block overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/20 transform skew-y-6 scale-110 group-hover:scale-125 transition-transform duration-300"></div>
                <div className="relative z-10">
                  <motion.div 
                    className="text-6xl mb-4"
                    whileHover={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    ⭐
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white mb-2">Mulai Petualangan</h3>
                  <p className="text-rose-100">Daftar gratis sekarang juga</p>
                </div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Section */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
              whileInView={{ scale: [0.9, 1.05, 1] }}
              transition={{ duration: 0.6 }}
            >
              Kenapa Harus
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600"> QuizBattle</span>?
            </motion.h2>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div 
                className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                variants={fadeInUp}
                whileHover={{ y: -10 }}
              >
                <motion.div 
                  className="text-5xl mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  🎯
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">3 Mode Seru</h3>
                <p className="text-gray-600 leading-relaxed">
                  Multiple Choice, True/False, dan Matching - beragam tantangan untuk mengasah otak!
                </p>
              </motion.div>

              <motion.div 
                className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                variants={fadeInUp}
                whileHover={{ y: -10 }}
              >
                <motion.div 
                  className="text-5xl mb-6"
                  whileHover={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.4 }}
                >
                  ⚡
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Real-time Battle</h3>
                <p className="text-gray-600 leading-relaxed">
                  Bertarung langsung dengan teman-teman dalam waktu nyata. Siapa yang tercepat?
                </p>
              </motion.div>

              <motion.div 
                className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                variants={fadeInUp}
                whileHover={{ y: -10 }}
              >
                <motion.div 
                  className="text-5xl mb-6"
                  whileHover={{ rotate: [0, -15, 15, 0] }}
                  transition={{ duration: 0.6 }}
                >
                  🏆
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Leaderboard</h3>
                <p className="text-gray-600 leading-relaxed">
                  Kompetisi seru dengan sistem ranking dan reward untuk para juara!
                </p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            className="text-center mt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 text-gray-600 text-lg"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span>Scroll untuk melihat lebih banyak</span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ⬇️
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;