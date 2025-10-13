import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { ConfirmProvider } from '../../components/ui';
import { DashboardHeader, TabNavigation, TabContent } from './index';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: 'chart' },
    { id: 'rooms', label: 'Kelas Saya', icon: 'users' },
    { id: 'games', label: 'Aktivitas Game', icon: 'gamepad2' }
  ];

  return (
    <ConfirmProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 w-full overflow-x-hidden">
        <div className="p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <DashboardHeader user={user} logout={logout} />
            
            <TabNavigation 
              tabs={tabs} 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />
            
            <TabContent 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </motion.div>
        </div>
      </div>
    </ConfirmProvider>
  );
};

export default TeacherDashboard;