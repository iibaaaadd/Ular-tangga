import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../components/ui';

const GamesTab = ({ recentGames = [] }) => {
  const getGameIcon = (gameType) => {
    switch(gameType) {
      case 'Ular Tangga': return '🐍';
      case 'Quiz Battle': return '⚡';
      default: return '🎮';
    }
  };

  const getGameTypeColor = (gameType) => {
    switch(gameType) {
      case 'Ular Tangga': return 'bg-green-100 text-green-800';
      case 'Quiz Battle': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      key="games"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🎮 Aktivitas Game</h2>
        
        {recentGames.length > 0 ? (
          <div className="space-y-4">
            {recentGames.map((game) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">
                    {getGameIcon(game.gameType)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{game.roomName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGameTypeColor(game.gameType)}`}>
                        {game.gameType}
                      </span>
                      <span className="text-sm text-gray-600">
                        👥 {game.players} pemain
                      </span>
                      <span className="text-sm text-gray-600">
                        ⏱️ {game.duration}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    🏆 {game.winner}
                  </div>
                  <div className="text-sm text-gray-500">
                    {game.completedAt}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada aktivitas game</h3>
            <p className="text-gray-500">Game yang dimainkan siswa akan muncul di sini</p>
          </div>
        )}

        {/* Game Statistics */}
        {recentGames.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center" hoverable={false}>
              <div className="text-2xl mb-2">🎮</div>
              <h4 className="text-lg font-bold text-gray-900">
                {recentGames.length}
              </h4>
              <p className="text-gray-600">Total Game</p>
            </Card>
            <Card className="text-center" hoverable={false}>
              <div className="text-2xl mb-2">🐍</div>
              <h4 className="text-lg font-bold text-gray-900">
                {recentGames.filter(g => g.gameType === 'Ular Tangga').length}
              </h4>
              <p className="text-gray-600">Ular Tangga</p>
            </Card>
            <Card className="text-center" hoverable={false}>
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="text-lg font-bold text-gray-900">
                {recentGames.filter(g => g.gameType === 'Quiz Battle').length}
              </h4>
              <p className="text-gray-600">Quiz Battle</p>
            </Card>
            <Card className="text-center" hoverable={false}>
              <div className="text-2xl mb-2">👥</div>
              <h4 className="text-lg font-bold text-gray-900">
                {Math.round(recentGames.reduce((sum, g) => sum + g.players, 0) / recentGames.length)}
              </h4>
              <p className="text-gray-600">Avg Pemain</p>
            </Card>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default GamesTab;