import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, Button, Table, Modal, Input, Select, FilterSection } from '../../../components/ui';
import { gameRoomService, materialService } from '../../../services/api';

const RoomsTab = ({ setIsModalOpen, setModalType }) => {
  const [rooms, setRooms] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    room_name: '',
    material_id: '',
    max_participants: 30
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    material: '',
    sortBy: 'created_at'
  });

  useEffect(() => {
    fetchRooms();
    fetchMaterials();
  }, []);

  useEffect(() => {
    // Materials state tracking
  }, [materials]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await gameRoomService.getTeacherRooms();
      if (response.status === 'success') {
        setRooms(response.data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await materialService.getMaterials();
      
      // Check different possible response formats
      if (response && response.data) {
        setMaterials(response.data);
      } else if (response && Array.isArray(response)) {
        setMaterials(response);
      } else {
        console.error('Unexpected response format:', response);
        setMaterials([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status
      });
      setMaterials([]); // Set empty array on error
    }
  };

  const handleCreateRoom = async () => {
    try {
      const response = await gameRoomService.createRoom(formData);
      if (response.status === 'success') {
        setIsCreateModalOpen(false);
        setFormData({ room_name: '', material_id: '', max_participants: 30 });
        fetchRooms(); // Refresh data
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Gagal membuat kelas. Silahkan coba lagi.');
    }
  };

  const handleStartStudying = async (roomCode) => {
    try {
      const response = await gameRoomService.startStudying(roomCode);
      if (response.status === 'success') {
        fetchRooms(); // Refresh data
        alert('Fase belajar dimulai!');
      }
    } catch (error) {
      console.error('Error starting study phase:', error);
      alert('Gagal memulai fase belajar.');
    }
  };

  const handleStartGame = async (roomCode) => {
    try {
      const response = await gameRoomService.startGame(roomCode);
      if (response.status === 'success') {
        fetchRooms(); // Refresh data
        alert('Game dimulai!');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Gagal memulai game.');
    }
  };

  // Filter and sort rooms
  const filteredRooms = rooms.filter(room => {
    // Search filter
    if (filters.search && !room.room_name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !room.room_code.toLowerCase().includes(filters.search.toLowerCase()) &&
        !room.material?.title?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filters.status && room.status !== filters.status) {
      return false;
    }

    // Material filter
    if (filters.material && room.material_id !== parseInt(filters.material)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'name':
        return a.room_name.localeCompare(b.room_name);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'participants':
        return (b.participants?.length || 0) - (a.participants?.length || 0);
      case 'created_at':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      waiting: { color: 'yellow', text: '⏳ Menunggu', bgColor: 'bg-yellow-100 text-yellow-800' },
      studying: { color: 'blue', text: '📚 Belajar', bgColor: 'bg-blue-100 text-blue-800' },
      playing: { color: 'green', text: '🎮 Bermain', bgColor: 'bg-green-100 text-green-800' },
      finished: { color: 'gray', text: '✅ Selesai', bgColor: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status] || statusConfig.waiting;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bgColor}`}>
        {config.text}
      </span>
    );
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      material: '',
      sortBy: 'created_at'
    });
  };

  const roomColumns = [
    { 
      key: 'room_name', 
      header: 'Nama Kelas',
      render: (name, room) => (
        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">Kode: {room.room_code}</div>
        </div>
      )
    },
    { 
      key: 'material', 
      header: 'Materi',
      render: (material) => (
        <div className="text-sm">
          <div className="font-medium">{material?.title}</div>
          <div className="text-gray-500">{material?.description}</div>
        </div>
      )
    },
    { 
      key: 'participants', 
      header: 'Peserta',
      render: (participants, room) => (
        <span className="font-semibold text-blue-600">
          {participants?.length || 0}/{room.max_participants}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (status) => getStatusBadge(status)
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (_, room) => (
        <div className="flex space-x-2 relative">
          {room.status === 'waiting' && (
            <Button 
              size="small" 
              variant="outline"
              onClick={() => handleStartStudying(room.room_code)}
              className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
            >
              📚 Mulai Belajar
            </Button>
          )}
          {room.status === 'studying' && (
            <Button 
              size="small" 
              variant="primary"
              onClick={() => handleStartGame(room.room_code)}
              className="hover:bg-blue-700 transition-all duration-200"
            >
              🎮 Mulai Game
            </Button>
          )}
          <Button 
            size="small" 
            variant="outline"
            onClick={() => setSelectedRoom(room)}
            className="hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            👁️ Detail
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <motion.div
        key="rooms-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center py-12"
      >
        <div className="text-xl">Loading...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="rooms"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🏫 Manajemen Kelas</h2>
          <Button onClick={() => {

            setIsCreateModalOpen(true);
          }}>
            ➕ Buat Kelas Baru
          </Button>
        </div>

        {/* Filters Section */}
        {rooms.length > 0 && (
          <FilterSection
            title="🔍 Filter Kelas Saya"
            showResults={true}
            totalItems={rooms.length}
            filteredItems={filteredRooms.length}
            hasActiveFilters={!!(filters.search || filters.status || filters.material)}
            onClearFilters={clearFilters}
          >
            <FilterSection.Item label="🔍 Pencarian">
              <Input
                placeholder="Cari kelas, kode, atau materi..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </FilterSection.Item>
            
            <FilterSection.Item label="📋 Status Kelas">
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                options={[
                  { value: '', label: 'Semua Status' },
                  { value: 'waiting', label: '⏳ Menunggu' },
                  { value: 'studying', label: '📚 Belajar' },
                  { value: 'playing', label: '🎮 Bermain' },
                  { value: 'finished', label: '✅ Selesai' }
                ]}
              />
            </FilterSection.Item>
            
            <FilterSection.Item label="📚 Materi">
              <Select
                value={filters.material}
                onChange={(e) => setFilters(prev => ({ ...prev, material: e.target.value }))}
                options={[
                  { value: '', label: 'Semua Materi' },
                  ...materials.map(material => ({
                    value: material.id.toString(),
                    label: material.title
                  }))
                ]}
              />
            </FilterSection.Item>
          </FilterSection>
        )}

        {filteredRooms.length > 0 ? (
          <Table 
            columns={roomColumns}
            data={filteredRooms}
          />
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏫</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada kelas</h3>
            <p className="text-gray-500 mb-6">Buat kelas pertama Anda untuk mulai mengajar!</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              ➕ Buat Kelas Pertama
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak ada kelas yang cocok</h3>
            <p className="text-gray-500 mb-6">Coba ubah filter atau buat kelas baru!</p>
            <Button variant="outline" onClick={clearFilters}>
              🗑️ Reset Filter
            </Button>
          </div>
        )}

        {/* Room Statistics */}
        {rooms.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center" hoverable={false}>
              <div className="text-2xl mb-2">�</div>
              <h4 className="text-lg font-bold text-gray-900">{rooms.length}</h4>
              <p className="text-gray-600">Total Kelas</p>
            </Card>
            <Card className="text-center" hoverable={false}>
              <div className="text-2xl mb-2">⏳</div>
              <h4 className="text-lg font-bold text-gray-900">
                {rooms.filter(r => r.status === 'waiting').length}
              </h4>
              <p className="text-gray-600">Menunggu</p>
            </Card>
            <Card className="text-center" hoverable={false}>
              <div className="text-2xl mb-2">🎮</div>
              <h4 className="text-lg font-bold text-gray-900">
                {rooms.filter(r => r.status === 'playing').length}
              </h4>
              <p className="text-gray-600">Sedang Main</p>
            </Card>
            <Card className="text-center" hoverable={false}>
              <div className="text-2xl mb-2">👥</div>
              <h4 className="text-lg font-bold text-gray-900">
                {rooms.reduce((sum, room) => sum + (room.participants?.length || 0), 0)}
              </h4>
              <p className="text-gray-600">Total Peserta</p>
            </Card>
          </div>
        )}
      </Card>

      {/* Create Room Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Kelas Baru"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
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
            placeholder="Contoh: Kelas 7A - Matematika"
            value={formData.room_name}
            onChange={(e) => setFormData(prev => ({ ...prev, room_name: e.target.value }))}
          />
          <Select
            label="Pilih Materi"
            value={formData.material_id}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, material_id: e.target.value }));
            }}
            options={[
              { value: '', label: 'Pilih materi...' },
              ...materials.map(material => ({
                value: material.id,
                label: material.title
              }))
            ]}
          />
          <Input 
            label="Maksimal Peserta" 
            type="number"
            placeholder="30"
            min="2"
            max="100"
            value={formData.max_participants}
            onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 30 }))}
          />
        </div>
      </Modal>

      {/* Room Detail Modal */}
      {selectedRoom && (
        <Modal
          isOpen={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          title={`Detail Kelas: ${selectedRoom.room_name}`}
          footer={
            <Button variant="secondary" onClick={() => setSelectedRoom(null)}>
              Tutup
            </Button>
          }
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700">Kode Kelas:</h4>
              <p className="text-lg font-mono bg-gray-100 p-2 rounded">{selectedRoom.room_code}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Materi:</h4>
              <p>{selectedRoom.material?.title}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Status:</h4>
              {getStatusBadge(selectedRoom.status)}
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Peserta:</h4>
              <p>{selectedRoom.participants?.length || 0} dari {selectedRoom.max_participants} orang</p>
            </div>
            {selectedRoom.participants && selectedRoom.participants.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Daftar Peserta:</h4>
                <div className="max-h-40 overflow-y-auto">
                  {selectedRoom.participants.map((participant, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <span>{participant.student?.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        participant.is_ready ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {participant.is_ready ? 'Siap' : 'Belum Siap'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </motion.div>
  );
};

export default RoomsTab;