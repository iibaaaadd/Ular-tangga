import React from 'react';
import { motion } from 'motion/react';
import { Card, Button } from '../../../components/ui';

const QuestionsTab = ({ myQuestions = [], setIsModalOpen, setModalType }) => {
  const getTypeIcon = (type) => {
    switch(type) {
      case 'multiple_choice': return '🔘';
      case 'essay': return '📝';
      case 'true_false': return '✅';
      default: return '❓';
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'multiple_choice': return 'Multiple Choice';
      case 'essay': return 'Essay';
      case 'true_false': return 'True/False';
      default: return 'Unknown';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Mathematics': 'bg-blue-100 text-blue-800',
      'Biology': 'bg-green-100 text-green-800',
      'Geography': 'bg-yellow-100 text-yellow-800',
      'Physics': 'bg-purple-100 text-purple-800',
      'Chemistry': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div
      key="questions"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">📝 Bank Soal Saya</h2>
          <Button onClick={() => {setModalType('question'); setIsModalOpen(true);}}>
            ➕ Tambah Soal Baru
          </Button>
        </div>

        {myQuestions.length > 0 ? (
          <div className="space-y-4">
            {myQuestions.map((question) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getTypeIcon(question.type)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                        {question.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {getTypeLabel(question.type)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {question.question}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📊 Digunakan di {question.usedInRooms} kelas</span>
                      <span className={`font-medium ${
                        question.correctRate >= 80 ? 'text-green-600' : 
                        question.correctRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        ✅ {question.correctRate}% benar
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="small" variant="outline">
                      ✏️ Edit
                    </Button>
                    <Button size="small" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                      🗑️ Hapus
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada soal</h3>
            <p className="text-gray-500 mb-6">Tambah soal pertama untuk mulai membuat kuis!</p>
            <Button onClick={() => {setModalType('question'); setIsModalOpen(true);}}>
              ➕ Tambah Soal Pertama
            </Button>
          </div>
        )}

        {/* Question Statistics */}
        {myQuestions.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center" hoverable={false}>
              <div className="text-2xl mb-2">📊</div>
              <h4 className="text-lg font-bold text-gray-900">
                {myQuestions.length}
              </h4>
              <p className="text-gray-600">Total Soal</p>
            </Card>
            <Card className="text-center" hoverable={false}>
              <div className="text-2xl mb-2">🔘</div>
              <h4 className="text-lg font-bold text-gray-900">
                {myQuestions.filter(q => q.type === 'multiple_choice').length}
              </h4>
              <p className="text-gray-600">Multiple Choice</p>
            </Card>
            <Card className="text-center" hoverable={false}>
              <div className="text-2xl mb-2">📝</div>
              <h4 className="text-lg font-bold text-gray-900">
                {myQuestions.filter(q => q.type === 'essay').length}
              </h4>
              <p className="text-gray-600">Essay</p>
            </Card>
            <Card className="text-center" hoverable={false}>
              <div className="text-2xl mb-2">✅</div>
              <h4 className="text-lg font-bold text-gray-900">
                {Math.round(myQuestions.reduce((sum, q) => sum + q.correctRate, 0) / myQuestions.length)}%
              </h4>
              <p className="text-gray-600">Rata-rata Benar</p>
            </Card>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default QuestionsTab;