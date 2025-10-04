import React from 'react';
import { motion } from 'motion/react';
import { Card, Button } from '../../../components/ui';

const OverviewTab = ({ setActiveTab, rooms = [], recentGames = [] }) => {
  const activeRooms = rooms.filter(room => room.status === 'active').length;
  const totalStudents = rooms.reduce((sum, room) => sum + room.students, 0);
  const totalGames = recentGames.length;

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="text-center" hoverable={false}>
          <div className="text-3xl mb-2">🏫</div>
          <h3 className="text-2xl font-bold text-gray-900">{activeRooms}</h3>
          <p className="text-gray-600">Kelas Aktif</p>
        </Card>
        <Card className="text-center" hoverable={false}>
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-2xl font-bold text-gray-900">{totalStudents}</h3>
          <p className="text-gray-600">Total Siswa</p>
        </Card>
        <Card className="text-center" hoverable={false}>
          <div className="text-3xl mb-2">🎮</div>
          <h3 className="text-2xl font-bold text-gray-900">{totalGames}</h3>
          <p className="text-gray-600">Game Dimainkan</p>
        </Card>
        <Card className="text-center" hoverable={false}>
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-2xl font-bold text-gray-900">85%</h3>
          <p className="text-gray-600">Rata-rata Nilai</p>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-xl font-bold mb-4">⚡ Quick Actions</h3>
          <div className="space-y-3">
            <Button 
              className="w-full justify-start" 
              onClick={() => setActiveTab('rooms')}
            >
              ➕ Buat Kelas Baru
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => setActiveTab('rooms')}
            >
              🏫 Kelola Kelas
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => setActiveTab('games')}
            >
              🎮 Lihat Game Activity
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold mb-4">📈 Statistik Minggu Ini</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Game Dimainkan</span>
              <span className="font-bold text-green-600">{recentGames.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Siswa Aktif</span>
              <span className="font-bold text-blue-600">{totalStudents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Kelas Aktif</span>
              <span className="font-bold text-purple-600">{activeRooms}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-bold text-orange-600">85% 📊</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Games */}
      <Card>
        <h3 className="text-xl font-bold mb-4">🎮 Recent Game Activity</h3>
        <div className="space-y-3">
          {recentGames.slice(0, 5).map((game) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">
                  {game.gameType === 'Ular Tangga' ? '🐍' : '⚡'}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{game.roomName}</h4>
                  <p className="text-sm text-gray-600">{game.gameType} • {game.players} pemain • {game.duration}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">
                  🏆 {game.winner}
                </div>
                <div className="text-xs text-gray-500">
                  {game.completedAt}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {recentGames.length > 5 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="small" onClick={() => setActiveTab('games')}>
              Lihat Semua Game
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default OverviewTab;