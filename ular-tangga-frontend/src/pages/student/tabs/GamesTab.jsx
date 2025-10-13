import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, Button } from '../../../components/ui';
import { gameSessionService } from '../../../services/api';

const GamesTab = ({ gameHistory = [] }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, recent, best

  useEffect(() => {
    fetchGameHistory();
  }, []);

  const fetchGameHistory = async () => {
    try {
      setLoading(true);
      // TODO: Create API endpoint for student's game history
      // For now, using mock data
      const mockGames = [
        {
          id: 1,
          roomName: 'Matematika Dasar',
          gameType: 'Multiple Choice',
          score: 94,
          maxScore: 100,
          rank: 1,
          totalPlayers: 25,
          completedAt: '2 jam yang lalu',
          duration: '15 menit',
          correctAnswers: 18,
          totalQuestions: 20,
          teacher: 'Bu Sarah',
          difficulty: 'Medium'
        },
        {
          id: 2,
          roomName: 'Bahasa Indonesia',
          gameType: 'True/False',
          score: 87,
          maxScore: 100,
          rank: 3,
          totalPlayers: 30,
          completedAt: '1 hari yang lalu',
          duration: '12 menit',
          correctAnswers: 13,
          totalQuestions: 15,
          teacher: 'Pak Ahmad',
          difficulty: 'Easy'
        },
        {
          id: 3,
          roomName: 'Geografi Indonesia',
          gameType: 'Matching',
          score: 98,
          maxScore: 100,
          rank: 1,
          totalPlayers: 22,
          completedAt: '3 hari yang lalu',
          duration: '20 menit',
          correctAnswers: 24,
          totalQuestions: 25,
          teacher: 'Bu Linda',
          difficulty: 'Hard'
        },
        {
          id: 4,
          roomName: 'Matematika Dasar',
          gameType: 'Mixed',
          score: 76,
          maxScore: 100,
          rank: 8,
          totalPlayers: 25,
          completedAt: '1 minggu yang lalu',
          duration: '18 menit',
          correctAnswers: 15,
          totalQuestions: 20,
          teacher: 'Bu Sarah',
          difficulty: 'Hard'
        }
      ];
      setGames(mockGames);
    } catch (error) {
      console.error('Error fetching game history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterGames = () => {
    switch(filter) {
      case 'recent':
        return games.slice(0, 5);
      case 'best':
        return games.sort((a, b) => b.score - a.score).slice(0, 5);
      default:
        return games;
    }
  };
  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '📍';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <motion.div
        key="games"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="games"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            🎮 Riwayat Game
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="ml-3"
            >
              🎯
            </motion.div>
          </h2>
          
          {/* Filter buttons */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="small"
              onClick={() => setFilter('all')}
            >
              Semua
            </Button>
            <Button
              variant={filter === 'recent' ? 'default' : 'outline'}
              size="small"
              onClick={() => setFilter('recent')}
            >
              Terbaru
            </Button>
            <Button
              variant={filter === 'best' ? 'default' : 'outline'}
              size="small"
              onClick={() => setFilter('best')}
            >
              Terbaik
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4">
          {filterGames().map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.01, y: -2 }}
              className={`p-6 rounded-xl border transition-all cursor-pointer ${getScoreColor(game.score)}`}
            >
              <div className="flex items-start justify-between">
                {/* Game Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{getRankIcon(game.rank)}</div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{game.roomName}</h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <span className="mr-2">👨‍🏫</span>
                        {game.teacher}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      📝 {game.gameType}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDifficultyColor(game.difficulty)}`}>
                      ⚡ {game.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                      ⏱️ {game.duration}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-gray-700">Benar</div>
                      <div className="text-green-600">{game.correctAnswers}/{game.totalQuestions}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-700">Akurasi</div>
                      <div className="text-blue-600">{((game.correctAnswers / game.totalQuestions) * 100).toFixed(0)}%</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-700">Peringkat</div>
                      <div className="text-purple-600">#{game.rank} dari {game.totalPlayers}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-700">Waktu</div>
                      <div className="text-gray-600">{game.completedAt}</div>
                    </div>
                  </div>
                </div>

                {/* Score Display */}
                <div className="text-center ml-6">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="bg-white rounded-full w-20 h-20 flex items-center justify-center border-4 border-current shadow-lg"
                  >
                    <div>
                      <div className="text-2xl font-bold">{game.score}</div>
                      <div className="text-xs opacity-75">/{game.maxScore}</div>
                    </div>
                  </motion.div>
                  <div className="mt-2 text-xs font-medium">SKOR</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {games.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada riwayat game</h3>
            <p className="text-gray-500">Mainkan game pertama Anda untuk melihat riwayat di sini!</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default GamesTab;