import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, Button, Modal, Input, Table, Pagination, useToast, useConfirm, ConfirmProvider,
         Icon, Toggle } from '../../../components/ui';

const MaterialsTab = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const toast = useToast();
  const { confirm } = useConfirm();

  const [materials, setMaterials] = useState([
    {
      id: 1,
      title: 'Pengenalan Matematika Dasar',
      description: 'Materi tentang operasi dasar matematika untuk siswa tingkat dasar',
      pdf_path: 'materials/matematika-dasar.pdf',
      is_active: true,
      created_at: '2025-09-25T10:00:00Z'
    },
    {
      id: 2,
      title: 'Bahasa Indonesia Kelas 5',
      description: 'Pembelajaran tata bahasa dan sastra Indonesia',
      pdf_path: 'materials/bahasa-indonesia-kelas5.pdf',
      is_active: true,
      created_at: '2025-09-24T14:30:00Z'
    },
    {
      id: 3,
      title: 'IPA Tentang Tumbuhan',
      description: 'Materi pembelajaran tentang struktur dan fungsi tumbuhan',
      pdf_path: null,
      is_active: false,
      created_at: '2025-09-23T09:15:00Z'
    }
  ]);
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
    loadMaterials();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadMaterials(1, searchTerm);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const loadMaterials = (page = 1, search = '') => {
    setLoading(true);
    setError('');
    
    // Simulasi loading
    setTimeout(() => {
      // Filter berdasarkan search
      let filteredMaterials = materials;
      if (search.trim()) {
        filteredMaterials = materials.filter(material => 
          material.title.toLowerCase().includes(search.toLowerCase()) ||
          (material.description && material.description.toLowerCase().includes(search.toLowerCase()))
        );
      }
      
      // Update pagination dummy
      setPagination({
        current_page: page,
        per_page: 10,
        total: filteredMaterials.length,
        last_page: Math.ceil(filteredMaterials.length / 10),
        from: (page - 1) * 10 + 1,
        to: Math.min(page * 10, filteredMaterials.length)
      });
      
      setLoading(false);
    }, 500);
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
      header: 'PDF',
      render: (value) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          <Icon name={value ? 'check' : 'close'} className="w-3 h-3" />
          {value ? 'Ada' : 'Belum'}
        </span>
      )
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (value, material) => (
        <Toggle
          checked={value}
          onChange={() => handleToggleStatus(material)}
          disabled={loading}
          size="sm"
        />
      )
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (_, material) => (
        <div className="flex space-x-2">
          <Button
            size="small"
            variant="secondary"
            onClick={() => handleOpenModal(material)}
            disabled={loading}
            className="inline-flex items-center gap-1"
          >
            <Icon name="edit" className="w-3 h-3" />
            Edit
          </Button>
          <Button
            size="small"
            variant="outline"
            onClick={() => handleDeleteMaterial(material)}
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

  const handleToggleStatus = (material) => {
    // Update status locally (dummy)
    const updatedMaterials = materials.map(m => 
      m.id === material.id ? { ...m, is_active: !m.is_active } : m
    );
    setMaterials(updatedMaterials);
    toast.show(`Material ${!material.is_active ? 'diaktifkan' : 'dinonaktifkan'}!`, 'success');
  };

  const handleCreateMaterial = (materialData) => {
    const newMaterial = {
      id: materials.length + 1,
      title: materialData.get('title'),
      description: materialData.get('description'),
      pdf_path: materialData.get('pdf_file') ? `materials/${materialData.get('pdf_file').name}` : null,
      is_active: true, // Material baru selalu aktif
      created_at: new Date().toISOString()
    };
    
    setMaterials([...materials, newMaterial]);
    setIsModalOpen(false);
    setSelectedItem(null);
    toast.show(`Material "${newMaterial.title}" berhasil ditambahkan!`, 'success');
  };

  const handleUpdateMaterial = (id, materialData) => {
    const updatedMaterials = materials.map(m => 
      m.id === id ? {
        ...m,
        title: materialData.get('title'),
        description: materialData.get('description'),
        pdf_path: materialData.get('pdf_file') ? `materials/${materialData.get('pdf_file').name}` : m.pdf_path
        // is_active tetap sama, tidak diubah dari modal
      } : m
    );
    
    setMaterials(updatedMaterials);
    setIsModalOpen(false);
    setSelectedItem(null);
    toast.show('Material berhasil diperbarui!', 'success');
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
      const updatedMaterials = materials.filter(m => m.id !== material.id);
      setMaterials(updatedMaterials);
      toast.show(`Material "${material.title}" berhasil dihapus!`, 'success');
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

  const handleSaveMaterial = () => {
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    
    if (formData.pdf_file) {
      submitData.append('pdf_file', formData.pdf_file);
    }

    if (selectedItem) {
      handleUpdateMaterial(selectedItem.id, submitData);
    } else {
      handleCreateMaterial(submitData);
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
          <div className="text-center py-4">
            <p className="text-gray-600">⏳ Memuat data...</p>
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
              accept=".pdf"
              onChange={(e) => setFormData(prev => ({ ...prev, pdf_file: e.target.files[0] || null }))}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: PDF, Maksimal 10MB
            </p>
            {selectedItem && selectedItem.pdf_path && (
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