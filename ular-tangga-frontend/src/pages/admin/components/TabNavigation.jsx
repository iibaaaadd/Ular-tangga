import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '../../../components/ui';

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="mb-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-2">
        <nav className="flex gap-2">
          {tabs.map((tab) => {
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white/70 hover:text-purple-600 hover:shadow-md'
                }`}
              >
                <Icon name={tab.icon} className="w-4 h-4" />
                {tab.label}
              </motion.button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default TabNavigation;