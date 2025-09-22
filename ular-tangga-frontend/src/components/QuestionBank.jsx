import React, { useState } from "react";
import { motion } from "motion/react";
import { Card, Button, Modal, Input, Table } from "./ui";

const QuestionBank = () => {
  const [activeTab, setActiveTab] = useState('multiple_choice');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Mock data untuk 3 tipe soal
  const [multipleChoiceQuestions] = useState([
    {
      id: 1,
      question: 'Apa ibu kota Indonesia?',
      options: ['Jakarta', 'Bandung', 'Surabaya', 'Medan'],
      correctAnswer: 'Jakarta',
      difficulty: 'Easy',
      category: 'Geography',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      question: 'Siapa penemu lampu pijar?',
      options: ['Thomas Edison', 'Albert Einstein', 'Isaac Newton', 'Nikola Tesla'],
      correctAnswer: 'Thomas Edison',
      difficulty: 'Medium',
      category: 'Science',
      createdAt: '2024-01-18'
    }
  ]);

  const [essayQuestions] = useState([
    {
      id: 1,
      question: 'Jelaskan proses fotosintesis pada tumbuhan!',
      sampleAnswer: 'Fotosintesis adalah proses pembuatan makanan oleh tumbuhan dengan bantuan cahaya matahari. Proses ini terjadi di kloroplas dengan bahan baku CO2 dan H2O, menghasilkan glukosa dan O2.',
      keywords: ['kloroplas', 'cahaya matahari', 'CO2', 'H2O', 'glukosa', 'O2'],
      difficulty: 'Hard',
      category: 'Biology',
      createdAt: '2024-01-20'
    },
    {
      id: 2,
      question: 'Bagaimana dampak revolusi industri terhadap masyarakat?',
      sampleAnswer: 'Revolusi industri mengubah struktur masyarakat dari agraris ke industri, meningkatkan urbanisasi, menciptakan kelas pekerja baru, dan mengubah pola hidup masyarakat secara drastis.',
      keywords: ['industrialisasi', 'urbanisasi', 'kelas pekerja', 'perubahan sosial'],
      difficulty: 'Hard',
      category: 'History',
      createdAt: '2024-01-22'
    }
  ]);

  const [trueFalseQuestions] = useState([
    {
      id: 1,
      question: 'Jakarta adalah ibu kota Indonesia',
      correctAnswer: true,
      explanation: 'Jakarta memang merupakan ibu kota Indonesia sejak kemerdekaan.',
      difficulty: 'Easy',
      category: 'Geography',
      createdAt: '2024-01-25'
    },
    {
      id: 2,
      question: 'Matahari mengelilingi Bumi',
      correctAnswer: false,
      explanation: 'Yang benar adalah Bumi yang mengelilingi Matahari, bukan sebaliknya.',
      difficulty: 'Medium',
      category: 'Science',
      createdAt: '2024-01-26'
    }
  ]);

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
    { key: 'createdAt', header: 'Tgl Dibuat' }
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
          {keywords.slice(0, 3).map((keyword, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {keyword}
            </span>
          ))}
          {keywords.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              +{keywords.length - 3}
            </span>
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
    { key: 'createdAt', header: 'Tgl Dibuat' }
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
          answer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {answer ? '✅ Benar' : '❌ Salah'}
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
    { key: 'createdAt', header: 'Tgl Dibuat' }
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'multiple_choice':
        return multipleChoiceQuestions;
      case 'essay':
        return essayQuestions;
      case 'true_false':
        return trueFalseQuestions;
      default:
        return [];
    }
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
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
      <div className="space-y-6"
      >
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
            <Button onClick={() => console.log('Save')}>
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
              defaultValue={selectedQuestion?.question || ''}
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
                      defaultChecked={selectedQuestion?.correctAnswer === selectedQuestion?.options?.[index]}
                    />
                    <Input 
                      placeholder={`Pilihan ${String.fromCharCode(65 + index)}`}
                      defaultValue={selectedQuestion?.options?.[index] || ''}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">💡 Pilih radio button untuk menandai jawaban yang benar</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Kategori" 
                placeholder="Contoh: Geography"
                defaultValue={selectedQuestion?.category || ''}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Kesulitan</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedQuestion?.difficulty || 'Easy'}
                >
                  <option value="Easy">😊 Mudah</option>
                  <option value="Medium">🤔 Sedang</option>
                  <option value="Hard">😰 Sulit</option>
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
              defaultValue={selectedQuestion?.question || ''}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contoh Jawaban</label>
              <textarea 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="6"
                placeholder="Masukkan contoh jawaban yang benar/ideal..."
                defaultValue={selectedQuestion?.sampleAnswer || ''}
              ></textarea>
              <p className="text-sm text-gray-500 mt-1">💡 Ini akan digunakan sebagai referensi penilaian</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kata Kunci Penting</label>
              <Input 
                placeholder="Pisahkan dengan koma: kloroplas, cahaya matahari, CO2, H2O"
                defaultValue={selectedQuestion?.keywords?.join(', ') || ''}
              />
              <p className="text-sm text-gray-500 mt-1">💡 Kata kunci yang harus ada dalam jawaban siswa</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Kategori" 
                placeholder="Contoh: Biology"
                defaultValue={selectedQuestion?.category || ''}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Kesulitan</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedQuestion?.difficulty || 'Medium'}
                >
                  <option value="Easy">😊 Mudah</option>
                  <option value="Medium">🤔 Sedang</option>
                  <option value="Hard">😰 Sulit</option>
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
              defaultValue={selectedQuestion?.question || ''}
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
                    defaultChecked={selectedQuestion?.correctAnswer === true}
                  />
                  <span className="text-green-700 font-medium">✅ Benar (True)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="trueFalseAnswer"
                    value="false"
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                    defaultChecked={selectedQuestion?.correctAnswer === false}
                  />
                  <span className="text-red-700 font-medium">❌ Salah (False)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Penjelasan</label>
              <textarea 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Jelaskan mengapa jawaban tersebut benar/salah..."
                defaultValue={selectedQuestion?.explanation || ''}
              ></textarea>
              <p className="text-sm text-gray-500 mt-1">💡 Penjelasan akan ditampilkan setelah siswa menjawab</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Kategori" 
                placeholder="Contoh: Geography"
                defaultValue={selectedQuestion?.category || ''}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Kesulitan</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={selectedQuestion?.difficulty || 'Easy'}
                >
                  <option value="Easy">😊 Mudah</option>
                  <option value="Medium">🤔 Sedang</option>
                  <option value="Hard">😰 Sulit</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </div>
  );
};

export default QuestionBank;