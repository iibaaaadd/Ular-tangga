import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../components/ui';

const GamesTab = ({ gameHistory = [] }) => {
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
    <motion.div
      key="games"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🎮 Riwayat Game</h2>
        
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

        {gameHistory.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada riwayat game</h3>
            <p className="text-gray-500">Mainkan game pertama Anda untuk melihat riwayat di sini!</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default GamesTab;