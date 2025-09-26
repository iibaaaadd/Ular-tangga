import React from 'react';
import { motion } from 'motion/react';

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="mb-6">
      <nav className="flex space-x-2 overflow-x-auto">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-lg'
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </motion.button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;