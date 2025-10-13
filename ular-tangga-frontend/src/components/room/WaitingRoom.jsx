import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Button } from '../ui';
import echo from '../../services/echo';

const WaitingRoom = ({ 
  room, 
  user, 
  isTeacher, 
  onStartStudying, 
  onLeaveRoom,
  onRoomStatusChange
}) => {
  const [participants, setParticipants] = useState(room?.participants || []);
  const [roomData, setRoomData] = useState(room);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [newJoinNotification, setNewJoinNotification] = useState(null);
  const [participantCountUpdate, setParticipantCountUpdate] = useState(false);
  const [lastParticipantCount, setLastParticipantCount] = useState(room?.participants?.length || 0);
  const channelRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Polling function to refresh room data
  const pollRoomData = useCallback(async () => {
    if (!room?.room_code) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/game-rooms/${room.room_code}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          const newRoom = data.data;
          const newParticipants = newRoom.participants || [];
          const newCount = newParticipants.length;

          // Check if participant count changed
          if (newCount !== lastParticipantCount) {
            // Trigger participant count animation
            setParticipantCountUpdate(true);
            setTimeout(() => setParticipantCountUpdate(false), 1000);

            // Check if someone joined
            if (newCount > lastParticipantCount) {
              // Find new participants
              const newParticipant = newParticipants.find(p => 
                !participants.find(existing => existing.id === p.id)
              );
              
              if (newParticipant) {
                const participantName = newParticipant.student?.name || newParticipant.name || 'Someone';
                setNewJoinNotification({
                  name: participantName,
                  timestamp: Date.now()
                });
                setTimeout(() => setNewJoinNotification(null), 3000);
                showParticipantNotification(participantName, 'joined');
              }
            } else if (newCount < lastParticipantCount) {
              // Someone left
              showParticipantNotification('Seseorang', 'left');
            }

            setLastParticipantCount(newCount);
          }

          // Check if room status changed
          if (roomData?.status !== newRoom.status) {
            console.log('Room status changed from', roomData?.status, 'to', newRoom.status);
            // Notify parent about status change
            if (onRoomStatusChange) {
              onRoomStatusChange(newRoom);
            }
          }

          // Update room data and participants
          setRoomData(newRoom);
          setParticipants(newParticipants);
          setConnectionStatus('connected');
        }
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Error polling room data:', error);
      setConnectionStatus('disconnected');
    }
  }, [room?.room_code, lastParticipantCount, participants, roomData?.status, onRoomStatusChange]);

  // Setup polling interval
  useEffect(() => {
    if (!room?.room_code) return;

    // Initial poll
    pollRoomData();

    // Set up polling every 2 seconds
    pollIntervalRef.current = setInterval(pollRoomData, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [room?.room_code, pollRoomData]);

  // Connection status indicator
  useEffect(() => {
    setConnectionStatus('connected'); // Always show connected when using polling
  }, []);



  const showParticipantNotification = (name, action) => {
    // Create floating notification dengan animasi yang lebih menarik
    const notification = document.createElement('div');
    const isJoined = action === 'joined';
    
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${isJoined ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      z-index: 1000;
      transform: translateX(400px);
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 200px;
      backdrop-filter: blur(10px);
    `;
    
    notification.innerHTML = `
      <span style="font-size: 20px;">${isJoined ? '🎉' : '👋'}</span>
      <div>
        <div style="font-weight: 700;">${name}</div>
        <div style="font-size: 12px; opacity: 0.9;">
          ${isJoined ? 'bergabung ke ruangan!' : 'keluar dari ruangan'}
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Animate out
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 400);
    }, 3500);
  };

  const handleStartStudying = async () => {
    setIsLoading(true);
    try {
      await onStartStudying();
    } catch (error) {
      console.error('Error starting study:', error);
      alert('Gagal memulai fase belajar');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const ConnectionIndicator = () => (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${
        connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
        connectionStatus === 'connecting' ? 'bg-yellow-400 animate-spin' : 
        'bg-red-400'
      }`} />
      <span className={
        connectionStatus === 'connected' ? 'text-green-600' : 
        connectionStatus === 'connecting' ? 'text-yellow-600' : 
        'text-red-600'
      }>
        {connectionStatus === 'connected' ? 'Terhubung' : 
         connectionStatus === 'connecting' ? 'Menghubungkan...' : 
         'Terputus'}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              onClick={onLeaveRoom}
              className="flex items-center space-x-2"
            >
              <span>←</span>
              <span>Keluar</span>
            </Button>
            <ConnectionIndicator />
          </div>

          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-gray-800 mb-4"
            animate={{ 
              scale: [1, 1.05, 1],
              color: ['#1f2937', '#3b82f6', '#1f2937']
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🎯 Ruang Tunggu
          </motion.h1>
          
          <Card className="inline-block px-8 py-4 bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {roomData?.room_name}
              </h2>
              <div className="text-lg text-gray-600 mb-2">
                📚 {roomData?.material?.title}
              </div>
              <div className="text-2xl font-mono font-bold text-blue-600 bg-blue-100 px-4 py-2 rounded-lg">
                Kode: {roomData?.room_code}
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Participants List */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <motion.h3 
                  className="text-2xl font-bold text-gray-800"
                  animate={participantCountUpdate ? {
                    scale: [1, 1.2, 1],
                    color: ['#1f2937', '#10b981', '#1f2937']
                  } : {}}
                  transition={{ duration: 0.6 }}
                >
                  👥 Peserta ({participants.length}/{roomData?.max_participants})
                </motion.h3>
                <motion.div 
                  className="text-sm text-gray-500"
                  animate={participantCountUpdate ? {
                    scale: [1, 1.1, 1],
                    opacity: [1, 0.7, 1]
                  } : {}}
                  transition={{ duration: 0.6 }}
                >
                  {participants.length > 0 && 
                    `${Math.round((participants.length / (roomData?.max_participants || 1)) * 100)}% terisi`
                  }
                </motion.div>
              </div>

              {/* New Join Notification Banner */}
              <AnimatePresence>
                {newJoinNotification && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="mb-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-xl"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <motion.span
                        animate={{ rotate: [0, 20, -20, 0] }}
                        transition={{ duration: 0.5, repeat: 2 }}
                        className="text-2xl"
                      >
                        🎉
                      </motion.span>
                      <div className="text-center">
                        <div className="font-bold text-green-800">
                          {newJoinNotification.name} bergabung!
                        </div>
                        <div className="text-sm text-green-600">
                          Selamat datang di ruangan
                        </div>
                      </div>
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="text-2xl"
                      >
                        👋
                      </motion.span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence>
                  {participants.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5, y: -20 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.1 
                      }}
                      className="text-center"
                    >
                      <motion.div 
                        className={`w-16 h-16 ${getAvatarColor(participant.student?.name || participant.name)} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {(participant.student?.name || participant.name)?.charAt(0)?.toUpperCase()}
                      </motion.div>
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {participant.student?.name || participant.name}
                      </div>
                      <motion.div 
                        className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-1"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty slots animation */}
                {Array.from({ length: Math.max(0, 8 - participants.length) }).map((_, index) => (
                  <motion.div
                    key={`empty-${index}`}
                    className="text-center opacity-30"
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: index * 0.2 
                    }}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-dashed border-gray-300">
                      <span className="text-gray-400 text-2xl">👤</span>
                    </div>
                    <div className="text-xs text-gray-400">Menunggu...</div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Waiting Animation */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm text-center">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
                className="text-6xl mb-4"
              >
                ⏳
              </motion.div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Menunggu Peserta
              </h3>
              <p className="text-gray-600 text-sm">
                {isTeacher ? 
                  'Bagikan kode ruangan kepada murid-murid Anda' : 
                  'Menunggu guru memulai sesi belajar'
                }
              </p>
            </Card>

            {/* Room Info */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Info Ruangan</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Guru:</span>
                  <span className="font-medium">{roomData?.teacher?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Materi:</span>
                  <span className="font-medium">{roomData?.material?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Peserta:</span>
                  <span className="font-medium">{roomData?.max_participants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    ⏳ Menunggu
                  </span>
                </div>
              </div>
            </Card>

            {/* Teacher Controls */}
            {isTeacher && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🎛️ Kontrol Guru</h3>
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                      onClick={handleStartStudying}
                      disabled={participants.length === 0 || isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Memulai...</span>
                        </div>
                      ) : (
                        <>📚 Mulai Belajar</>
                      )}
                    </Button>
                  </motion.div>
                  
                  {participants.length === 0 && (
                    <p className="text-xs text-gray-500 text-center">
                      Minimal 1 peserta untuk memulai
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Student Waiting */}
            {!isTeacher && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl mb-4"
                >
                  🎒
                </motion.div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Siap Belajar!</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Tunggu guru memulai sesi belajar
                </p>
                
                <motion.div 
                  className="mb-6 flex justify-center space-x-1"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ 
                        duration: 1, 
                        repeat: Infinity,
                        delay: i * 0.2 
                      }}
                    />
                  ))}
                </motion.div>

                {/* Leave Room Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="outline"
                    className="w-full py-3 text-sm font-medium border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                    onClick={onLeaveRoom}
                  >
                    🚪 Keluar dari Ruangan
                  </Button>
                </motion.div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;