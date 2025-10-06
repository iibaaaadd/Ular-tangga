import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card, Button, Modal, Input, Table, Select, Pagination, useConfirm } from "./ui";
import Icon from "./ui/Icon";
import { useToastContext } from "./ui/ToastProvider";
import { questionService, materialService } from "../services/api";

const QuestionBank = () => {
  const [activeTab, setActiveTab] = useState('multiple_choice');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0
  });
  
  const toast = useToastContext();
  const { confirm } = useConfirm();
  
  const [formData, setFormData] = useState({
    material_id: '',
    prompt: '',
    difficulty: 'easy', // Use lowercase to match backend
    // MCQ fields
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    // Matching fields
    pairs: [
      { left_item: '', right_item: '', is_correct: true, order: 1 },
      { left_item: '', right_item: '', is_correct: true, order: 2 }
    ],
    // True/False fields
    isTrue: true
  });

  // Load questions when component mounts or tab/filter/page changes
  useEffect(() => {
    loadMaterials();
    loadQuestions();
  }, [activeTab, searchTerm, difficultyFilter, pagination.current_page, selectedMaterial]);

  // Load materials for dropdown
  const loadMaterials = async () => {
    try {
      const response = await materialService.getMaterials({ is_active: true });
      // Handle different response formats
      const materialsData = response.data || response || [];
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error loading materials:', error);
      toast.error('Gagal Memuat Materi', 'Gagal memuat daftar materi');
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      let subtype = '';
      switch (activeTab) {
        case 'multiple_choice':
          subtype = 'mcq';
          break;
        case 'matching':
          subtype = 'matching';
          break;
        case 'true_false':
          subtype = 'true_false';
          break;
      }
      
      const params = { 
        subtype,
        page: pagination.current_page,
        per_page: pagination.per_page
      };
      if (selectedMaterial) {
        params.material_id = selectedMaterial;
      }
      if (difficultyFilter) {
        params.difficulty = difficultyFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      
      const response = await questionService.getQuestions(params);
      setQuestions(response.data || []);
      
      // Update pagination info from response
      if (response.meta) {
        setPagination({
          current_page: response.meta.current_page || 1,
          per_page: response.meta.per_page || 10,
          total: response.meta.total || 0,
          last_page: response.meta.last_page || 1,
          from: response.meta.from || 0,
          to: response.meta.to || 0
        });
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestions([]);
      toast.error('Gagal Memuat Data', 'Gagal memuat daftar soal. Silakan refresh halaman!');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  const resetPagination = () => {
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    resetPagination(); // Reset to page 1 when searching
  };

  // Helper functions for data transformation
  const transformQuestionData = (question) => {
    // Capitalize first letter for display
    const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    
    const baseData = {
      ...question,
      question: question.prompt,
      category: question.subtype?.toUpperCase() || 'UNKNOWN',
      createdAt: question.created_at ? new Date(question.created_at).toLocaleDateString() : 'N/A',
      difficulty: capitalizeFirst(question.difficulty || 'easy'), // Capitalize for display
      base_score: question.base_score || (
        question.difficulty === 'easy' ? 10 :
        question.difficulty === 'medium' ? 20 : 30
      )
    };

    if (question.subtype === 'mcq') {
      return {
        ...baseData,
        options: question.mcq_options?.map(opt => opt.option_text) || [],
        correctAnswer: question.mcq_options?.find(opt => opt.is_correct)?.option_text || '',
        category: 'Multiple Choice'
      };
    }
    
    if (question.subtype === 'matching') {
      // Try both camelCase and snake_case
      const matchingData = question.matchingPairs || question.matching_pairs || [];
      
      return {
        ...baseData,
        category: 'Matching',
        pairs: matchingData,
        correctPairs: matchingData.filter(pair => pair.is_correct),
        totalPairs: matchingData.length
      };
    }
    
    if (question.subtype === 'true_false') {
      console.log('Transforming true_false question:', question); // Debug log
      console.log('tfStatement (camelCase):', question.tfStatement); // Debug log
      console.log('tf_statement (snake_case):', question.tf_statement); // Debug log
      
      // Try both camelCase and snake_case
      const tfData = question.tfStatement || question.tf_statement;
      console.log('Using tfData:', tfData); // Debug log
      
      const result = {
        ...baseData,
        category: 'True/False',
        correctAnswer: tfData?.is_true ? 'Benar' : 'Salah',
        is_true: tfData?.is_true // Get from relationship
      };
      console.log('Transformed result:', result); // Debug log
      return result;
    }

    return baseData;
  };

  // CRUD Functions
  const handleSaveQuestion = async () => {
    try {
      let questionData;

      if (activeTab === 'multiple_choice') {
        questionData = {
          material_id: formData.material_id,
          prompt: formData.prompt,
          difficulty: formData.difficulty, // Already lowercase
          subtype: 'mcq',
          options: formData.options.filter(option => option.trim() !== ''), // Remove empty options
          correct_option_index: formData.correctAnswerIndex
        };
      } else if (activeTab === 'matching') {
        // Validate matching pairs
        const validPairs = formData.pairs.filter(pair => 
          pair.left_item.trim() !== '' && pair.right_item.trim() !== ''
        );
        
        if (validPairs.length < 2) {
          toast.warning('Validasi Error', 'Minimal harus ada 2 pasangan yang valid untuk soal menjodohkan!');
          return;
        }
        
        questionData = {
          material_id: formData.material_id,
          prompt: formData.prompt,
          difficulty: formData.difficulty,
          subtype: 'matching',
          pairs: validPairs.map((pair, index) => ({
            ...pair,
            order: index + 1
          }))
        };
      } else if (activeTab === 'true_false') {
        questionData = {
          material_id: formData.material_id,
          prompt: formData.prompt,
          difficulty: formData.difficulty,
          subtype: 'true_false',
          is_true: formData.isTrue
        };
      }

      if (selectedQuestion) {
        await questionService.updateQuestion(selectedQuestion.id, questionData);
        const typeNames = {
          'mcq': 'Multiple Choice',
          'matching': 'Menjodohkan', 
          'true_false': 'True/False'
        };
        handleCloseModal();
        await loadQuestions();
        toast.success('Berhasil!', `Soal ${typeNames[questionData.subtype]} berhasil diperbarui!`);
      } else {
        await questionService.createQuestion(questionData);
        const typeNames = {
          'mcq': 'Multiple Choice',
          'matching': 'Menjodohkan',
          'true_false': 'True/False'
        };
        handleCloseModal();
        await loadQuestions();
        toast.success('Berhasil!', `Soal ${typeNames[questionData.subtype]} baru berhasil ditambahkan!`);
      }
    } catch (error) {
      console.error('Error saving question:', error);
      // Show more detailed error message
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
        toast.error('Gagal Menyimpan', `Terjadi kesalahan: ${errorMessages}`);
      } else {
        toast.error('Gagal Menyimpan', 'Gagal menyimpan soal. Silakan periksa kembali data yang dimasukkan!');
      }
    }
  };

  const handleDeleteQuestion = async (question) => {
    const questionType = question.category || question.subtype?.toUpperCase() || 'Soal';
    const questionText = question.question || question.prompt || '';
    const truncatedQuestion = questionText.length > 50 ? 
      questionText.substring(0, 50) + '...' : questionText;
    
    const isConfirmed = await confirm({
      title: `Hapus ${questionType}`,
      message: `Apakah Anda yakin ingin menghapus soal ini?\n\n"${truncatedQuestion}"\n\nTindakan ini tidak dapat dibatalkan!`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        await questionService.deleteQuestion(question.id);
        await loadQuestions();
        toast.success('Berhasil!', `Soal ${questionType} berhasil dihapus!`);
      } catch (error) {
        console.error('Error deleting question:', error);
        toast.error('Gagal Menghapus', 'Gagal menghapus soal. Silakan coba lagi!');
      }
    }
  };

  // Reusable action buttons component
  const renderActionButtons = (question) => (
    <div className="flex space-x-2 relative">
      <Button
        size="small"
        variant="secondary"
        onClick={(e) => {
          e.stopPropagation();
          handleOpenModal(question);
        }}
        className="inline-flex items-center gap-1 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700 transition-all duration-200"
      >
        <Icon name="edit" className="w-3 h-3" />
        Edit
      </Button>
      <Button
        size="small"
        variant="destructive"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteQuestion(question);
        }}
        className="inline-flex items-center gap-1"
      >
        <Icon name="delete" className="w-3 h-3" />
        Hapus
      </Button>
    </div>
  );

  // Table columns untuk setiap tipe soal
  const multipleChoiceColumns = [
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
      key: 'material', 
      header: 'Materi',
      render: (_, question) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
          {question.material?.title || 'Tidak ada materi'}
        </span>
      )
    },
    { 
      key: 'correctAnswer', 
      header: 'Jawaban Benar',
      render: (answer) => (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {answer}
        </span>
      )
    },
    { 
      key: 'difficulty', 
      header: 'Tingkat',
      render: (difficulty) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
          difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {difficulty === 'Easy' ? 'Mudah' : difficulty === 'Medium' ? 'Sedang' : 'Sulit'}
        </span>
      )
    },
    { 
      key: 'base_score', 
      header: 'Skor',
      render: (score) => `${parseInt(score) || 0} pts`
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (_, question) => renderActionButtons(question)
    }
  ];

  const matchingColumns = [
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
      key: 'material', 
      header: 'Materi',
      render: (_, question) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
          {question.material?.title || 'Tidak ada materi'}
        </span>
      )
    },
    { 
      key: 'totalPairs', 
      header: 'Jumlah Pasangan',
      render: (totalPairs) => (
        <div className="text-center">
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-md text-sm font-medium">
            {totalPairs || 0} pairs
          </span>
        </div>
      )
    },
    { 
      key: 'correctPairs', 
      header: 'Pasangan Benar',
      render: (correctPairs) => (
        <div className="text-center">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium">
            {(correctPairs || []).length} benar
          </span>
        </div>
      )
    },
    { 
      key: 'difficulty', 
      header: 'Tingkat',
      render: (difficulty) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
          difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {difficulty === 'Easy' ? 'Mudah' : difficulty === 'Medium' ? 'Sedang' : 'Sulit'}
        </span>
      )
    },
    { 
      key: 'base_score', 
      header: 'Skor',
      render: (score) => `${parseInt(score) || 0} pts`
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (_, question) => renderActionButtons(question)
    }
  ];

  const trueFalseColumns = [
    { 
      key: 'question', 
      header: 'Pernyataan',
      render: (question) => (
        <div className="max-w-xs truncate" title={question}>
          {question}
        </div>
      )
    },
    { 
      key: 'material', 
      header: 'Materi',
      render: (_, question) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
          {question.material?.title || 'Tidak ada materi'}
        </span>
      )
    },
    { 
      key: 'correctAnswer', 
      header: 'Jawaban Benar',
      render: (answer) => (
        <span className={`px-2 py-1 rounded-md text-sm font-medium flex items-center gap-1 ${
          answer === 'Benar' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {answer === 'Benar' ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Benar
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Salah
            </>
          )}
        </span>
      )
    },
    { 
      key: 'difficulty', 
      header: 'Tingkat',
      render: (difficulty) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
          difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {difficulty === 'Easy' ? 'Mudah' : difficulty === 'Medium' ? 'Sedang' : 'Sulit'}
        </span>
      )
    },
    { 
      key: 'base_score', 
      header: 'Skor',
      render: (score) => `${parseInt(score) || 0} pts`
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (_, question) => renderActionButtons(question)
    }
  ];

  const getCurrentData = () => {
    if (loading) return [];
    return questions.map(transformQuestionData);
  };

  const getCurrentColumns = () => {
    switch (activeTab) {
      case 'multiple_choice':
        return multipleChoiceColumns;
      case 'matching':
        return matchingColumns;
      case 'true_false':
        return trueFalseColumns;
      default:
        return [];
    }
  };

  const handleOpenModal = (question = null) => {
    setSelectedQuestion(question);
    
    if (question) {
      // Editing existing question
      const baseDifficulty = question.difficulty ? question.difficulty.toLowerCase() : 'easy';
      
      if (activeTab === 'multiple_choice') {
        const correctIndex = question.mcq_options ? 
          question.mcq_options.findIndex(opt => opt.is_correct) : 
          (question.options?.findIndex(opt => opt === question.correctAnswer) || 0);
          
        setFormData({
          material_id: question.material_id || '',
          prompt: question.prompt || question.question || '',
          difficulty: baseDifficulty,
          options: question.mcq_options ? 
            question.mcq_options.map(opt => opt.option_text) :
            (question.options || ['', '', '', '']),
          correctAnswerIndex: correctIndex >= 0 ? correctIndex : 0,
          pairs: [
            { left_item: '', right_item: '', is_correct: true, order: 1 },
            { left_item: '', right_item: '', is_correct: true, order: 2 }
          ],
          isTrue: true
        });
      } else if (activeTab === 'matching') {
        const pairs = question.pairs || question.matchingPairs || question.matching_pairs || [
          { left_item: '', right_item: '', is_correct: true, order: 1 },
          { left_item: '', right_item: '', is_correct: true, order: 2 }
        ];
        
        setFormData({
          material_id: question.material_id || '',
          prompt: question.prompt || question.question || '',
          difficulty: baseDifficulty,
          options: ['', '', '', ''],
          correctAnswerIndex: 0,
          pairs: pairs.length > 0 ? pairs : [
            { left_item: '', right_item: '', is_correct: true, order: 1 },
            { left_item: '', right_item: '', is_correct: true, order: 2 }
          ],
          isTrue: true
        });
      } else if (activeTab === 'true_false') {
        console.log('Opening true_false modal with question:', question); // Debug log
        console.log('is_true value:', question.is_true); // Debug log
        setFormData({
          material_id: question.material_id || '',
          prompt: question.prompt || question.question || '',
          difficulty: baseDifficulty,
          options: ['', '', '', ''],
          correctAnswerIndex: 0,
          pairs: [
            { left_item: '', right_item: '', is_correct: true, order: 1 },
            { left_item: '', right_item: '', is_correct: true, order: 2 }
          ],
          isTrue: question.is_true !== undefined ? question.is_true : true
        });
        console.log('Set formData.isTrue to:', question.is_true !== undefined ? question.is_true : true); // Debug log
      }
    } else {
      // Creating new question
      setFormData({
        material_id: '',
        prompt: '',
        difficulty: 'easy',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        pairs: [
          { left_item: '', right_item: '', is_correct: true, order: 1 },
          { left_item: '', right_item: '', is_correct: true, order: 2 }
        ],
        isTrue: true
      });
    }
    
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setFormData({
      prompt: '',
      difficulty: 'easy',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      pairs: [
        { left_item: '', right_item: '', is_correct: true, order: 1 },
        { left_item: '', right_item: '', is_correct: true, order: 2 }
      ],
      isTrue: true
    });
  };

  const getModalTitle = () => {
    const typeNames = {
      multiple_choice: 'Multiple Choice',
      matching: 'Menjodohkan',
      true_false: 'True/False'
    };
    return `${selectedQuestion ? 'Edit' : 'Tambah'} Soal ${typeNames[activeTab]}`;
  };

  const tabs = [
    { 
      id: 'multiple_choice', 
      label: 'Multiple Choice', 
      icon: 'multipleChoice',
      description: 'Soal pilihan ganda'
    },
    { 
      id: 'matching', 
      label: 'Menjodohkan', 
      icon: 'matching',
      description: 'Soal mencocokkan pasangan'
    },
    { 
      id: 'true_false', 
      label: 'True/False', 
      icon: 'trueFalse',
      description: 'Soal benar atau salah'
    }
  ];

  return (
    <div className="w-full overflow-x-hidden">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon name="questionBank" size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bank Soal</h2>
            <p className="text-gray-600">Kelola soal berdasarkan tipe</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
          <nav className="flex gap-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedMaterial(''); // Reset material filter when switching tabs
                  setDifficultyFilter(''); // Reset filter when switching tabs
                  resetPagination(); // Reset pagination when switching tabs
                }}
                className={`flex items-center px-4 py-3 rounded-md font-medium text-sm transition-all duration-200 focus:outline-none ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <Icon name={tab.icon} size={18} className="mr-2" />
                {tab.label}
              </motion.button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Card>
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-gray-600">Memuat data soal...</span>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h3>
            <Button onClick={() => handleOpenModal()}>
              ➕ Tambah Soal
            </Button>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search - Takes 6 columns on md and up */}
            <div className="md:col-span-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">Search</span>
                  <Input
                  type="text"
                  placeholder="🔍 Cari berdasarkan pertanyaan soal..."
                  value={searchTerm}
                  onChange={handleSearch}
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Material Filter - Takes 3 columns on md and up */}
            <div className="md:col-span-3">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">Materi</span>
                <Select
                  value={selectedMaterial}
                  onChange={(e) => {
                    setSelectedMaterial(e.target.value);
                    resetPagination(); // Reset to page 1 when filter changes
                  }}
                  placeholder="Semua Materi"
                  options={[
                    {value: "", label: "Semua Materi"},
                    ...materials.map(material => ({
                      value: material.id,
                      label: material.title
                    }))
                  ]}
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Difficulty Filter - Takes 3 columns on md and up */}
            <div className="md:col-span-3">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">Tingkat</span>
                <Select
                  value={difficultyFilter}
                  onChange={(e) => {
                    setDifficultyFilter(e.target.value);
                    resetPagination(); // Reset to page 1 when filter changes
                  }}
                  disabled={loading}
                  placeholder="Semua"
                  options={[
                    { value: '', label: 'Semua Tingkat' },
                    { value: 'easy', label: '😊 Mudah' },
                    { value: 'medium', label: '🤔 Sedang' },
                    { value: 'hard', label: '😰 Sulit' }
                  ]}
                />
              </div>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 px-4 py-3 rounded-lg mb-6 gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600">
              <span className="font-medium">📊 Total: {pagination.total} soal</span>
              {questions.length > 0 && (
                <>
                  <span className="hidden sm:inline text-gray-400">|</span>
                  <span className="text-gray-500">
                    Menampilkan {pagination.from} - {pagination.to} dari {pagination.total}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {searchTerm && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Pencarian: "{searchTerm}"
                </span>
              )}
              {selectedMaterial && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Materi: {materials.find(m => m.id == selectedMaterial)?.title || 'Unknown'}
                </span>
              )}
              {difficultyFilter && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter: {difficultyFilter === 'easy' ? 'Mudah' : difficultyFilter === 'medium' ? 'Sedang' : 'Sulit'}
                </span>
              )}
              {(searchTerm || selectedMaterial || difficultyFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedMaterial('');
                    setDifficultyFilter('');
                    resetPagination();
                  }}
                  className="text-xs text-red-600 hover:text-red-800 p-1"
                  title="Hapus Semua Filter"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {pagination.total === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {(searchTerm || selectedMaterial || difficultyFilter)
                  ? `Tidak ada soal ditemukan`
                  : 'Belum ada soal tersedia'
                }
              </h3>
              <p className="text-gray-500 mb-6">
                {(searchTerm || selectedMaterial || difficultyFilter)
                  ? 'Coba ubah kata kunci pencarian atau filter, atau tambah soal baru.'
                  : `Mulai dengan menambahkan soal ${tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()}.`
                }
              </p>
              <Button onClick={() => handleOpenModal()}>
                ➕ Tambah Soal Pertama
              </Button>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="text-center py-12">
                  <svg className="animate-spin inline-block w-8 h-8 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-500">Memuat data soal...</p>
                </div>
              ) : (
                <Table 
                  columns={getCurrentColumns()}
                  data={getCurrentData()}
                  onRowClick={(question) => handleOpenModal(question)}
                />
              )}
              
              {/* Pagination */}
              {pagination.total > 0 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={pagination.current_page}
                    totalPages={pagination.last_page}
                    onPageChange={handlePageChange}
                    showingFrom={pagination.from}
                    showingTo={pagination.to}
                    totalItems={pagination.total}
                    className={loading ? 'pointer-events-none opacity-50' : ''}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* Modal for CRUD operations */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={getModalTitle()}
        size="large"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button onClick={handleSaveQuestion}>
              {selectedQuestion ? 'Update' : 'Simpan'}
            </Button>
          </>
        }
      >
        {/* Multiple Choice Form */}
        {activeTab === 'multiple_choice' && (
          <div className="space-y-6">
            <Select
              label="Materi"
              value={formData.material_id}
              onChange={(e) => setFormData({...formData, material_id: e.target.value})}
              placeholder="Pilih Materi"
              options={materials.map(material => ({
                value: material.id,
                label: material.title
              }))}
              required
            />
            
            <Input 
              label="Pertanyaan" 
              placeholder="Masukkan pertanyaan multiple choice"
              value={formData.prompt}
              onChange={(e) => setFormData({...formData, prompt: e.target.value})}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Pilihan Jawaban</label>
              <div className="space-y-3">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="correctAnswer"
                      value={index}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={formData.correctAnswerIndex === index}
                      onChange={(e) => setFormData({...formData, correctAnswerIndex: parseInt(e.target.value)})}
                    />
                    <Input 
                      placeholder={`Pilihan ${String.fromCharCode(65 + index)}`}
                      value={formData.options[index] || ''}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[index] = e.target.value;
                        setFormData({...formData, options: newOptions});
                      }}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">💡 Pilih radio button untuk menandai jawaban yang benar</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Kesulitan</label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
              >
                <option value="easy">😊 Mudah (10 pts)</option>
                <option value="medium">🤔 Sedang (20 pts)</option>
                <option value="hard">😰 Sulit (30 pts)</option>
              </select>
            </div>
          </div>
        )}

        {/* Matching Form */}
        {activeTab === 'matching' && (
          <div className="space-y-6">
            <Select
              label="Materi"
              value={formData.material_id}
              onChange={(e) => setFormData({...formData, material_id: e.target.value})}
              placeholder="Pilih Materi"
              options={materials.map(material => ({
                value: material.id,
                label: material.title
              }))}
              required
            />
            
            <Input 
              label="Pertanyaan Menjodohkan" 
              placeholder="Masukkan instruksi untuk soal menjodohkan"
              value={formData.prompt}
              onChange={(e) => setFormData({...formData, prompt: e.target.value})}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Pasangan yang Harus Dijodohkan</label>
              <div className="space-y-3">
                {formData.pairs.map((pair, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-center p-4 bg-gray-50 rounded-lg">
                    <div className="col-span-5">
                      <Input
                        placeholder={`Item kiri ${index + 1}`}
                        value={pair.left_item}
                        onChange={(e) => {
                          const newPairs = [...formData.pairs];
                          newPairs[index].left_item = e.target.value;
                          setFormData({...formData, pairs: newPairs});
                        }}
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="text-2xl">↔️</span>
                    </div>
                    <div className="col-span-5">
                      <Input
                        placeholder={`Item kanan ${index + 1}`}
                        value={pair.right_item}
                        onChange={(e) => {
                          const newPairs = [...formData.pairs];
                          newPairs[index].right_item = e.target.value;
                          setFormData({...formData, pairs: newPairs});
                        }}
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.pairs.length > 2) {
                            const newPairs = formData.pairs.filter((_, i) => i !== index);
                            setFormData({...formData, pairs: newPairs});
                          }
                        }}
                        className="text-red-600 hover:text-red-800 disabled:text-gray-300 flex items-center"
                        disabled={formData.pairs.length <= 2}
                      >
                        <Icon name="delete" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={() => {
                  if (formData.pairs.length < 10) {
                    const newPairs = [...formData.pairs, {
                      left_item: '',
                      right_item: '',
                      is_correct: true,
                      order: formData.pairs.length + 1
                    }];
                    setFormData({...formData, pairs: newPairs});
                  }
                }}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                disabled={formData.pairs.length >= 10}
              >
                ➕ Tambah Pasangan
              </button>
              
              <p className="text-sm text-gray-500 mt-2">💡 Buat minimal 2 pasangan, maksimal 10 pasangan</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Kesulitan</label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
              >
                <option value="easy">😊 Mudah (10 pts)</option>
                <option value="medium">🤔 Sedang (20 pts)</option>
                <option value="hard">😰 Sulit (30 pts)</option>
              </select>
            </div>
          </div>
        )}

        {/* True/False Form */}
        {activeTab === 'true_false' && (
          <div className="space-y-6">
            <Select
              label="Materi"
              value={formData.material_id}
              onChange={(e) => setFormData({...formData, material_id: e.target.value})}
              placeholder="Pilih Materi"
              options={materials.map(material => ({
                value: material.id,
                label: material.title
              }))}
              required
            />
            
            <Input 
              label="Pernyataan" 
              placeholder="Masukkan pernyataan untuk dijawab benar/salah"
              value={formData.prompt}
              onChange={(e) => setFormData({...formData, prompt: e.target.value})}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Jawaban yang Benar</label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="trueFalseAnswer"
                    value="true"
                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                    checked={formData.isTrue === true}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({...prev, isTrue: true}));
                        console.log('Set to TRUE:', true); // Debug log
                      }
                    }}
                  />
                  <span className="text-green-700 font-medium">✅ Benar (True)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="trueFalseAnswer"
                    value="false"
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                    checked={formData.isTrue === false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({...prev, isTrue: false}));
                        console.log('Set to FALSE:', false); // Debug log
                      }
                    }}
                  />
                  <span className="text-red-700 font-medium">❌ Salah (False)</span>
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                💡 Jawaban saat ini: <strong>{formData.isTrue === true ? '✅ Benar' : '❌ Salah'}</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Kesulitan</label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
              >
                <option value="easy">😊 Mudah (10 pts)</option>
                <option value="medium">🤔 Sedang (20 pts)</option>
                <option value="hard">😰 Sulit (30 pts)</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </div>
  );
};

export default QuestionBank;