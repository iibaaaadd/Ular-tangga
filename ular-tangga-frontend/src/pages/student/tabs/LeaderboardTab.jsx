import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../components/ui';

const LeaderboardTab = ({ leaderboard = [] }) => {
  return (
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

        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Leaderboard kosong</h3>
            <p className="text-gray-500">Belum ada data peringkat. Mulai bermain untuk masuk ke leaderboard!</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default LeaderboardTab;