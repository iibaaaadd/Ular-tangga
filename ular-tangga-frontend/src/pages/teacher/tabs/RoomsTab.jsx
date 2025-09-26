import React from 'react';
import { motion } from 'motion/react';
import { Card, Button, Table } from '../../../components/ui';

const RoomsTab = ({ rooms = [], setIsModalOpen, setModalType }) => {
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
    {
      key: 'actions',
      header: 'Aksi',
      render: (_, room) => (
        <div className="flex space-x-2">
          <Button size="small" variant="outline">
            ✏️ Edit
          </Button>
          <Button size="small" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
            🗑️ Hapus
          </Button>
        </div>
      )
    }
  ];

  return (
    <motion.div
      key="rooms"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🏫 Manajemen Kelas</h2>
          <Button onClick={() => {setModalType('room'); setIsModalOpen(true);}}>
            ➕ Buat Kelas Baru
          </Button>
        </div>

        {rooms.length > 0 ? (
          <Table 
            columns={roomColumns}
            data={rooms}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏫</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada kelas</h3>
            <p className="text-gray-500 mb-6">Buat kelas pertama Anda untuk mulai mengajar!</p>
            <Button onClick={() => {setModalType('room'); setIsModalOpen(true);}}>
              ➕ Buat Kelas Pertama
            </Button>
          </div>
        )}

        {/* Room Statistics */}
        {rooms.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center" hoverable={false}>
              <div className="text-2xl mb-2">🟢</div>
              <h4 className="text-lg font-bold text-gray-900">
                {rooms.filter(r => r.status === 'active').length}
              </h4>
              <p className="text-gray-600">Kelas Aktif</p>
            </Card>
            <Card className="text-center" hoverable={false}>
              <div className="text-2xl mb-2">👥</div>
              <h4 className="text-lg font-bold text-gray-900">
                {rooms.reduce((sum, room) => sum + room.students, 0)}
              </h4>
              <p className="text-gray-600">Total Siswa</p>
            </Card>
            <Card className="text-center" hoverable={false}>
              <div className="text-2xl mb-2">📊</div>
              <h4 className="text-lg font-bold text-gray-900">
                {Math.round(rooms.reduce((sum, room) => sum + room.students, 0) / rooms.length)}
              </h4>
              <p className="text-gray-600">Rata-rata per Kelas</p>
            </Card>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default RoomsTab;