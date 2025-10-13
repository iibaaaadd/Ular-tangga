import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { gameRoomService, gameSessionService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import echo from '../../services/echo';
import WaitingRoom from './WaitingRoom';
import StudyPhase from './StudyPhase';
import GameRoom from './GameRoom';
import LoadingSpinner from '../ui/LoadingSpinner';

const RoomController = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('waiting'); // waiting, studying, playing, finished
  const [phaseTransition, setPhaseTransition] = useState(null);
  const channelRef = useRef(null);
  
  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    if (roomCode) {
      fetchRoomDetails();
    }
  }, [roomCode]);

  useEffect(() => {
    if (room) {
      setCurrentPhase(room.status);
    }
  }, [room]);

  // Real-time room updates
  useEffect(() => {
    if (!roomCode || !room) return;

    const channel = echo.channel(`room.${roomCode}`);
    channelRef.current = channel;

    // Listen for room status changes
    channel.listen('.room.updated', (event) => {
      console.log('Room status updated:', event);
      
      if (event.eventType === 'status_changed') {
        const newPhase = event.room.status;
        
        // Smooth phase transition
        setPhaseTransition(newPhase);
        
        setTimeout(() => {
          setRoom(event.room);
          setCurrentPhase(newPhase);
          setPhaseTransition(null);
        }, 500);
      } else {
        setRoom(event.room);
      }
    });

    // Connection status monitoring
    channel.subscribed(() => {
      console.log(`Connected to room ${roomCode} channel`);
    });

    channel.error((error) => {
      console.error('Room channel error:', error);
    });

    return () => {
      if (channelRef.current) {
        echo.leaveChannel(`room.${roomCode}`);
        channelRef.current = null;
      }
    };
  }, [roomCode, room?.id]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await gameRoomService.getRoomDetails(roomCode);
      if (response.status === 'success') {
        setRoom(response.data);
      } else {
        setError('Room tidak ditemukan');
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat room');
      console.error('Error fetching room details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartStudying = async () => {
    try {
      if (!isTeacher) return;
      
      const response = await gameRoomService.startStudying(roomCode);
      if (response.status === 'success') {
        setRoom(prev => ({ ...prev, status: 'studying' }));
        setCurrentPhase('studying');
      }
    } catch (error) {
      console.error('Error starting study phase:', error);
      throw error;
    }
  };

  const handleStartGame = async () => {
    try {
      if (!isTeacher) return;
      
      const response = await gameRoomService.startGame(roomCode);
      if (response.status === 'success') {
        setRoom(prev => ({ ...prev, status: 'playing' }));
        setCurrentPhase('playing');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  };

  const handleLeaveRoom = async () => {
    if (isTeacher) {
      // Teacher can just navigate directly
      navigate('/teacher/dashboard');
    } else {
      // Student needs to call API to leave room
      try {
        const response = await gameRoomService.leaveRoom(roomCode);
        if (response.status === 'success') {
          navigate('/student/dashboard');
        }
      } catch (error) {
        console.error('Error leaving room:', error);
        // Navigate anyway if API fails
        navigate('/student/dashboard');
      }
    }
  };

  const handleGameEnd = () => {
    setCurrentPhase('finished');
    // Game results will be shown in GameRoom component
  };

  // Phase transition overlay
  const PhaseTransition = ({ phase }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center text-white"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-8xl mb-6"
        >
          {phase === 'studying' ? '📚' : phase === 'playing' ? '🎮' : '🎯'}
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold mb-4"
        >
          {phase === 'studying' ? 'Memulai Fase Belajar!' : 
           phase === 'playing' ? 'Game Dimulai!' : 
           'Persiapan Selesai!'}
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl opacity-90"
        >
          {phase === 'studying' ? 'Bersiap untuk mempelajari materi...' : 
           phase === 'playing' ? 'Saatnya menguji kemampuan Anda!' : 
           'Menuju fase berikutnya...'}
        </motion.p>
      </motion.div>
    </motion.div>
  );

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mr-4"
        >
          <LoadingSpinner size="large" />
        </motion.div>
        <div className="text-lg text-gray-600">Memuat room...</div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50"
      >
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 0.5, repeat: 3 }}
            className="text-6xl mb-4"
          >
            ❌
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Room Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLeaveRoom}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Kembali ke Dashboard
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Phase Transition Overlay */}
      <AnimatePresence>
        {phaseTransition && (
          <PhaseTransition phase={phaseTransition} />
        )}
      </AnimatePresence>

      {/* Main Room Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {(() => {
            switch (currentPhase) {
              case 'waiting':
                return (
                  <WaitingRoom
                    room={room}
                    user={user}
                    isTeacher={isTeacher}
                    onStartStudying={handleStartStudying}
                    onLeaveRoom={handleLeaveRoom}
                    onRoomStatusChange={(newRoom) => {
                      setRoom(newRoom);
                      setCurrentPhase(newRoom.status);
                    }}
                  />
                );

              case 'studying':
                return (
                  <StudyPhase
                    room={room}
                    user={user}
                    isTeacher={isTeacher}
                    onStartGame={handleStartGame}
                    onLeaveRoom={handleLeaveRoom}
                    onRoomStatusChange={(newRoom) => {
                      setRoom(newRoom);
                      setCurrentPhase(newRoom.status);
                    }}
                  />
                );

              case 'playing':
              case 'finished':
                return (
                  <GameRoom
                    room={room}
                    user={user}
                    isTeacher={isTeacher}
                    onGameEnd={handleGameEnd}
                    onLeaveRoom={handleLeaveRoom}
                  />
                );

              default:
                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="text-6xl mb-4"
                      >
                        ⚠️
                      </motion.div>
                      <h1 className="text-2xl font-bold text-gray-800 mb-2">Status Room Tidak Dikenal</h1>
                      <p className="text-gray-600 mb-6">Status: {room?.status}</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLeaveRoom}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Kembali ke Dashboard
                      </motion.button>
                    </div>
                  </motion.div>
                );
            }
          })()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default RoomController;