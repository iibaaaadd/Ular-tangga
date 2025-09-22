import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Modal, Input, Table, Pagination } from '../../components/ui';
import QuestionBank from '../../components/QuestionBank';
import { userService } from '../../services/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'user'
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // API data states
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRooms: 8,
    totalQuestions: 450,
    todayGames: 23
  });

  // Load users from API
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getUsers(page, 10, search);
      setUsers(response.users || []);
      setPagination(response.pagination || {});
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: response.pagination?.total || 0
      }));
    } catch (err) {
      setError(err.message || 'Gagal memuat data users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    loadUsers(page, searchTerm);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Debounce search
    setTimeout(() => {
      loadUsers(1, value);
    }, 500);
  };

  const userColumns = [
    { key: 'name', header: 'Nama' },
    { key: 'email', header: 'Email' },
    { 
      key: 'role', 
      header: 'Role',
      render: (role) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          role === 'admin' ? 'bg-purple-100 text-purple-800' :
          role === 'teacher' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {role === 'admin' ? '👑 Admin' : role === 'teacher' ? '👨‍🏫 Guru' : '👨‍🎓 Siswa'}
        </span>
      )
    },
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
    { key: 'createdAt', header: 'Tgl Dibuat' },
    {
      key: 'actions',
      header: 'Aksi',
      render: (_, user) => (
        <div className="flex space-x-2">
          <Button
            size="small"
            variant="secondary"
            onClick={() => handleOpenModal('user', user)}
            disabled={loading}
          >
            ✏️ Edit
          </Button>
          <Button
            size="small"
            variant="outline"
            onClick={() => handleDeleteUser(user.id)}
            disabled={loading}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            🗑️ Delete
          </Button>
        </div>
      )
    }
  ];

  // Handle user operations
  const handleCreateUser = async (userData) => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.createUser(userData);
      await loadUsers(); // Reload users list
      setIsModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      setError(err.message || 'Gagal membuat user');
      console.error('Error creating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (id, userData) => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.updateUser(id, userData);
      await loadUsers(); // Reload users list
      setIsModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      setError(err.message || 'Gagal mengupdate user');
      console.error('Error updating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      await userService.deleteUser(id);
      await loadUsers(); // Reload users list
    } catch (err) {
      setError(err.message || 'Gagal menghapus user');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setError('');
    
    if (item) {
      setFormData({
        name: item.name || '',
        email: item.email || '',
        password: '', // Never pre-fill password
        role: item.role || 'student'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'student'
      });
    }
    
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setModalType('');
    setError('');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'student'
    });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveUser = async () => {
    try {
      setError('');
      
      // Validation
      if (!formData.name || !formData.email) {
        setError('Nama dan email wajib diisi');
        return;
      }
      
      if (!selectedItem && !formData.password) {
        setError('Password wajib diisi untuk user baru');
        return;
      }

      const userData = { ...formData };
      
      // Remove password if empty (for updates)
      if (!userData.password) {
        delete userData.password;
      }

      if (selectedItem) {
        await handleUpdateUser(selectedItem.id, userData);
      } else {
        await handleCreateUser(userData);
      }
    } catch (err) {
      // Error already handled in respective functions
    }
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'users', label: '👥 Users', icon: '👥' },
    { id: 'questions', label: '❓ Bank Soal', icon: '❓' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 w-full overflow-x-hidden">
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
                👑 Admin Dashboard
              </h1>
              <p className="text-gray-600">Kelola sistem game Ular Tangga</p>
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
                    ? 'bg-white text-purple-600 shadow-lg'
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="text-center" hoverable={false}>
              <div className="text-3xl mb-2">👥</div>
              <h3 className="text-2xl font-bold text-gray-900">124</h3>
              <p className="text-gray-600">Total Users</p>
            </Card>
            <Card className="text-center" hoverable={false}>
              <div className="text-3xl mb-2">❓</div>
              <h3 className="text-2xl font-bold text-gray-900">456</h3>
              <p className="text-gray-600">Total Soal</p>
            </Card>
            <Card className="text-center" hoverable={false}>
              <div className="text-3xl mb-2">🎮</div>
              <h3 className="text-2xl font-bold text-gray-900">89</h3>
              <p className="text-gray-600">Game Aktif</p>
            </Card>
            <Card className="text-center" hoverable={false}>
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-2xl font-bold text-gray-900">1.2k</h3>
              <p className="text-gray-600">Total Plays</p>
            </Card>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Manajemen Users</h2>
                <Button onClick={() => handleOpenModal('user')} disabled={loading}>
                  ➕ Tambah User
                </Button>
              </div>

              {/* Search Input */}
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="🔍 Cari berdasarkan nama, email, atau role..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="max-w-md"
                />
              </div>
              
              {loading && (
                <div className="text-center py-4">
                  <p className="text-gray-600">⏳ Memuat data...</p>
                </div>
              )}
              
              {error && !loading && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                  <button 
                    onClick={() => loadUsers()}
                    className="ml-2 text-red-800 underline hover:text-red-900"
                  >
                    Coba lagi
                  </button>
                </div>
              )}
              
              <Table 
                columns={userColumns}
                data={users}
              />

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <Pagination
                  currentPage={pagination.current_page}
                  totalPages={pagination.last_page}
                  onPageChange={handlePageChange}
                  showingFrom={pagination.from}
                  showingTo={pagination.to}
                  totalItems={pagination.total}
                  className="mt-4"
                />
              )}
            </Card>
          </motion.div>
        )}

        {activeTab === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <QuestionBank />
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <Card>
              <h3 className="text-xl font-bold mb-4">📈 User Growth</h3>
              <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-500">Chart akan ditambahkan di sini</p>
              </div>
            </Card>
            <Card>
              <h3 className="text-xl font-bold mb-4">🎯 Question Performance</h3>
              <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-500">Chart akan ditambahkan di sini</p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Modal for CRUD operations */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={
            modalType === 'user' 
              ? (selectedItem ? 'Edit User' : 'Tambah User Baru')
              : (selectedItem ? 'Edit Soal' : 'Tambah Soal Baru')
          }
          footer={
            <>
              <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
                Batal
              </Button>
              <Button onClick={handleSaveUser} disabled={loading}>
                {loading ? 'Menyimpan...' : (selectedItem ? 'Update' : 'Simpan')}
              </Button>
            </>
          }
        >
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {modalType === 'user' && (
            <div className="space-y-4">
              <Input 
                label="Nama" 
                placeholder="Masukkan nama"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                disabled={loading}
              />
              <Input 
                label="Email" 
                type="email"
                placeholder="Masukkan email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                disabled={loading}
              />
              <Input 
                label={selectedItem ? "Password (kosongkan jika tidak ingin mengubah)" : "Password"} 
                type="password"
                placeholder={selectedItem ? "Masukkan password baru" : "Masukkan password"}
                value={formData.password}
                onChange={(e) => handleFormChange('password', e.target.value)}
                disabled={loading}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  value={formData.role}
                  onChange={(e) => handleFormChange('role', e.target.value)}
                  disabled={loading}
                >
                  <option value="student">👨‍🎓 Student</option>
                  <option value="teacher">👨‍🏫 Teacher</option>
                  <option value="admin">👑 Admin</option>
                </select>
              </div>
            </div>
          )}
        </Modal>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;