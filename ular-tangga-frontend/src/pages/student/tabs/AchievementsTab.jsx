import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../components/ui';

const AchievementsTab = ({ achievements = [] }) => {
  return (
    <motion.div
      key="achievements"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🏅 Achievements</h2>
          <div className="text-sm text-gray-600">
            {achievements.filter(a => a.earned).length}/{achievements.length} terbuka
          </div>
        </div>
        
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

        {achievements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏅</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada achievements</h3>
            <p className="text-gray-500">Mulai bermain untuk mendapatkan achievement pertama Anda!</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default AchievementsTab;