import React from 'react';
import { motion } from 'motion/react';

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="mb-6">
      <nav className="flex space-x-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
};

export default TabNavigation;