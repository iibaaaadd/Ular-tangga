import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { UsersIcon, ChartBarIcon, QuestionMarkCircleIcon, TrendingUpIcon, ConfirmProvider } from '../../components/ui';
import { DashboardHeader, TabNavigation, TabContent } from './index';
import { userService } from '../../services/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [totalUsers, setTotalUsers] = useState(0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'questions', label: 'Bank Soal', icon: QuestionMarkCircleIcon },
    { id: 'analytics', label: 'Analytics', icon: TrendingUpIcon }
  ];

  // Load initial data for overview
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await userService.getUsers(1, 10);
        setTotalUsers(response.pagination?.total || 0);
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };

    loadInitialData();
  }, []);

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
              totalUsers={totalUsers}
            />
          </motion.div>
        </div>
      </div>
    </ConfirmProvider>
  );
};

export default AdminDashboard;