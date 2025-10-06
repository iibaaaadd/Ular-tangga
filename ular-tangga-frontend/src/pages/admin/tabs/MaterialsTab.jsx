import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, Button, Modal, Input, Table, Pagination, useConfirm, ConfirmProvider,
         Icon, Toggle } from '../../../components/ui';
import { useToastContext } from '../../../components/ui/ToastProvider';
import { materialService } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const MaterialsTab = () => {
  const { user, token } = useAuth(); // Get auth info
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [togglingItems, setTogglingItems] = useState(new Set()); // Track which items are being toggled
  
  const toast = useToastContext();
  const { confirm } = useConfirm();

  const [materials, setMaterials] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pdf_file: null
  });

  useEffect(() => {
    console.log('MaterialsTab: Auth status', { user, token, hasToken: !!token });
    loadMaterials();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadMaterials(1, searchTerm);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadMaterials(1, searchTerm);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const loadMaterials = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError('');
      
      // Check if user is authenticated
      if (!token) {
        setError('Tidak ada token authentication. Silakan login ulang.');
        return;
      }
      
      console.log('Loading materials with params:', { page, search });
      console.log('Auth token exists:', !!token);
      
      const params = {
        page,
        ...(search && { search })
      };
      
      const response = await materialService.getMaterials(params);
      console.log('Materials API response:', response);
      
      // Response adalah Laravel pagination object langsung
      if (response && response.data) {
        setMaterials(response.data);
        setPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          from: response.from,
          to: response.to,
          total: response.total,
          per_page: response.per_page
        });
      } else {
        console.error('Invalid response format:', response);
        setError('Format response tidak valid');
      }
    } catch (err) {
      console.error('Error loading materials:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Silakan login ulang.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat memuat data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    loadMaterials(page, searchTerm);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const materialColumns = [
    { 
      key: 'title', 
      header: 'Judul',
      render: (value) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    { 
      key: 'description', 
      header: 'Deskripsi',
      render: (value) => (
        <div className="text-gray-600 max-w-xs truncate">
          {value || '-'}
        </div>
      )
    },
    { 
      key: 'pdf_path', 
      header: 'File PDF',
      render: (value) => (
        value ? (
          <a 
            href={`http://localhost:8000/storage/${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:text-red-800 flex items-center justify-center transition-colors"
            title={value.split('/').pop()}
          >
            <Icon name="pdf" className="w-6 h-6" />
          </a>
        ) : (
          <span className="text-gray-400 flex items-center justify-center">
            <Icon name="pdf" className="w-6 h-6 opacity-50" />
          </span>
        )
      )
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (value, material) => (
        <Toggle
          checked={value}
          onChange={() => handleToggleStatus(material)}
          disabled={togglingItems.has(material.id)}
          size="sm"
        />
      )
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (_, material) => (
        <div className="flex space-x-2 relative">
          <Button
            size="small"
            variant="secondary"
            onClick={() => handleOpenModal(material)}
            disabled={loading}
            className="inline-flex items-center gap-1 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700 transition-all duration-200"
          >
            <Icon name="edit" className="w-3 h-3" />
            Edit
          </Button>
          <Button
            size="small"
            variant="destructive"
            onClick={() => handleDeleteMaterial(material)}
            disabled={loading}
            className="inline-flex items-center gap-1"
          >
            <Icon name="delete" className="w-3 h-3" />
            Delete
          </Button>
        </div>
      )
    }
  ];

  const handleToggleStatus = async (material) => {
    if (togglingItems.has(material.id)) return; // Prevent double-click
    
    const originalStatus = material.is_active;
    const newStatus = !originalStatus;
    
    // Add to toggling items
    setTogglingItems(prev => new Set([...prev, material.id]));
    
    // Update UI immediately (optimistic update)
    setMaterials(prevMaterials => 
      prevMaterials.map(m => 
        m.id === material.id 
          ? { ...m, is_active: newStatus }
          : m
      )
    );

    try {
      // For toggle, use JSON instead of FormData since we're not uploading files
      const updateData = {
        title: material.title,
        description: material.description || '',
        is_active: newStatus,
        // Keep existing PDF path
        pdf_path: material.pdf_path
      };
      
      console.log('Sending toggle update with data:', updateData);
      console.log('Original status:', originalStatus, 'New status:', newStatus);
      
      const response = await materialService.updateMaterial(material.id, updateData);
      console.log('Toggle status response:', response);
      
      // Check different response formats
      const success = response?.data?.material || response?.material || response?.message;
      
      if (success) {
        toast.success('Berhasil!', `Material ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}!`);
        // Keep optimistic update - don't change state again
      } else {
        // Revert to original status if API failed
        setMaterials(prevMaterials => 
          prevMaterials.map(m => 
            m.id === material.id 
              ? { ...m, is_active: originalStatus }
              : m
          )
        );
        toast.error('Gagal!', 'Gagal mengubah status material');
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      
      // Revert to original status if error occurred
      setMaterials(prevMaterials => 
        prevMaterials.map(m => 
          m.id === material.id 
            ? { ...m, is_active: originalStatus }
            : m
        )
      );
      
      // Handle validation errors
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        toast.error('Gagal!', errorMessages.join(', '));
      } else {
        toast.error('Gagal!', err.response?.data?.message || err.message || 'Gagal mengubah status material');
      }
    } finally {
      // Remove from toggling items
      setTogglingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(material.id);
        return newSet;
      });
    }
  };

  const handleCreateMaterial = async (materialData) => {
    try {
      setLoading(true);
      const response = await materialService.createMaterial(materialData);
      console.log('Create response:', response);
      
      // Check different response formats
      const createdMaterial = response?.data?.material || response?.material;
      
      if (createdMaterial || response?.message) {
        setIsModalOpen(false);
        setSelectedItem(null);
        setFormData({
          title: '',
          description: '',
          pdf_file: null
        });
        await loadMaterials(pagination.current_page, searchTerm);
        return { success: true, message: `Material "${materialData.get('title')}" berhasil ditambahkan!` };
      } else {
        return { success: false, message: 'Gagal menambahkan material' };
      }
    } catch (err) {
      console.error('Error creating material:', err);
      
      // Handle validation errors
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        return { success: false, message: errorMessages.join(', ') };
      } else {
        return { success: false, message: err.response?.data?.message || err.message || 'Gagal menambahkan material' };
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMaterial = async (id, materialData) => {
    try {
      setLoading(true);
      console.log('Updating material with ID:', id);
      console.log('Material data being sent:', Array.from(materialData.entries()));
      
      const response = await materialService.updateMaterial(id, materialData);
      console.log('Update response:', response);
      
      // Check if response has data (could be response.data.material or response.material)
      const updatedMaterial = response?.data?.material || response?.material;
      
      if (updatedMaterial || response?.message) {
        setIsModalOpen(false);
        setSelectedItem(null);
        setFormData({
          title: '',
          description: '',
          pdf_file: null
        });
        // Reload materials to get fresh data
        await loadMaterials(pagination.current_page, searchTerm);
        return { success: true, message: 'Material berhasil diperbarui!' };
      } else {
        return { success: false, message: 'Gagal memperbarui material' };
      }
    } catch (err) {
      console.error('Error updating material:', err);
      
      // Handle validation errors
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        return { success: false, message: errorMessages.join(', ') };
      } else if (err.response?.status === 422) {
        return { success: false, message: 'Data tidak valid. Periksa kembali input Anda.' };
      } else if (err.response?.status === 404) {
        return { success: false, message: 'Material tidak ditemukan.' };
      } else {
        return { success: false, message: err.response?.data?.message || err.message || 'Gagal memperbarui material' };
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (material) => {
    const confirmed = await confirm({
      title: 'Hapus Material',
      message: `Apakah Anda yakin ingin menghapus material "${material.title}"?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger'
    });
    
    if (confirmed) {
      try {
        setLoading(true);
        console.log('Deleting material with ID:', material.id);
        
        const response = await materialService.deleteMaterial(material.id);
        console.log('Delete response:', response);
        
        if (response && (response.message || response.data?.message)) {
          // Reload materials to get fresh data first
          await loadMaterials(pagination.current_page, searchTerm);
          toast.success('Berhasil!', `Material "${material.title}" berhasil dihapus!`);
        } else {
          toast.error('Gagal!', 'Gagal menghapus material');
        }
      } catch (err) {
        console.error('Error deleting material:', err);
        
        if (err.response?.status === 422) {
          toast.error('Gagal!', err.response?.data?.message || 'Material tidak dapat dihapus karena masih memiliki soal.');
        } else if (err.response?.status === 404) {
          toast.error('Gagal!', 'Material tidak ditemukan.');
        } else {
          toast.error('Gagal!', err.response?.data?.message || err.message || 'Gagal menghapus material');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenModal = (item = null) => {
    setSelectedItem(item);
    setError('');
    
    if (item) {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        pdf_file: null
      });
    } else {
      setFormData({
        title: '',
        description: '',
        pdf_file: null
      });
    }
    
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setError('');
    setFormData({
      title: '',
      description: '',
      pdf_file: null
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveMaterial = async () => {
    // Validate required fields
    if (!formData.title || formData.title.trim() === '') {
      toast.error('Validasi Gagal!', 'Judul materi harus diisi');
      return;
    }
    
    const submitData = new FormData();
    submitData.append('title', formData.title.trim());
    submitData.append('description', formData.description?.trim() || '');
    
    // Only append PDF file if it's actually a file object
    if (formData.pdf_file && formData.pdf_file instanceof File) {
      // Validate file type
      if (formData.pdf_file.type !== 'application/pdf') {
        toast.error('File tidak valid!', 'File harus berformat PDF');
        return;
      }
      // Validate file size (10MB)
      if (formData.pdf_file.size > 10 * 1024 * 1024) {
        toast.error('File terlalu besar!', 'File PDF maksimal 10MB');
        return;
      }
      
      submitData.append('pdf_file', formData.pdf_file);
    }

    let result;
    // For updates, preserve existing is_active status if not explicitly changed
    if (selectedItem) {
      submitData.append('is_active', selectedItem.is_active ? '1' : '0');
      // Add _method for Laravel to handle PUT requests properly
      submitData.append('_method', 'PUT');
      result = await handleUpdateMaterial(selectedItem.id, submitData);
    } else {
      // For new materials, default to active
      submitData.append('is_active', '1');
      result = await handleCreateMaterial(submitData);
    }

    if (result.success) {
      toast.success('Berhasil!', result.message);
    } else {
      toast.error('Gagal!', result.message);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ConfirmProvider>
      <motion.div
        key="materials"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Manajemen Materi</h2>
            <Button onClick={() => handleOpenModal()} disabled={loading}>
              ➕ Tambah Materi
            </Button>
          </div>

          <div className="mb-4">
            <Input
              type="text"
              placeholder="🔍 Cari materi berdasarkan judul atau deskripsi..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        
        {loading && (
          <div className="text-center py-12">
            <svg className="animate-spin inline-block w-8 h-8 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500">Memuat data materi...</p>
          </div>
        )}
        
        {error && !loading && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button 
              onClick={() => loadMaterials()}
              className="ml-2 text-red-800 underline hover:text-red-900"
            >
              Coba lagi
            </button>
          </div>
        )}
        
        {!loading && (
          <>
            <Table 
              columns={materialColumns}
              data={materials}
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedItem ? 'Edit Materi' : 'Tambah Materi'}
        size="large"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              Batal
            </Button>
            <Button onClick={handleSaveMaterial} disabled={loading}>
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
        
        <div className="space-y-6">
          <Input
            label="Judul Materi"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
            placeholder="Masukkan judul materi"
            disabled={loading}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows="3"
              placeholder="Masukkan deskripsi materi (opsional)"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File PDF
            </label>
            <input
              type="file"
              name="pdf_file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // Validate file type
                  if (file.type !== 'application/pdf') {
                    toast.error('File tidak valid!', 'File harus berformat PDF');
                    e.target.value = '';
                    return;
                  }
                  // Validate file size (10MB)
                  if (file.size > 10 * 1024 * 1024) {
                    toast.error('File terlalu besar!', 'File PDF maksimal 10MB');
                    e.target.value = '';
                    return;
                  }
                }
                setFormData(prev => ({ ...prev, pdf_file: file || null }));
              }}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: PDF, Maksimal 10MB
            </p>
            {formData.pdf_file && (
              <p className="text-xs text-green-600 mt-1">
                File dipilih: {formData.pdf_file.name}
              </p>
            )}
            {selectedItem && selectedItem.pdf_path && !formData.pdf_file && (
              <p className="text-xs text-blue-600 mt-1">
                File saat ini: {selectedItem.pdf_path.split('/').pop()}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </motion.div>
  </ConfirmProvider>
  );
};

export default MaterialsTab;