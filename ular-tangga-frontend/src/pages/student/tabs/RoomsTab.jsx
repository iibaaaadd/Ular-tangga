import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../../../components/ui';
import { gameRoomService } from '../../../services/api';

const RoomsTab = ({ joinedRooms = [], setIsModalOpen, setModalType }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use passed data instead of fetching again
    if (joinedRooms && joinedRooms.length > 0) {
      processRoomsData(joinedRooms);
    } else {
      // Show empty state or fetch backup data
      setLoading(false);
      setRooms([]);
    }
  }, [joinedRooms]);

  const processRoomsData = (roomsData) => {
    const processedRooms = roomsData.map(room => ({
      id: room.id,
      name: room.room_name || room.name,
      code: room.room_code || room.code,
      teacher: room.teacher?.name || room.teacher || 'Unknown Teacher',
      status: room.status || 'active',
      lastActivity: formatLastActivity(room.updated_at || room.created_at),
      participantCount: room.participants_count || room.participant_count || 0,
      totalGames: room.games_count || 0,
      averageScore: room.average_score || 0,
      description: room.description || `Kelas ${room.room_name || room.name}`,
      material: room.material
    }));
    
    setRooms(processedRooms);
    setLoading(false);
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      
      // Fetch student's joined rooms from API
      const response = await gameRoomService.getStudentRooms();
      
      if (response.status === 'success' && response.data) {
        // Transform API data to expected format
        const transformedRooms = response.data.map(room => ({
          id: room.id,
          name: room.room_name || room.name,
          code: room.room_code || room.code,
          teacher: room.teacher?.name || room.teacher || 'Unknown Teacher',
          status: room.status || 'active',
          lastActivity: room.updated_at ? formatLastActivity(room.updated_at) : 'Tidak ada aktivitas',
          participantCount: room.participants_count || room.participant_count || 0,
          totalGames: room.games_count || 0,
          averageScore: room.average_score || 0,
          description: room.description || `Kelas ${room.room_name || room.name}`,
          material: room.material
        }));
        
        setRooms(transformedRooms);
      } else {
        // Fallback to mock data if API fails or no data
        console.log('Using fallback data for rooms');
        const mockRooms = [
          {
            id: 1,
            name: 'Matematika Dasar',
            code: 'MATH01',
            teacher: 'Bu Sarah',
            status: 'active',
            lastActivity: '2 jam yang lalu',
            participantCount: 25,
            totalGames: 8,
            averageScore: 87.5,
            description: 'Kelas matematika untuk pemahaman konsep dasar'
          }
        ];
        setRooms(mockRooms);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastActivity = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 hari yang lalu';
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} minggu yang lalu`;
    return `${Math.ceil(diffDays / 30)} bulan yang lalu`;
  };

  const handleEnterRoom = (roomCode) => {
    navigate(`/room/${roomCode}`);
  };

  const handleViewResults = (roomCode) => {
    navigate(`/room/${roomCode}`);
  };

  if (loading) {
    return (
      <motion.div
        key="rooms"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      key="rooms"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🏫 Kelas Saya</h2>
          <Button onClick={() => {setModalType('joinRoom'); setIsModalOpen(true);}}>
            ➕ Join Kelas Baru
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className={`cursor-pointer overflow-hidden bg-gradient-to-br ${
                room.status === 'active' 
                  ? 'from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100' 
                  : 'from-gray-50 to-gray-100 border-gray-200 hover:from-gray-100 hover:to-gray-200'
              }`}>
                <div className="relative">
                  {/* Status Badge */}
                  <div className="absolute top-0 right-0">
                    <span className={`px-3 py-1 rounded-bl-lg text-xs font-medium ${
                      room.status === 'active' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}>
                      {room.status === 'active' ? '🟢 Aktif' : '⭕ Selesai'}
                    </span>
                  </div>

                  {/* Room Header */}
                  <div className="pr-20 mb-4">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{room.name}</h3>
                    <p className="text-gray-600 flex items-center">
                      <span className="mr-2">👨‍🏫</span>
                      {room.teacher}
                    </p>
                  </div>
                  
                  {/* Room Code */}
                  <div className="flex items-center mb-4 p-2 bg-white/50 rounded-lg">
                    <span className="text-sm text-gray-600 mr-2">Kode Kelas:</span>
                    <span className="font-mono font-bold text-blue-600 text-lg">
                      {room.code}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {room.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-white/60 rounded-lg p-2">
                      <div className="text-lg font-bold text-blue-600">{room.participantCount}</div>
                      <div className="text-xs text-gray-600">Peserta</div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2">
                      <div className="text-lg font-bold text-purple-600">{room.totalGames}</div>
                      <div className="text-xs text-gray-600">Games</div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2">
                      <div className="text-lg font-bold text-green-600">{room.averageScore.toFixed(0)}%</div>
                      <div className="text-xs text-gray-600">Avg Score</div>
                    </div>
                  </div>
                  
                  {/* Last Activity */}
                  <div className="text-sm text-gray-500 mb-4 flex items-center">
                    <span className="mr-2">🕒</span>
                    Aktivitas terakhir: {room.lastActivity}
                  </div>
                  
                  {/* Action Button */}
                  <div className="flex gap-2">
                    {room.status === 'active' ? (
                      <>
                        <Button 
                          className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600" 
                          size="small"
                          onClick={() => handleEnterRoom(room.code)}
                        >
                          🎮 Masuk Room
                        </Button>
                        <Button 
                          variant="outline" 
                          size="small"
                          className="px-3"
                          onClick={() => handleViewResults(room.code)}
                        >
                          📊
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        size="small"
                        onClick={() => handleViewResults(room.code)}
                      >
                        📈 Lihat Hasil
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏫</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada kelas</h3>
            <p className="text-gray-500 mb-6">Gabung ke kelas pertama Anda untuk mulai belajar!</p>
            <Button onClick={() => {setModalType('joinRoom'); setIsModalOpen(true);}}>
              ➕ Join Kelas Pertama
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default RoomsTab;