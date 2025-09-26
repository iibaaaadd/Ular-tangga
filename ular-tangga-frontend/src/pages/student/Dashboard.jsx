import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Modal, Input, Button } from '../../components/ui';
import { DashboardHeader, TabNavigation, TabContent } from './index';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'rooms', label: 'Kelas Saya', icon: '🏫' },
    { id: 'games', label: 'Riwayat Game', icon: '🎮' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'achievements', label: 'Achievement', icon: '🏅' }
  ];

  const handleJoinRoom = () => {
    console.log('Joining room with code:', roomCode);
    setIsModalOpen(false);
    setRoomCode('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 w-full overflow-x-hidden">
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
              setIsModalOpen={setIsModalOpen}
              setModalType={setModalType}
            />

            <Modal
              isOpen={isModalOpen && modalType === 'joinRoom'}
              onClose={() => setIsModalOpen(false)}
              title="Join Kelas Baru"
              footer={
                <>
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleJoinRoom} disabled={!roomCode.trim()}>
                    Join Kelas
                  </Button>
                </>
              }
            >
              <div className="space-y-4">
                <Input 
                  label="Kode Kelas" 
                  placeholder="Masukkan kode kelas dari guru Anda"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  icon="🔑"
                />
                <div className="text-sm text-gray-600">
                  💡 <strong>Tips:</strong> Dapatkan kode kelas dari guru Anda untuk bergabung ke dalam kelas.
                </div>
              </div>
            </Modal>
          </motion.div>
        </div>
      </div>
  );
};

export default StudentDashboard;