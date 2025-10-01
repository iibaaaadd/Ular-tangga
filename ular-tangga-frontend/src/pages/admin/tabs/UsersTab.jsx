import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, Button, Modal, Input, Table, Pagination, Select, useToast, useConfirm, ConfirmProvider,
         Icon } from '../../../components/ui';
import { userService } from '../../../services/api';

const UsersTab = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const toast = useToast();
  const { confirm } = useConfirm();

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
  const [roleFilter, setRoleFilter] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadUsers(1, searchTerm, roleFilter);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, roleFilter]);

  const loadUsers = async (page = 1, search = '', role = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.getUsers(page, 10, search, role);
      setUsers(response.users || []);
      setPagination(response.pagination || {});
    } catch (err) {
      setError(err.message || 'Gagal memuat data users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    loadUsers(page, searchTerm, roleFilter);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const userColumns = [
    { key: 'name', header: 'Nama' },
    { key: 'email', header: 'Email' },
    { 
      key: 'role', 
      header: 'Role',
      render: (role) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          role === 'admin' ? 'bg-purple-100 text-purple-800' :
          role === 'teacher' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {role === 'admin' ? <Icon name="admin" className="w-3 h-3" /> : 
           role === 'teacher' ? <Icon name="teacher" className="w-3 h-3" /> : 
           <Icon name="student" className="w-3 h-3" />}
          {role === 'admin' ? 'Admin' : role === 'teacher' ? 'Teacher' : 'Student'}
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
            onClick={() => handleOpenModal(user)}
            disabled={loading}
            className="inline-flex items-center gap-1"
          >
            <Icon name="edit" className="w-3 h-3" />
            Edit
          </Button>
          <Button
            size="small"
            variant="outline"
            onClick={() => handleDeleteUser(user)}
            disabled={loading}
            className="inline-flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50"
          >
            <Icon name="delete" className="w-3 h-3" />
            Delete
          </Button>
        </div>
      )
    }
  ];

  const handleCreateUser = async (userData) => {
    try {
      setLoading(true);
      setError('');
      await userService.createUser(userData);
      await loadUsers();
      setIsModalOpen(false);
      setSelectedItem(null);
      toast.success('Berhasil!', `User "${userData.name}" berhasil dibuat`);
    } catch (err) {
      setError(err.message || 'Gagal membuat user');
      toast.error('Gagal!', err.message || 'Gagal membuat user baru');
      console.error('Error creating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (id, userData) => {
    try {
      setLoading(true);
      setError('');
      await userService.updateUser(id, userData);
      await loadUsers();
      setIsModalOpen(false);
      setSelectedItem(null);
      toast.success('Berhasil!', `User "${userData.name}" berhasil diupdate`);
    } catch (err) {
      setError(err.message || 'Gagal mengupdate user');
      toast.error('Gagal!', err.message || 'Gagal mengupdate user');
      console.error('Error updating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = await confirm({
      title: 'Hapus User',
      message: `Apakah Anda yakin ingin menghapus user "${user.name}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      await userService.deleteUser(user.id);
      await loadUsers();
      toast.success('Berhasil!', `User "${user.name}" berhasil dihapus`);
    } catch (err) {
      setError(err.message || 'Gagal menghapus user');
      toast.error('Gagal!', err.message || 'Gagal menghapus user');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    setSelectedItem(item);
    setError('');
    
    if (item) {
      setFormData({
        name: item.name || '',
        email: item.email || '',
        password: '',
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
      
      if (!formData.name || !formData.email) {
        setError('Nama dan email wajib diisi');
        return;
      }
      
      if (!selectedItem && !formData.password) {
        setError('Password wajib diisi untuk user baru');
        return;
      }

      const userData = { ...formData };
      
      if (!userData.password) {
        delete userData.password;
      }

      if (selectedItem) {
        await handleUpdateUser(selectedItem.id, userData);
      } else {
        await handleCreateUser(userData);
      }
    } catch (err) {
      console.error('Save user error:', err);
    }
  };

  return (
    <motion.div
      key="users"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Users</h2>
          <Button onClick={() => handleOpenModal()} disabled={loading}>
            ➕ Tambah User
          </Button>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="🔍 Cari berdasarkan nama atau email..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="sm:w-48">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              placeholder="Filter Role"
              options={[
                { value: '', label: '👥 Semua Role' },
                { value: 'admin', label: '👑 Admin' },
                { value: 'teacher', label: '👨‍🏫 Teacher' },
                { value: 'student', label: '👨‍🎓 Student' }
              ]}
            />
          </div>
        </div>
        
        {loading && (
          <div className="text-center py-12">
            <svg className="animate-spin inline-block w-8 h-8 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500">Memuat data users...</p>
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
        
        {!loading && (
          <>
            <Table 
              columns={userColumns}
              data={users}
            />

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
          </>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedItem ? 'Edit User' : 'Tambah User Baru'}
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
          <Select
            label="Role"
            value={formData.role}
            onChange={(e) => handleFormChange('role', e.target.value)}
            disabled={loading}
            options={[
              { value: 'student', label: '👨‍🎓 Student' },
              { value: 'teacher', label: '👨‍🏫 Teacher' },
              { value: 'admin', label: '👑 Admin' }
            ]}
          />
        </div>
      </Modal>
      
      {/* Toast Container */}
      <toast.ToastContainer />
    </motion.div>
  );
};

export default UsersTab;