import React from 'react';
import { motion } from 'motion/react';
import { Card, Button } from '../../../components/ui';

const RoomsTab = ({ joinedRooms = [], setIsModalOpen, setModalType }) => {
  return (
    <motion.div
      key="rooms"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🏫 Kelas Saya</h2>
          <Button onClick={() => {setModalType('joinRoom'); setIsModalOpen(true);}}>
            ➕ Join Kelas Baru
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {joinedRooms.map((room) => (
            <motion.div
              key={room.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{room.name}</h3>
                    <p className="text-gray-600 text-sm">👨‍🏫 {room.teacher}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    room.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {room.status === 'active' ? '✅ Aktif' : '✅ Selesai'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 mb-4">
                  Kode: <span className="font-mono font-bold text-blue-600">{room.code}</span>
                </div>
                
                <div className="text-sm text-gray-500 mb-4">
                  Aktivitas terakhir: {room.lastActivity}
                </div>
                
                {room.status === 'active' && (
                  <Button className="w-full" size="small">
                    🎮 Mulai Game
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {joinedRooms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏫</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada kelas</h3>
            <p className="text-gray-500 mb-6">Gabung ke kelas pertama Anda untuk mulai belajar!</p>
            <Button onClick={() => {setModalType('joinRoom'); setIsModalOpen(true);}}>
              ➕ Join Kelas Pertama
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default RoomsTab;