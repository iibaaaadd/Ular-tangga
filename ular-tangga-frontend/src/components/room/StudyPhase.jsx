import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Button } from '../ui';
import { gameRoomService } from '../../services/api';

const StudyPhase = ({ 
  room, 
  user, 
  isTeacher, 
  onStartGame, 
  onLeaveRoom,
  onRoomStatusChange 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [participants, setParticipants] = useState(room?.participants || []);
  const [isReady, setIsReady] = useState(false);
  const [readyCount, setReadyCount] = useState(0);
  const [allReady, setAllReady] = useState(false);

  // Polling function untuk update ready status dan room data
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
          
          // Check room status change
          if (room.status !== newRoom.status && onRoomStatusChange) {
            onRoomStatusChange(newRoom);
          }

          // Update participants and ready status
          setParticipants(newRoom.participants || []);
          let readyCounter = 0;
          
          newRoom.participants?.forEach(participant => {
            if (participant.is_ready) {
              readyCounter++;
            }
          });
          
          setReadyCount(readyCounter);
          setAllReady(readyCounter === newRoom.participants?.length && readyCounter > 0);
          
          // Update current user ready status
          const currentUserParticipant = newRoom.participants?.find(
            p => p.student_id === user.id
          );
          if (currentUserParticipant && !isTeacher) {
            setIsReady(currentUserParticipant.is_ready);
          }
        }
      }
    } catch (error) {
      console.error('Error polling room data:', error);
    }
  }, [room?.room_code, room?.status, user?.id, isTeacher, onRoomStatusChange]);

  // Setup polling
  useEffect(() => {
    if (!room?.room_code) return;
    
    // Initial poll
    pollRoomData();
    
    // Poll every 2 seconds
    const interval = setInterval(pollRoomData, 2000);
    
    return () => clearInterval(interval);
  }, [pollRoomData]);

  // Handle toggle ready status for students
  const handleToggleReady = async () => {
    if (isTeacher) return;
    
    setIsLoading(true);
    try {
      const newReadyStatus = !isReady;
      const response = await gameRoomService.updateParticipantReady(room.room_code, newReadyStatus);
      
      if (response.status === 'success') {
        setIsReady(newReadyStatus);
      } else {
        alert(response.message || 'Gagal mengupdate status siap');
      }
    } catch (error) {
      console.error('Error updating ready status:', error);
      alert('Gagal mengupdate status siap');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle start game for teacher
  const handleStartGame = async () => {
    if (!isTeacher || !allReady) return;
    
    setIsLoading(true);
    try {
      await onStartGame();
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Gagal memulai game');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-3xl"
                  >
                    📚
                  </motion.div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Fase Belajar
                  </h1>
                </div>
                
                <div className="text-gray-600 space-y-1">
                  <p><span className="font-semibold">Kode Ruang:</span> {room?.room_code}</p>
                  <p><span className="font-semibold">Materi:</span> {room?.material?.title}</p>
                  <p><span className="font-semibold">Status:</span> 
                    <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      Belajar
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-2">
                  {isTeacher ? '👨‍🏫 Guru' : '👨‍🎓 Murid'}
                </div>
                <div className="text-sm font-medium">
                  <span className="text-green-600">{readyCount}</span> / {participants.length} siap
                  {allReady && (
                    <span className="ml-2 text-green-600 animate-pulse">✅ Semua Siap!</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* PDF Viewer Area */}
          <div className="lg:col-span-3">
            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="mr-2">📄</span>
                  Materi Pembelajaran
                </h2>
                <Button 
                  variant="outline" 
                  onClick={onLeaveRoom}
                  className="text-sm"
                >
                  🚪 Keluar
                </Button>
              </div>
              
              {/* PDF Viewer */}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                {room?.material?.pdf_path ? (
                  <iframe
                    src={`http://127.0.0.1:8000/storage/${room.material.pdf_path}`}
                    className="w-full h-[600px]"
                    title="Material PDF"
                  />
                ) : (
                  <div className="h-[600px] flex flex-col items-center justify-center text-gray-500">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      📄
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">Materi belum tersedia</h3>
                    <p className="text-center max-w-md mb-6">
                      File PDF materi belum diupload atau tidak ditemukan. 
                      Silakan hubungi guru untuk informasi lebih lanjut.
                    </p>
                    
                    {/* Fallback content */}
                    <div className="mt-4 p-6 bg-white rounded-lg border-2 border-gray-200 max-w-2xl">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">
                        {room?.material?.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {room?.material?.description || 'Tidak ada deskripsi materi.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Ready Status Panel */}
          <div className="space-y-6">
            {/* Participants Status */}
            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">👥</span>
                Status Peserta
              </h3>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                <AnimatePresence>
                  {participants.map(participant => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        participant.is_ready ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      } border`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          participant.is_ready ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          {(participant.student?.name || participant.name)?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {participant.student?.name || participant.name}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-lg">
                        {participant.is_ready ? '✅' : '⏳'}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress Kesiapan</span>
                  <span>{readyCount}/{participants.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: participants.length > 0 ? `${(readyCount / participants.length) * 100}%` : '0%'
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </Card>

            {/* Action Panel */}
            {isTeacher ? (
              <Card className="p-6 bg-white/90 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🎛️ Kontrol Guru</h3>
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: allReady ? 1.02 : 1 }}
                    whileTap={{ scale: allReady ? 0.98 : 1 }}
                  >
                    <Button 
                      className={`w-full py-4 text-lg font-semibold transition-all ${
                        allReady 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                      onClick={handleStartGame}
                      disabled={!allReady || isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Memulai Game...</span>
                        </div>
                      ) : allReady ? (
                        <>🎮 Mulai Game</>
                      ) : (
                        <>⏳ Tunggu Semua Siap</>
                      )}
                    </Button>
                  </motion.div>
                  
                  {!allReady && (
                    <p className="text-xs text-gray-500 text-center">
                      Semua peserta harus siap untuk memulai game
                    </p>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-6 bg-white/90 backdrop-blur-sm text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🎓 Aksi Murid</h3>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mb-6"
                >
                  <Button 
                    className={`w-full py-4 text-lg font-semibold transition-all ${
                      isReady 
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                    onClick={handleToggleReady}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Mengupdate...</span>
                      </div>
                    ) : isReady ? (
                      <>✅ Saya Sudah Siap!</>
                    ) : (
                      <>🙋‍♂️ Tandai Siap</>
                    )}
                  </Button>
                </motion.div>

                <div className="text-sm text-gray-600">
                  {isReady ? (
                    <div className="text-green-600 font-medium">
                      ✨ Anda sudah siap! Tunggu teman-teman yang lain.
                    </div>
                  ) : (
                    <div>
                      Klik tombol di atas jika sudah selesai belajar dan siap untuk game!
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPhase;