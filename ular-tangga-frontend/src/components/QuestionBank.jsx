import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card, Button, Modal, Input, Table } from "./ui";
import { questionService } from "../services/api";

const QuestionBank = () => {
  const [activeTab, setActiveTab] = useState('multiple_choice');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    prompt: '',
    difficulty: 'easy', // Use lowercase to match backend
    // MCQ fields
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    // Essay fields
    keyPoints: '',
    maxScore: null,
    // True/False fields
    isTrue: true
  });

  // Load questions when component mounts or tab changes
  useEffect(() => {
    loadQuestions();
  }, [activeTab]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      let subtype = '';
      switch (activeTab) {
        case 'multiple_choice':
          subtype = 'mcq';
          break;
        case 'essay':
          subtype = 'essay';
          break;
        case 'true_false':
          subtype = 'true_false';
          break;
      }
      
      const response = await questionService.getQuestions({ subtype });
      setQuestions(response.data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
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
    
    if (question.subtype === 'essay') {
      // Try both camelCase and snake_case
      const essayData = question.essayKey || question.essay_key;
      
      return {
        ...baseData,
        category: 'Essay',
        keywords: essayData?.key_points ? 
          essayData.key_points.split(',').map(k => k.trim()).filter(k => k) : 
          [],
        keyPoints: essayData?.key_points || '',
        maxScore: essayData?.max_score
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
          prompt: formData.prompt,
          difficulty: formData.difficulty, // Already lowercase
          subtype: 'mcq',
          options: formData.options.filter(option => option.trim() !== ''), // Remove empty options
          correct_option_index: formData.correctAnswerIndex
        };
      } else if (activeTab === 'essay') {
        questionData = {
          prompt: formData.prompt,
          difficulty: formData.difficulty,
          subtype: 'essay',
          key_points: formData.keyPoints || '',
          max_score: formData.maxScore || null
        };
      } else if (activeTab === 'true_false') {
        questionData = {
          prompt: formData.prompt,
          difficulty: formData.difficulty,
          subtype: 'true_false',
          is_true: formData.isTrue
        };
      }

      if (selectedQuestion) {
        await questionService.updateQuestion(selectedQuestion.id, questionData);
      } else {
        await questionService.createQuestion(questionData);
      }
      
      await loadQuestions();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving question:', error);
      // Show more detailed error message
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join('\n');
        alert(`Gagal menyimpan soal:\n${errorMessages}`);
      } else {
        alert('Gagal menyimpan soal. Silakan coba lagi.');
      }
    }
  };

  const handleDeleteQuestion = async (question) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
      try {
        await questionService.deleteQuestion(question.id);
        await loadQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Gagal menghapus soal. Silakan coba lagi.');
      }
    }
  };

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
      key: 'correctAnswer', 
      header: 'Jawaban Benar',
      render: (answer) => (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          ✅ {answer}
        </span>
      )
    },
    { key: 'category', header: 'Kategori' },
    { 
      key: 'difficulty', 
      header: 'Tingkat',
      render: (difficulty) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
          difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {difficulty === 'Easy' ? '😊 Mudah' : difficulty === 'Medium' ? '🤔 Sedang' : '😰 Sulit'}
        </span>
      )
    },
    { 
      key: 'base_score', 
      header: 'Skor',
      render: (score) => `${score || 0} pts`
    },
    { key: 'createdAt', header: 'Tgl Dibuat' },
    {
      key: 'actions',
      header: 'Aksi',
      render: (_, question) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(question);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ✏️ Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteQuestion(question);
            }}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            🗑️ Hapus
          </button>
        </div>
      )
    }
  ];

  const essayColumns = [
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
      key: 'keywords', 
      header: 'Kata Kunci',
      render: (keywords) => (
        <div className="flex flex-wrap gap-1">
          {(keywords || []).slice(0, 3).map((keyword, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {keyword}
            </span>
          ))}
          {(keywords || []).length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              +{(keywords || []).length - 3}
            </span>
          )}
          {(!keywords || keywords.length === 0) && (
            <span className="text-gray-400 text-xs italic">Tidak ada kata kunci</span>
          )}
        </div>
      )
    },
    { key: 'category', header: 'Kategori' },
    { 
      key: 'difficulty', 
      header: 'Tingkat',
      render: (difficulty) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
          difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {difficulty === 'Easy' ? '😊 Mudah' : difficulty === 'Medium' ? '🤔 Sedang' : '😰 Sulit'}
        </span>
      )
    },
    { 
      key: 'base_score', 
      header: 'Skor Max',
      render: (score) => `${score || 0} pts`
    },
    { key: 'createdAt', header: 'Tgl Dibuat' },
    {
      key: 'actions',
      header: 'Aksi',
      render: (_, question) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(question);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ✏️ Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteQuestion(question);
            }}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            🗑️ Hapus
          </button>
        </div>
      )
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
      key: 'correctAnswer', 
      header: 'Jawaban Benar',
      render: (answer) => (
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
          answer === 'Benar' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {answer === 'Benar' ? '✅ Benar' : '❌ Salah'}
        </span>
      )
    },
    { key: 'category', header: 'Kategori' },
    { 
      key: 'difficulty', 
      header: 'Tingkat',
      render: (difficulty) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
          difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {difficulty === 'Easy' ? '😊 Mudah' : difficulty === 'Medium' ? '🤔 Sedang' : '😰 Sulit'}
        </span>
      )
    },
    { key: 'createdAt', header: 'Tgl Dibuat' },
    {
      key: 'actions',
      header: 'Aksi',
      render: (_, question) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(question);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ✏️ Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteQuestion(question);
            }}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            🗑️ Hapus
          </button>
        </div>
      )
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
      case 'essay':
        return essayColumns;
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
          prompt: question.prompt || question.question || '',
          difficulty: baseDifficulty,
          options: question.mcq_options ? 
            question.mcq_options.map(opt => opt.option_text) :
            (question.options || ['', '', '', '']),
          correctAnswerIndex: correctIndex >= 0 ? correctIndex : 0,
          keyPoints: '',
          maxScore: null,
          isTrue: true
        });
      } else if (activeTab === 'essay') {
        setFormData({
          prompt: question.prompt || question.question || '',
          difficulty: baseDifficulty,
          options: ['', '', '', ''],
          correctAnswerIndex: 0,
          keyPoints: question.key_points || '',
          maxScore: question.max_score || null,
          isTrue: true
        });
      } else if (activeTab === 'true_false') {
        console.log('Opening true_false modal with question:', question); // Debug log
        console.log('is_true value:', question.is_true); // Debug log
        setFormData({
          prompt: question.prompt || question.question || '',
          difficulty: baseDifficulty,
          options: ['', '', '', ''],
          correctAnswerIndex: 0,
          keyPoints: '',
          maxScore: null,
          isTrue: question.is_true !== undefined ? question.is_true : true
        });
        console.log('Set formData.isTrue to:', question.is_true !== undefined ? question.is_true : true); // Debug log
      }
    } else {
      // Creating new question
      setFormData({
        prompt: '',
        difficulty: 'easy',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        keyPoints: '',
        maxScore: null,
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
      keyPoints: '',
      maxScore: null,
      isTrue: true
    });
  };

  const getModalTitle = () => {
    const typeNames = {
      multiple_choice: 'Multiple Choice',
      essay: 'Essay',
      true_false: 'True/False'
    };
    return `${selectedQuestion ? 'Edit' : 'Tambah'} Soal ${typeNames[activeTab]}`;
  };

  const tabs = [
    { id: 'multiple_choice', label: '🔤 Multiple Choice', icon: '🔤' },
    { id: 'essay', label: '📝 Essay', icon: '📝' },
    { id: 'true_false', label: '✅ True/False', icon: '✅' }
  ];

  return (
    <div className="w-full overflow-x-hidden">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">❓ Bank Soal</h2>
          <p className="text-gray-600">Kelola soal berdasarkan tipe</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <Card>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Memuat data soal...</span>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h3>
            <Button onClick={() => handleOpenModal()}>
              ➕ Tambah Soal
            </Button>
          </div>
          
          <Table 
            columns={getCurrentColumns()}
            data={getCurrentData()}
            onRowClick={(question) => handleOpenModal(question)}
          />
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

            <div className="grid grid-cols-2 gap-4">
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
          </div>
        )}

        {/* Essay Form */}
        {activeTab === 'essay' && (
          <div className="space-y-6">
            <Input 
              label="Pertanyaan Essay" 
              placeholder="Masukkan pertanyaan essay"
              value={formData.prompt}
              onChange={(e) => setFormData({...formData, prompt: e.target.value})}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kata Kunci Penting</label>
              <textarea 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Masukkan kata kunci penting yang harus ada dalam jawaban..."
                value={formData.keyPoints}
                onChange={(e) => setFormData({...formData, keyPoints: e.target.value})}
              ></textarea>
              <p className="text-sm text-gray-500 mt-1">💡 Kata kunci yang harus ada dalam jawaban siswa</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skor Maksimal</label>
                <Input
                  type="number"
                  placeholder="Opsional (auto berdasarkan difficulty)"
                  value={formData.maxScore || ''}
                  onChange={(e) => setFormData({...formData, maxScore: e.target.value ? parseInt(e.target.value) : null})}
                />
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
          </div>
        )}

        {/* True/False Form */}
        {activeTab === 'true_false' && (
          <div className="space-y-6">
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