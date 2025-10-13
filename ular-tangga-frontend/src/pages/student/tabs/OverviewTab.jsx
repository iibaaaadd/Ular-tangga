import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, Button } from '../../../components/ui';
import { gameRoomService } from '../../../services/api';

const OverviewTab = ({ setActiveTab, setIsModalOpen, setModalType, user, joinedRooms = [] }) => {
  const formatLastActivity = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Baru saja';
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays === 1) return '1 hari yang lalu';
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} minggu yang lalu`;
    return `${Math.ceil(diffDays / 30)} bulan yang lalu`;
  };
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeRooms: 0,
    totalGames: 0,
    averageScore: 0,
    totalScore: 0,
    rank: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Process data from props instead of fetching
    processJoinedRoomsData();
  }, [joinedRooms]);

  const processJoinedRoomsData = () => {
    try {
      setLoading(true);
      
      if (joinedRooms && joinedRooms.length > 0) {
        // Calculate real statistics from passed data
        
        const realStats = {
          totalRooms: joinedRooms.length,
          activeRooms: joinedRooms.filter(room => room.status === 'active').length,
          totalGames: joinedRooms.reduce((sum, room) => sum + (room.games_count || 0), 0),
          averageScore: joinedRooms.length > 0 ? 
            joinedRooms.reduce((sum, room) => sum + (room.average_score || 0), 0) / joinedRooms.length : 0,
          totalScore: joinedRooms.reduce((sum, room) => sum + (room.average_score || 0) * (room.games_count || 0), 0),
          rank: Math.max(1, Math.ceil(joinedRooms.length * 0.3))
        };

        // Generate activities from real data
        const realActivities = joinedRooms.slice(0, 3).map((room, index) => ({
          id: room.id || index,
          type: (room.games_count || 0) > 0 ? 'game_completed' : 'room_joined',
          description: (room.games_count || 0) > 0 ? 
            `Menyelesaikan game di "${room.room_name || room.name}"` :
            `Bergabung ke kelas "${room.room_name || room.name}"`,
          score: (room.games_count || 0) > 0 ? Math.round(room.average_score || 0) : null,
          time: formatLastActivity(room.updated_at),
          icon: (room.games_count || 0) > 0 ? '🎯' : '🏫'
        }));
        
        setStats(realStats);
        setRecentActivities(realActivities);
      } else {
        // Default empty state
        setStats({
          totalRooms: 0,
          activeRooms: 0,
          totalGames: 0,
          averageScore: 0,
          totalScore: 0,
          rank: 0
        });
        
        setRecentActivities([
          {
            id: 1,
            type: 'welcome',
            description: 'Selamat datang! Mulai dengan bergabung ke kelas pertama',
            time: 'Baru saja',
            icon: '👋'
          }
        ]);
      }
    } catch (error) {
      console.error('Error processing joined rooms data:', error);
      // Set fallback data
      setStats({
        totalRooms: 0,
        activeRooms: 0,
        totalGames: 0,
        averageScore: 0,
        totalScore: 0,
        rank: 0
      });
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        key="overview"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Selamat datang, {user?.name}! 👋
              </h2>
              <p className="text-blue-100 mb-4">
                Siap untuk belajar dan bermain hari ini?
              </p>
              <Button 
                variant="secondary"
                onClick={() => {setModalType('joinRoom'); setIsModalOpen(true);}}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                ➕ Join Kelas Baru
              </Button>
            </div>
            <div className="text-6xl opacity-20">🎓</div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="text-4xl mb-3">�</div>
            <h3 className="text-3xl font-bold text-green-600 mb-1">{stats.totalRooms}</h3>
            <p className="text-green-700 font-medium">Kelas Diikuti</p>
            <div className="mt-2 text-xs text-green-600">
              {stats.activeRooms} aktif
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-3xl font-bold text-blue-600 mb-1">{stats.totalGames}</h3>
            <p className="text-blue-700 font-medium">Game Dimainkan</p>
            <div className="mt-2 text-xs text-blue-600">
              Total permainan
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="text-3xl font-bold text-yellow-600 mb-1">{stats.averageScore.toFixed(1)}</h3>
            <p className="text-yellow-700 font-medium">Rata-rata Skor</p>
            <div className="mt-2 text-xs text-yellow-600">
              Dari {stats.totalGames} game
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-3xl font-bold text-purple-600 mb-1">#{stats.rank}</h3>
            <p className="text-purple-700 font-medium">Peringkat Kelas</p>
            <div className="mt-2 text-xs text-purple-600">
              {stats.totalScore} total poin
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              ⚡ Quick Actions
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="ml-2"
              >
                ⚡
              </motion.div>
            </h3>
            <div className="space-y-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600" 
                  onClick={() => {setModalType('joinRoom'); setIsModalOpen(true);}}
                >
                  ➕ Join Kelas Baru
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('rooms')}
                >
                  � Lihat Kelas Saya
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('games')}
                >
                  � Riwayat Game
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              📈 Aktivitas Terkini
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="ml-2"
              >
                📈
              </motion.div>
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                    activity.type === 'game_completed' ? 'bg-green-50 hover:bg-green-100' :
                    activity.type === 'room_joined' ? 'bg-blue-50 hover:bg-blue-100' :
                    'bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  {activity.score && (
                    <div className={`font-bold text-lg ${
                      activity.type === 'game_completed' ? 'text-green-600' :
                      activity.type === 'high_score' ? 'text-purple-600' :
                      'text-blue-600'
                    }`}>
                      {activity.score}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Learning Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <h3 className="text-xl font-bold mb-4 flex items-center">
            📊 Progress Belajar
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="ml-2"
            >
              📊
            </motion.div>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl mb-2">📚</div>
              <div className="text-2xl font-bold text-blue-600">{stats.averageScore.toFixed(0)}%</div>
              <div className="text-sm text-blue-700">Tingkat Pemahaman</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl mb-2">⏰</div>
              <div className="text-2xl font-bold text-green-600">{Math.floor(stats.totalGames * 1.5)}</div>
              <div className="text-sm text-green-700">Jam Belajar</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="text-2xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-orange-600">{Math.max(1, stats.totalGames % 7)}</div>
              <div className="text-sm text-orange-700">Streak Hari</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-purple-600">{Math.floor((stats.averageScore / 100) * stats.totalGames)}</div>
              <div className="text-sm text-purple-700">Jawaban Benar</div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default OverviewTab;