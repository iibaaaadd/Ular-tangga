import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Modal, Input } from '../../components/ui';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'joinRoom', 'gameHistory'
  const [roomCode, setRoomCode] = useState('');

  // Mock data - nanti akan diganti dengan API calls
  const [joinedRooms] = useState([
    { id: 1, name: 'Kelas 7A - Matematika', teacher: 'Bu Sari', code: 'K7A001', status: 'active', lastActivity: '2 jam lalu' },
    { id: 2, name: 'Kelas 7A - IPA', teacher: 'Pak Budi', code: 'K7A002', status: 'active', lastActivity: '1 hari lalu' },
    { id: 3, name: 'Kelas 7A - Bahasa', teacher: 'Bu Ani', code: 'K7A003', status: 'completed', lastActivity: '3 hari lalu' }
  ]);

  const [gameHistory] = useState([
    { id: 1, roomName: 'Kelas 7A - Matematika', gameType: 'Ular Tangga', score: 85, rank: 2, totalPlayers: 4, completedAt: '2024-01-22 10:30', status: 'completed' },
    { id: 2, roomName: 'Kelas 7A - IPA', gameType: 'Quiz Battle', score: 92, rank: 1, totalPlayers: 3, completedAt: '2024-01-21 14:15', status: 'completed' },
    { id: 3, roomName: 'Kelas 7A - Bahasa', gameType: 'Ular Tangga', score: 76, rank: 3, totalPlayers: 4, completedAt: '2024-01-20 09:45', status: 'completed' }
  ]);

  const [leaderboard] = useState([
    { rank: 1, name: 'Ahmad Ridwan', totalScore: 2450, gamesPlayed: 18, avatar: '🏆' },
    { rank: 2, name: 'Siti Nurhaliza', totalScore: 2380, gamesPlayed: 16, avatar: '🥈' },
    { rank: 3, name: 'Budi Santoso', totalScore: 2290, gamesPlayed: 15, avatar: '🥉' },
    { rank: 4, name: 'Anda', totalScore: 2180, gamesPlayed: 14, avatar: '👨‍🎓', isCurrentUser: true },
    { rank: 5, name: 'Lisa Permata', totalScore: 2150, gamesPlayed: 13, avatar: '📚' }
  ]);

  const [achievements] = useState([
    { id: 1, title: 'First Winner', description: 'Menang untuk pertama kali', icon: '🏆', earned: true, earnedAt: '2024-01-15' },
    { id: 2, title: 'Speed Demon', description: 'Selesaikan game dalam < 10 menit', icon: '⚡', earned: true, earnedAt: '2024-01-18' },
    { id: 3, title: 'Perfect Score', description: 'Dapatkan skor 100', icon: '💯', earned: false },
    { id: 4, title: 'Consistent Player', description: 'Main 10 game berturut-turut', icon: '🎯', earned: true, earnedAt: '2024-01-20' },
    { id: 5, title: 'Helper', description: 'Bantu teman menyelesaikan soal', icon: '🤝', earned: false },
    { id: 6, title: 'Marathon Player', description: 'Main selama 2 jam non-stop', icon: '🏃', earned: false }
  ]);

  const handleJoinRoom = () => {
    console.log('Joining room with code:', roomCode);
    // API call untuk join room
    setIsModalOpen(false);
    setRoomCode('');
  };

  const tabs = [
    { id: 'overview', label: '📊 Dashboard', icon: '📊' },
    { id: 'rooms', label: '🏫 Kelas Saya', icon: '🏫' },
    { id: 'games', label: '🎮 Riwayat Game', icon: '🎮' },
    { id: 'leaderboard', label: '🏆 Leaderboard', icon: '🏆' },
    { id: 'achievements', label: '🏅 Achievement', icon: '🏅' }
  ];

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '📍';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 w-full overflow-x-hidden">
      <div className="p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                👨‍🎓 Student Dashboard
              </h1>
              <p className="text-gray-600">Selamat datang kembali! Siap untuk belajar sambil bermain?</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Selamat datang,</p>
                <p className="font-semibold text-gray-900">{user?.name}</p>
              </div>
              <Button 
                variant="outline" 
                size="small"
                onClick={logout}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                🚪 Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="text-center" hoverable={false}>
                <div className="text-3xl mb-2">🏫</div>
                <h3 className="text-2xl font-bold text-gray-900">{joinedRooms.length}</h3>
                <p className="text-gray-600">Kelas Bergabung</p>
              </Card>
              <Card className="text-center" hoverable={false}>
                <div className="text-3xl mb-2">🎮</div>
                <h3 className="text-2xl font-bold text-gray-900">{gameHistory.length}</h3>
                <p className="text-gray-600">Game Selesai</p>
              </Card>
              <Card className="text-center" hoverable={false}>
                <div className="text-3xl mb-2">⭐</div>
                <h3 className="text-2xl font-bold text-gray-900">2180</h3>
                <p className="text-gray-600">Total Skor</p>
              </Card>
              <Card className="text-center" hoverable={false}>
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="text-2xl font-bold text-gray-900">#4</h3>
                <p className="text-gray-600">Peringkat Global</p>
              </Card>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <h3 className="text-xl font-bold mb-4">⚡ Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    onClick={() => {setModalType('joinRoom'); setIsModalOpen(true);}}
                  >
                    ➕ Join Kelas Baru
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('rooms')}
                  >
                    🎮 Mulai Game
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('leaderboard')}
                  >
                    🏆 Lihat Ranking
                  </Button>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-bold mb-4">📈 Progress Minggu Ini</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rata-rata Skor</span>
                    <span className="font-bold text-green-600">84.3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Game Dimainkan</span>
                    <span className="font-bold text-blue-600">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Waktu Belajar</span>
                    <span className="font-bold text-purple-600">2.5 jam</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Streak Harian</span>
                    <span className="font-bold text-orange-600">7 hari 🔥</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Achievements */}
            <Card>
              <h3 className="text-xl font-bold mb-4">🏅 Recent Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {achievements.filter(a => a.earned).slice(0, 3).map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <div className="text-2xl mr-3">{achievement.icon}</div>
                    <div>
                      <h4 className="font-semibold text-yellow-800">{achievement.title}</h4>
                      <p className="text-sm text-yellow-600">{achievement.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'rooms' && (
          <motion.div
            key="rooms"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Kelas Saya</h2>
                <Button onClick={() => {setModalType('joinRoom'); setIsModalOpen(true);}}>
                  ➕ Join Kelas Baru
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedRooms.map((room) => (
                  <motion.div
                    key={room.id}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">{room.name}</h3>
                          <p className="text-gray-600 text-sm">👨‍🏫 {room.teacher}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          room.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {room.status === 'active' ? '✅ Aktif' : '✅ Selesai'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-4">
                        Kode: <span className="font-mono font-bold text-blue-600">{room.code}</span>
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-4">
                        Aktivitas terakhir: {room.lastActivity}
                      </div>
                      
                      {room.status === 'active' && (
                        <Button className="w-full" size="small">
                          🎮 Mulai Game
                        </Button>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'games' && (
          <motion.div
            key="games"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Game</h2>
              
              <div className="space-y-4">
                {gameHistory.map((game) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getRankIcon(game.rank)}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{game.roomName}</h3>
                        <p className="text-sm text-gray-600">{game.gameType} • {game.completedAt}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(game.score)}`}>
                        {game.score} poin
                      </div>
                      <div className="text-sm text-gray-500">
                        Peringkat {game.rank}/{game.totalPlayers}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🏆 Leaderboard Global</h2>
              
              <div className="space-y-3">
                {leaderboard.map((player) => (
                  <motion.div
                    key={player.rank}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: player.rank * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      player.isCurrentUser 
                        ? 'bg-blue-100 border-2 border-blue-300' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-gray-600 w-8">
                        #{player.rank}
                      </div>
                      <div className="text-2xl">{player.avatar}</div>
                      <div>
                        <h3 className={`font-semibold ${player.isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                          {player.name}
                          {player.isCurrentUser && <span className="ml-2 text-blue-600">(Anda)</span>}
                        </h3>
                        <p className="text-sm text-gray-600">{player.gamesPlayed} game dimainkan</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-purple-600">
                        {player.totalScore.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">Total Skor</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🏅 Achievements</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      achievement.earned 
                        ? 'bg-yellow-50 border-yellow-300 shadow-md' 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">{achievement.icon}</div>
                      <h3 className={`font-bold mb-2 ${
                        achievement.earned ? 'text-yellow-800' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm mb-3 ${
                        achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                      }`}>
                        {achievement.description}
                      </p>
                      {achievement.earned && achievement.earnedAt && (
                        <p className="text-xs text-yellow-500">
                          Diraih pada {achievement.earnedAt}
                        </p>
                      )}
                      {!achievement.earned && (
                        <p className="text-xs text-gray-400">
                          🔒 Belum terbuka
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Join Room Modal */}
        <Modal
          isOpen={isModalOpen && modalType === 'joinRoom'}
          onClose={() => setIsModalOpen(false)}
          title="Join Kelas Baru"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleJoinRoom} disabled={!roomCode.trim()}>
                Join Kelas
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input 
              label="Kode Kelas" 
              placeholder="Masukkan kode kelas dari guru Anda"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              icon="🔑"
            />
            <div className="text-sm text-gray-600">
              💡 <strong>Tips:</strong> Dapatkan kode kelas dari guru Anda untuk bergabung ke dalam kelas.
            </div>
          </div>
        </Modal>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;