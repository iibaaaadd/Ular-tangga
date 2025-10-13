import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../../../components/ui';

const DashboardHeader = ({ user, logout }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            👩‍🏫 Teacher Dashboard
          </h1>
          <p className="text-gray-600">Kelola kelas dan monitor progress siswa Anda dengan mudah</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Selamat datang,</p>
            <p className="font-semibold text-gray-900">{user?.name}</p>
          </div>
          <Button 
            variant="outline" 
            size="small"
            onClick={logout}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            🚪 Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;