import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Modal, Input, Button, Select } from '../../components/ui';
import { DashboardHeader, TabNavigation, TabContent } from './index';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'rooms', label: 'Kelas Saya', icon: '🏫' },
    { id: 'questions', label: 'Bank Soal', icon: '📝' },
    { id: 'games', label: 'Aktivitas Game', icon: '🎮' }
  ];

  const handleCreateRoom = () => {
    // Handle create room logic
    console.log('Creating new room...');
    setIsModalOpen(false);
  };

  const handleCreateQuestion = () => {
    // Handle create question logic
    console.log('Creating new question...');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 w-full overflow-x-hidden">
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

            {/* Create Room Modal */}
            <Modal
              isOpen={isModalOpen && modalType === 'room'}
              onClose={() => setIsModalOpen(false)}
              title="Buat Kelas Baru"
              footer={
                <>
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleCreateRoom}>
                    Buat Kelas
                  </Button>
                </>
              }
            >
              <div className="space-y-4">
                <Input 
                  label="Nama Kelas" 
                  placeholder="Contoh: Kelas 7A - Matematik a"
                />
                <Select
                  label="Tipe Game"
                  options={[
                    { value: 'ular_tangga', label: '🐍 Ular Tangga' },
                    { value: 'quiz_battle', label: '⚡ Quiz Battle' }
                  ]}
                />
                <Input 
                  label="Deskripsi (Opsional)" 
                  placeholder="Deskripsi singkat tentang kelas"
                />
              </div>
            </Modal>

            {/* Create Question Modal */}
            <Modal
              isOpen={isModalOpen && modalType === 'question'}
              onClose={() => setIsModalOpen(false)}
              title="Tambah Soal Baru"
              footer={
                <>
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleCreateQuestion}>
                    Tambah Soal
                  </Button>
                </>
              }
            >
              <div className="space-y-4">
                <Input 
                  label="Pertanyaan" 
                  placeholder="Masukkan pertanyaan Anda"
                />
                <Select
                  label="Tipe Soal"
                  options={[
                    { value: 'multiple_choice', label: '🔘 Multiple Choice' },
                    { value: 'true_false', label: '✅ True/False' },
                    { value: 'essay', label: '📝 Essay' }
                  ]}
                />
                <Select
                  label="Kategori"
                  options={[
                    { value: 'mathematics', label: '🔢 Matematika' },
                    { value: 'science', label: '🔬 IPA' },
                    { value: 'language', label: '📚 Bahasa' },
                    { value: 'social', label: '🌍 IPS' }
                  ]}
                />
              </div>
            </Modal>
          </motion.div>
        </div>
      </div>
  );
};

export default TeacherDashboard;