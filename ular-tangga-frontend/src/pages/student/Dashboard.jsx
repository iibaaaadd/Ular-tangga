import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Modal, Input, Button } from '../../components/ui';
import { DashboardHeader, TabNavigation, TabContent } from './index';
import { gameRoomService } from '../../services/api';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'rooms', label: 'Kelas Saya', icon: '🏫' },
    { id: 'games', label: 'Riwayat Game', icon: '🎮' }
  ];

  // Fetch student data on component mount
  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch real data, but don't break if it fails
      const roomsResponse = await gameRoomService.getStudentRooms();
      if (roomsResponse.status === 'success') {
        setJoinedRooms(roomsResponse.data || []);
      } else {
        console.warn('API returned non-success status:', roomsResponse);
        // Use some demo data for now
        setJoinedRooms([
          {
            id: 1,
            room_name: 'Demo - Matematika Dasar',
            room_code: 'DEMO01',
            status: 'active',
            description: 'Kelas demo matematika untuk pemahaman konsep dasar',
            teacher: { name: 'Bu Sarah (Demo)' },
            participants_count: 25,
            games_count: 8,
            average_score: 87.5,
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            room_name: 'Demo - Bahasa Indonesia',
            room_code: 'DEMO02',
            status: 'active',
            description: 'Kelas demo bahasa Indonesia',
            teacher: { name: 'Pak Ahmad (Demo)' },
            participants_count: 30,
            games_count: 5,
            average_score: 82.3,
            updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
          }
        ]);
      }
    } catch (error) {
      console.error('Critical error in fetchStudentData:', error);
      setJoinedRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) return;

    try {
      // Show joining animation by temporarily updating modal title
      const modal = document.querySelector('[role="dialog"] h2');
      if (modal) modal.textContent = 'Bergabung ke kelas...';
      
      const response = await gameRoomService.joinRoom(roomCode);
      if (response.status === 'success') {
        setIsModalOpen(false);
        setRoomCode('');
        
        // Refresh student data to show new room
        await fetchStudentData();
        
        // Navigate to room after data refresh
        setTimeout(() => {
          navigate(`/room/${roomCode}`);
        }, 500);
      } else if (response.message && response.message.includes('already in this room')) {
        // Student sudah join, langsung navigate ke room
        setIsModalOpen(false);
        setRoomCode('');
        
        // Show success message
        const successAlert = document.createElement('div');
        successAlert.textContent = 'Anda sudah tergabung di kelas ini. Menuju ke ruangan...';
        successAlert.style.cssText = `
          position: fixed; top: 20px; right: 20px; z-index: 9999;
          background: #10b981; color: white; padding: 12px 20px;
          border-radius: 8px; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(successAlert);
        setTimeout(() => successAlert.remove(), 3000);
        
        navigate(`/room/${roomCode}`);
      } else {
        throw new Error(response.message || 'Failed to join room');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      
      // Check if error is "already in room"
      if (error.message && error.message.includes('already in this room')) {
        // Student sudah join, langsung navigate ke room
        setIsModalOpen(false);
        setRoomCode('');
        
        // Show success message
        const successAlert = document.createElement('div');
        successAlert.textContent = 'Anda sudah tergabung di kelas ini. Menuju ke ruangan...';
        successAlert.style.cssText = `
          position: fixed; top: 20px; right: 20px; z-index: 9999;
          background: #10b981; color: white; padding: 12px 20px;
          border-radius: 8px; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(successAlert);
        setTimeout(() => successAlert.remove(), 3000);
        
        navigate(`/room/${roomCode}`);
        return;
      }
      
      alert(error.message || 'Gagal bergabung ke room');
      
      // Reset modal title on error
      const modal = document.querySelector('[role="dialog"] h2');
      if (modal) modal.textContent = 'Join Kelas Baru';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            📚
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard...</h2>
          <p className="text-gray-500 mt-2">Memuat data kelas Anda</p>
        </motion.div>
      </div>
    );
  }

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
              joinedRooms={joinedRooms}
              user={user}
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