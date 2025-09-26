import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Modal, Input, Table } from '../../components/ui';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'room', 'assignment'
  const [selectedItem, setSelectedItem] = useState(null);

  // Mock data - nanti akan diganti dengan API calls
  const [rooms] = useState([
    { id: 1, name: 'Kelas 7A', code: 'K7A001', students: 25, status: 'active', createdAt: '2024-01-15', gameType: 'Quiz Battle' },
    { id: 2, name: 'Kelas 7B', code: 'K7B002', students: 23, status: 'active', createdAt: '2024-01-20', gameType: 'Ular Tangga' },
    { id: 3, name: 'Kelas 8A', code: 'K8A003', students: 27, status: 'inactive', createdAt: '2024-02-01', gameType: 'Quiz Battle' }
  ]);

  const [myQuestions] = useState([
    { id: 1, question: 'Apa rumus luas lingkaran?', type: 'multiple_choice', category: 'Mathematics', usedInRooms: 3, correctRate: 75 },
    { id: 2, question: 'Jelaskan proses fotosintesis', type: 'essay', category: 'Biology', usedInRooms: 2, correctRate: 68 },
    { id: 3, question: 'Jakarta adalah ibu kota Indonesia', type: 'true_false', category: 'Geography', usedInRooms: 5, correctRate: 92 }
  ]);

  const [recentGames] = useState([
    { id: 1, roomName: 'Kelas 7A', gameType: 'Ular Tangga', players: 4, duration: '15 min', completedAt: '2024-01-22 10:30', winner: 'Ahmad' },
    { id: 2, roomName: 'Kelas 7B', gameType: 'Quiz Battle', players: 2, duration: '12 min', completedAt: '2024-01-22 11:15', winner: 'Siti' },
    { id: 3, roomName: 'Kelas 8A', gameType: 'Ular Tangga', players: 3, duration: '18 min', completedAt: '2024-01-22 14:20', winner: 'Budi' }
  ]);

  const roomColumns = [
    { key: 'name', header: 'Nama Kelas' },
    { key: 'code', header: 'Kode' },
    { 
      key: 'students', 
      header: 'Siswa',
      render: (students) => (
        <span className="font-semibold text-blue-600">{students} siswa</span>
      )
    },
    { key: 'gameType', header: 'Tipe Game' },
    { 
      key: 'status', 
      header: 'Status',
      render: (status) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {status === 'active' ? '✅ Aktif' : '❌ Non-aktif'}
        </span>
      )
    },
    { key: 'createdAt', header: 'Tgl Dibuat' }
  ];

  const questionColumns = [
    { 
      key: 'question', 
      header: 'Pertanyaan',
      render: (question) => (
        <div className="max-w-xs truncate" title={question}>
          {question}
        </div>
      )
    },
    { 
      key: 'type', 
      header: 'Tipe',
      render: (type) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {type === 'multiple_choice' ? 'Pilgan' : type === 'essay' ? 'Esai' : 'Benar/Salah'}
        </span>
      )
    },
    { key: 'category', header: 'Kategori' },
    { 
      key: 'correctRate', 
      header: 'Tingkat Benar',
      render: (rate) => (
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            rate >= 80 ? 'bg-green-500' : rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span>{rate}%</span>
        </div>
      )
    },
    { key: 'usedInRooms', header: 'Digunakan' }
  ];

  const gameColumns = [
    { key: 'roomName', header: 'Kelas' },
    { key: 'gameType', header: 'Tipe Game' },
    { 
      key: 'players', 
      header: 'Pemain',
      render: (players) => `${players} siswa`
    },
    { key: 'duration', header: 'Durasi' },
    { 
      key: 'winner', 
      header: 'Pemenang',
      render: (winner) => (
        <span className="font-semibold text-green-600">🏆 {winner}</span>
      )
    },
    { key: 'completedAt', header: 'Selesai' }
  ];

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setModalType('');
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'rooms', label: '🏫 Kelas Saya', icon: '🏫' },
    { id: 'questions', label: '❓ Soal Saya', icon: '❓' },
    { id: 'games', label: '🎮 Riwayat Game', icon: '🎮' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 w-full overflow-x-hidden">
      <div className="p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                👨‍🏫 Teacher Dashboard
              </h1>
              <p className="text-gray-600">Kelola kelas dan pembelajaran Anda</p>
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

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-green-600 shadow-lg'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="text-center" hoverable={false}>
                <div className="text-3xl mb-2">🏫</div>
                <h3 className="text-2xl font-bold text-gray-900">{rooms.length}</h3>
                <p className="text-gray-600">Total Kelas</p>
              </Card>
              <Card className="text-center" hoverable={false}>
                <div className="text-3xl mb-2">👨‍🎓</div>
                <h3 className="text-2xl font-bold text-gray-900">75</h3>
                <p className="text-gray-600">Total Siswa</p>
              </Card>
              <Card className="text-center" hoverable={false}>
                <div className="text-3xl mb-2">❓</div>
                <h3 className="text-2xl font-bold text-gray-900">{myQuestions.length}</h3>
                <p className="text-gray-600">Soal Saya</p>
              </Card>
              <Card className="text-center" hoverable={false}>
                <div className="text-3xl mb-2">🎮</div>
                <h3 className="text-2xl font-bold text-gray-900">42</h3>
                <p className="text-gray-600">Game Selesai</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-xl font-bold mb-4">🎯 Performance Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rata-rata Skor Siswa</span>
                    <span className="font-bold text-green-600">78%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tingkat Partisipasi</span>
                    <span className="font-bold text-blue-600">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Game Aktif Minggu Ini</span>
                    <span className="font-bold text-purple-600">15</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-bold mb-4">⭐ Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleOpenModal('room')}
                  >
                    ➕ Buat Kelas Baru
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleOpenModal('assignment')}
                  >
                    📝 Buat Assignment
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                  >
                    📊 Lihat Laporan Lengkap
                  </Button>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'rooms' && (
          <motion.div
            key="rooms"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Kelas Saya</h2>
                <Button onClick={() => handleOpenModal('room')}>
                  ➕ Buat Kelas Baru
                </Button>
              </div>
              <Table 
                columns={roomColumns}
                data={rooms}
                onRowClick={(room) => handleOpenModal('room', room)}
              />
            </Card>
          </motion.div>
        )}

        {activeTab === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Soal Saya</h2>
                <Button onClick={() => handleOpenModal('question')}>
                  ➕ Buat Soal Baru
                </Button>
              </div>
              <Table 
                columns={questionColumns}
                data={myQuestions}
                onRowClick={(question) => handleOpenModal('question', question)}
              />
            </Card>
          </motion.div>
        )}

        {activeTab === 'games' && (
          <motion.div
            key="games"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Riwayat Game</h2>
                <Button variant="outline">
                  📊 Export Data
                </Button>
              </div>
              <Table 
                columns={gameColumns}
                data={recentGames}
              />
            </Card>
          </motion.div>
        )}

        {/* Modal for CRUD operations */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={
            modalType === 'room' 
              ? (selectedItem ? 'Edit Kelas' : 'Buat Kelas Baru')
              : modalType === 'assignment'
              ? 'Buat Assignment Baru'
              : (selectedItem ? 'Edit Soal' : 'Buat Soal Baru')
          }
          footer={
            <>
              <Button variant="secondary" onClick={handleCloseModal}>
                Batal
              </Button>
              <Button onClick={() => console.log('Save')}>
                {selectedItem ? 'Update' : 'Simpan'}
              </Button>
            </>
          }
        >
          {modalType === 'room' && (
            <div className="space-y-4">
              <Input 
                label="Nama Kelas" 
                placeholder="Masukkan nama kelas"
                defaultValue={selectedItem?.name || ''}
              />
              <Input 
                label="Kode Kelas" 
                placeholder="Akan digenerate otomatis"
                defaultValue={selectedItem?.code || ''}
                disabled
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Game Default</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedItem?.gameType || 'Ular Tangga'}
                >
                  <option value="Ular Tangga">🐍 Ular Tangga</option>
                  <option value="Quiz Battle">⚔️ Quiz Battle</option>
                </select>
              </div>
              <Input 
                label="Deskripsi" 
                placeholder="Deskripsi kelas (opsional)"
              />
            </div>
          )}

          {modalType === 'assignment' && (
            <div className="space-y-4">
              <Input 
                label="Judul Assignment" 
                placeholder="Masukkan judul assignment"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kelas</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
              </div>
              <Input 
                label="Deadline" 
                type="datetime-local"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Deskripsi assignment..."
                ></textarea>
              </div>
            </div>
          )}

          {modalType === 'question' && (
            <div className="space-y-4">
              <Input 
                label="Pertanyaan" 
                placeholder="Masukkan pertanyaan"
                defaultValue={selectedItem?.question || ''}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Soal</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedItem?.type || 'multiple_choice'}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="essay">Essay</option>
                  <option value="true_false">True/False</option>
                </select>
              </div>
              <Input 
                label="Kategori" 
                placeholder="Masukkan kategori"
                defaultValue={selectedItem?.category || ''}
              />
            </div>
          )}
        </Modal>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;