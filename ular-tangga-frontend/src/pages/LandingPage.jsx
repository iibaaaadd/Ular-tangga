import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import logoImage from '../assets/Images/logo.png';
import Icon from '../components/ui/Icon';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Trigger loading sequence
    const timer = setTimeout(() => setIsLoaded(true), 100);
    
    // Step through entrance animations
    const stepTimers = [
      setTimeout(() => setCurrentStep(1), 800),
      setTimeout(() => setCurrentStep(2), 1400),
      setTimeout(() => setCurrentStep(3), 2000),
    ];

    return () => {
      clearTimeout(timer);
      stepTimers.forEach(clearTimeout);
    };
  }, []);

  // Entrance animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.3
      }
    }
  };

  const slideUpVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 120,
        duration: 0.8
      }
    }
  };

  const scaleInVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        duration: 0.6
      }
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

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

  // Loading Screen Component
  const LoadingScreen = () => (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 1.1,
        transition: { duration: 0.8, ease: "easeInOut" }
      }}
    >
      <div className="text-center">
        <motion.div
          className="mb-6"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: [0, 1.2, 1],
            rotate: [0, 360, 0]
          }}
          transition={{ 
            duration: 1.5,
            ease: "easeOut"
          }}
        >
          <img 
            src={logoImage} 
            alt="Cakra Basa Logo" 
            className="w-24 h-24 mx-auto"
          />
        </motion.div>
        <motion.h1
          className="text-4xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Cakra Basa
        </motion.h1>
        <motion.div
          className="flex justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-white rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );

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
    <>
      <AnimatePresence>
        {!isLoaded && <LoadingScreen />}
      </AnimatePresence>
      
      <AnimatedBackground variant="default" particleCount={20}>
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
              className="inline-block"
              variants={floatingVariants}
              animate="animate"
            >
              <div className="filter drop-shadow-lg flex justify-center items-center gap-4">
                <img 
                  src={logoImage} 
                  alt="Cakra Basa Logo" 
                  className="w-40 h-40"
                />
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-pink-700 bg-clip-text text-transparent mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Cakra Basa
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
              Platform pembelajaran bahasa Jawa interaktif yang mengubah cara belajar aksara dan kosakata menjadi pengalaman yang 
              <span className="text-pink-600 font-semibold"> asik</span> lan 
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
                    className="mb-4 flex justify-center"
                    whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon name="gamepad" size={64} className="text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white mb-2">Mlebu</h3>
                  <p className="text-pink-100">Gabung karo kanca-kanca liyane</p>
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
                    className="mb-4 flex justify-center"
                    whileHover={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon name="users" size={64} className="text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white mb-2">Daftar</h3>
                  <p className="text-rose-100">Wiwiti sinau basa Jawa saiki</p>
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
              Kenapa Kudu Sinau
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600"> Cakra Basa</span>?
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
                  Multiple Choice, Bener-Salah, lan Matchingnan - macem-macem tantangan kanggo ngasah kawruh basa Jawa!
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
                  Adu pinter karo kanca-kanca ing wektu nyata. Sapa sing paling cepet njawab pitakon basa Jawa?
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
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Papan Juara</h3>
                <p className="text-gray-600 leading-relaxed">
                  Kompetisi seru karo sistem ranking lan hadiah kanggo para jawara basa Jawa!
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
              <span>Gulung mudhun kanggo weruh luwih akeh</span>
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
      </AnimatedBackground>
    </>
  );
};

export default LandingPage;