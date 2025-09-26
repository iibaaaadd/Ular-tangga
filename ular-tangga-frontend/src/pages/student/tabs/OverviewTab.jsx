import React from 'react';
import { motion } from 'motion/react';
import { Card, Button } from '../../../components/ui';

const OverviewTab = ({ setActiveTab, setIsModalOpen, setModalType, achievements = [] }) => {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="text-center" hoverable={false}>
          <div className="text-3xl mb-2">🎮</div>
          <h3 className="text-2xl font-bold text-gray-900">14</h3>
          <p className="text-gray-600">Game Dimainkan</p>
        </Card>
        <Card className="text-center" hoverable={false}>
          <div className="text-3xl mb-2">⭐</div>
          <h3 className="text-2xl font-bold text-gray-900">84.3</h3>
          <p className="text-gray-600">Rata-rata Skor</p>
        </Card>
        <Card className="text-center" hoverable={false}>
          <div className="text-3xl mb-2">💯</div>
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
  );
};

export default OverviewTab;