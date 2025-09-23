import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../components/ui';

const OverviewTab = ({ totalUsers = 0 }) => {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      <Card className="text-center">
        <div className="text-3xl mb-2">👥</div>
        <h3 className="text-2xl font-bold text-gray-900">{totalUsers}</h3>
        <p className="text-gray-600">Total Users</p>
      </Card>
      <Card className="text-center">
        <div className="text-3xl mb-2">❓</div>
        <h3 className="text-2xl font-bold text-gray-900">-</h3>
        <p className="text-gray-600">Total Soal</p>
      </Card>
      <Card className="text-center">
        <div className="text-3xl mb-2">🎮</div>
        <h3 className="text-2xl font-bold text-gray-900">-</h3>
        <p className="text-gray-600">Game Aktif</p>
      </Card>
      <Card className="text-center">
        <div className="text-3xl mb-2">📊</div>
        <h3 className="text-2xl font-bold text-gray-900">-</h3>
        <p className="text-gray-600">Total Plays</p>
      </Card>
    </motion.div>
  );
};

export default OverviewTab;