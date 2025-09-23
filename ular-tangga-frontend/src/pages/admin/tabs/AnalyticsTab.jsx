import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../components/ui';

const AnalyticsTab = () => {
  return (
    <motion.div
      key="analytics"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <Card>
        <h3 className="text-xl font-bold mb-4">📈 User Growth</h3>
        <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-gray-500">Chart akan ditambahkan di sini</p>
        </div>
      </Card>
      <Card>
        <h3 className="text-xl font-bold mb-4">🎯 Question Performance</h3>
        <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-gray-500">Chart akan ditambahkan di sini</p>
        </div>
      </Card>
    </motion.div>
  );
};

export default AnalyticsTab;