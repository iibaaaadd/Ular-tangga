import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Button } from '../ui';
import echo from '../../services/echo';

const GameRoom = ({ 
  room, 
  user, 
  isTeacher, 
  onGameEnd, 
  onLeaveRoom 
}) => {
  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameSession, setGameSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, active, finished
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answerStats, setAnswerStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Specific states for teacher/student
  const [participants, setParticipants] = useState([]);
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [questionStats, setQuestionStats] = useState(null);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Reset all game states
  const resetGameState = useCallback(() => {
    console.log('Resetting game state...');
    
    // Clear all timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    
    // Reset all states
    setCurrentQuestion(null);
    setGameSession(null);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowResults(false);
    setAnswerStats(null);
    setIsLoading(false);
    setGameStatus('waiting');
    startTimeRef.current = null;
    
    console.log('Game state reset completed');
  }, []);

  // Polling untuk get current question dan leaderboard
  const pollGameData = useCallback(async () => {
    if (!room?.room_code) return;

    try {
      // Get current question
      const questionResponse = await fetch(`http://127.0.0.1:8000/api/game-sessions/room/${room.room_code}/current-question`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (questionResponse.ok) {
        const questionData = await questionResponse.json();
        console.log('Question data received:', questionData);
        console.log('Full response structure:', JSON.stringify(questionData, null, 2));
        
        if (questionData.status === 'success' && questionData.data) {
          // Check if data has session and question (active) or just session (waiting)
          if (questionData.data.session) {
            const session = questionData.data.session;
            const question = questionData.data.question;
            
            setGameSession(session);
            setCurrentQuestion(question);
            setCurrentQuestionText(question?.question_text || '');
            setQuestionNumber(session.question_order);
            
            // Update timer if question is active
            if (session.status === 'active' && !isAnswered && question) {
              const elapsed = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
              const remaining = Math.max(0, (session.time_limit || 30) - elapsed);
              console.log('Setting timer from polling - elapsed:', elapsed, 'remaining:', remaining);
              setTimeLeft(remaining);
              setGameStatus('active');
              
              // Set start time for response calculation
              if (!startTimeRef.current) {
                startTimeRef.current = Date.now() - (elapsed * 1000);
              }
            } else if (session.status === 'waiting') {
              setGameStatus('waiting');
              setCurrentQuestion(null);
            }
          } else {
            // Direct session data (legacy format)
            const session = questionData.data;
            setGameSession(session);
            setCurrentQuestion(session.question);
            setCurrentQuestionText(session.question?.question_text || '');
            setQuestionNumber(session.question_order);
            
            if (session.status === 'active' && !isAnswered) {
              const elapsed = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
              const remaining = Math.max(0, (session.time_limit || 30) - elapsed);
              console.log('Setting timer from polling (legacy) - elapsed:', elapsed, 'remaining:', remaining);
              setTimeLeft(remaining);
              setGameStatus('active');
              
              if (!startTimeRef.current) {
                startTimeRef.current = Date.now() - (elapsed * 1000);
              }
            }
          }
        } else if (questionData.status === 'success' && questionData.message === 'Question ready to start') {
          // Waiting sessions available
          console.log('Found waiting questions, ready to start');
          setGameStatus('waiting');
          setCurrentQuestion(null);
        } else {
          // No active question, try to recover
          console.log('No active question found, checking game status...');
          
          // If we were in active state but no question found, something went wrong
          if (gameStatus === 'active') {
            console.log('Game was active but no question found - resetting state');
            resetGameState();
          }
          
          setGameStatus('waiting');
          setCurrentQuestion(null);
        }
      }

      // Get leaderboard (especially for teachers)
      if (isTeacher) {
        const leaderboardResponse = await fetch(`http://127.0.0.1:8000/api/game-rooms/${room.room_code}/leaderboard`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });

        if (leaderboardResponse.ok) {
          const leaderboardData = await leaderboardResponse.json();
          if (leaderboardData.status === 'success') {
            setLeaderboard(leaderboardData.data || []);
          }
        }
      }

      // Get total questions count if not set
      if (totalQuestions === 0) {
        try {
          const roomResponse = await fetch(`http://127.0.0.1:8000/api/game-rooms/${room.room_code}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          });

          if (roomResponse.ok) {
            const roomData = await roomResponse.json();
            if (roomData.status === 'success' && roomData.data?.material?.questions?.length) {
              setTotalQuestions(roomData.data.material.questions.length);
            }
          }
        } catch (error) {
          console.error('Error fetching total questions:', error);
        }
      }
    } catch (error) {
      console.error('Error polling game data:', error);
      
      // Don't retry if component is unmounting or room is invalid
      if (!room?.room_code) {
        console.log('Room invalid, stopping poll retries');
        return;
      }
      
      // If polling fails repeatedly, reduce retry frequency
      const retryDelay = error.name === 'AbortError' ? 1000 : 5000;
      setTimeout(() => {
        console.log('Retrying poll after error...');
        if (room?.room_code) { // Check again before retry
          pollGameData();
        }
      }, retryDelay);
    }
  }, [room?.room_code, isTeacher, isAnswered]);

  // Setup polling
  useEffect(() => {
    if (!room?.room_code) return;
    
    // Clear existing polling interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    
    // Initial poll
    pollGameData();
    
    // Poll every 1 second for real-time updates
    pollIntervalRef.current = setInterval(pollGameData, 1000);
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [pollGameData]);

  useEffect(() => {
    if (!room?.room_code) return;

    const channel = echo.channel(`room.${room.room_code}`);

    // Listen for game session updates
    channel.listen('.game.session.updated', (e) => {
      console.log('Game session update:', e);
      
      if (e.eventType === 'question_started') {
        console.log('Question started event:', e.session);
        
        // Clear any existing timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        setCurrentQuestion(e.session.question);
        setGameSession(e.session);
        setTimeLeft(e.session.time_limit || 30);
        setIsAnswered(false);
        setSelectedAnswer(null);
        setShowResults(false);
        setAnswerStats(null);
        startTimeRef.current = Date.now();
        setGameStatus('active');
        setQuestionNumber(e.session.question_order);
      } else if (e.eventType === 'question_ended') {
        setShowResults(true);
        setAnswerStats(e.data.stats);
        setGameStatus('waiting');
        // Clear current question to show waiting state
        setCurrentQuestion(null);
      } else if (e.eventType === 'game_finished') {
        setGameStatus('finished');
        setLeaderboard(e.data.leaderboard);
        onGameEnd?.();
      }
    });

    // Listen for room updates (game started)
    channel.listen('.room.updated', (e) => {
      console.log('Room update:', e);
      
      if (e.eventType === 'game_started') {
        console.log('Game started event received:', e.data);
        setTotalQuestions(e.data.total_questions);
        
        // If first session is provided, start immediately
        if (e.data.first_session) {
          const session = e.data.first_session;
          setGameSession(session);
          setCurrentQuestion(session.question);
          setCurrentQuestionText(session.question?.question_text || '');
          setQuestionNumber(session.question_order);
          setTimeLeft(session.time_limit || 30);
          setIsAnswered(false);
          setSelectedAnswer(null);
          setShowResults(false);
          setGameStatus('active');
          startTimeRef.current = Date.now();
        }
      }
    });

    return () => {
      try {
        echo.leaveChannel(`room.${room.room_code}`);
      } catch (error) {
        console.error('Error leaving channel:', error);
      }
      
      // Clean up all timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [room?.room_code]);

  // Timer countdown - Fixed race condition
  useEffect(() => {
    console.log('Timer effect triggered:', { gameStatus, hasQuestion: !!currentQuestion, timeLeft, isAnswered });
    
    // Clear any existing timer first
    if (timerRef.current) {
      console.log('Clearing existing timer');
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Don't start timer if conditions not met
    if (gameStatus !== 'active' || !currentQuestion || isAnswered || timeLeft <= 0) {
      console.log('Timer not started:', { 
        gameStatus, 
        hasQuestion: !!currentQuestion, 
        isAnswered, 
        timeLeft 
      });
      return;
    }

    console.log('Starting new timer with timeLeft:', timeLeft);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        console.log('Timer tick, remaining:', prev - 1);
        const newTime = prev - 1;
        
        if (newTime <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          handleTimeUp();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    // Cleanup
    return () => {
      if (timerRef.current) {
        console.log('Clearing timer in cleanup');
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameStatus, currentQuestion?.id, isAnswered, timeLeft]); // Added timeLeft to dependencies

  const handleTimeUp = async () => {
    console.log('Time up! Auto-submitting...');
    
    // Prevent multiple calls
    if (isAnswered) {
      console.log('Already answered, skipping time up handling');
      return;
    }
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setTimeLeft(0);
    setIsAnswered(true);
    
    // Auto-submit empty answer if not answered
    try {
      await submitAnswer(null);
      console.log('Auto-submit completed');
    } catch (error) {
      console.error('Auto-submit error:', error);
    }
    
    // Auto advance to next question (both teacher and student should see this)
    setTimeout(async () => {
      console.log('Auto-advancing after time up...');
      await autoAdvanceToNextQuestion();
    }, 2000);
  };

  const autoAdvanceToNextQuestion = async () => {
    if (!room?.room_code || !gameSession) {
      console.log('Cannot auto-advance: missing room or session');
      return;
    }
    
    try {
      console.log('Auto-advancing to next question for session:', gameSession.id);
      
      const response = await fetch(`http://127.0.0.1:8000/api/game-sessions/room/${room.room_code}/next-question`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      const result = await response.json();
      console.log('Auto advance result:', result);
      
      if (result.status === 'success') {
        console.log('Auto-advance successful, polling for new question...');
        
        // Reset states for next question
        setIsAnswered(false);
        setSelectedAnswer(null);
        setShowResults(false);
        setGameStatus('waiting'); // Set to waiting while loading next question
        
        // Force immediate poll
        await pollGameData();
        
      } else if (result.message === 'Game finished') {
        console.log('Game finished, no more questions');
        setGameStatus('finished');
      } else {
        console.error('Auto-advance failed:', result.message);
      }
    } catch (error) {
      console.error('Error auto-advancing question:', error);
    }
  };

  const submitAnswer = async (answer) => {
    if (isAnswered || !gameSession || isLoading) {
      console.log('Cannot submit answer:', { isAnswered, hasSession: !!gameSession, isLoading });
      return;
    }

    const responseTime = Date.now() - (startTimeRef.current || Date.now());
    setIsAnswered(true);
    setSelectedAnswer(answer);
    setIsLoading(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/game-sessions/${gameSession.id}/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          answer: answer,
          answer_time_seconds: Math.floor(responseTime / 1000) // Convert to seconds
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Submit answer result:', result);
      
      if (result.status === 'success') {
        if (result.data?.is_correct) {
          setScore(prev => prev + (result.data?.score || 0));
        }
        // Show feedback
        setShowResults(true);
        
        // Clear timer when answer is submitted
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Auto-advance after answer submitted (wait 3 seconds)
        setTimeout(async () => {
          console.log('Auto-advancing after answer submitted...');
          try {
            await autoAdvanceToNextQuestion();
          } catch (error) {
            console.error('Auto-advance failed, trying to recover:', error);
            // Fallback: just poll for updates
            setTimeout(() => pollGameData(), 2000);
          }
        }, 3000);
      } else {
        throw new Error(result.message || 'Submit failed');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert(`Gagal mengirim jawaban: ${error.message}`);
      // Reset states on error
      setIsAnswered(false);
      setSelectedAnswer(null);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-6"
        >
          <Button 
            variant="outline" 
            onClick={onLeaveRoom}
            className="flex items-center space-x-2"
          >
            <span>←</span>
            <span>Keluar</span>
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">
              🎮 {room?.room_name}
            </h1>
            <div className="text-sm text-gray-600">
              Soal {questionNumber} dari {totalQuestions}
              <div className="text-xs text-gray-400 mt-1">
                Status: {gameStatus} | Timer: {!!timerRef.current ? 'Running' : 'Stopped'}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">
              🏆 {score} Poin
            </div>
            <div className="text-sm text-gray-600">
              Score Anda
            </div>
          </div>
        </motion.div>

        {/* Different views for Teacher vs Student */}
        {isTeacher ? (
          // Teacher View: Leaderboard Monitoring
          <TeacherGameView
            leaderboard={leaderboard}
            currentQuestion={currentQuestionText}
            questionNumber={questionNumber}
            totalQuestions={totalQuestions}
            gameStatus={gameStatus}
            participants={participants}
            onLeaveRoom={onLeaveRoom}
          />
        ) : (
          // Student View: Question Answering
          <StudentGameView
            currentQuestion={currentQuestion}
            gameSession={gameSession}
            timeLeft={timeLeft}
            selectedAnswer={selectedAnswer}
            isAnswered={isAnswered}
            showResults={showResults}
            score={score}
            questionNumber={questionNumber}
            totalQuestions={totalQuestions}
            gameStatus={gameStatus}
            onSubmitAnswer={submitAnswer}
            onLeaveRoom={onLeaveRoom}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

// Teacher Game View - Leaderboard Monitoring
const TeacherGameView = ({ 
  leaderboard, 
  currentQuestion, 
  questionNumber, 
  totalQuestions,
  gameStatus,
  participants,
  onLeaveRoom
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Leaderboard */}
      <div className="lg:col-span-2">
        <Card className="p-6 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="mr-2">🏆</span>
              Live Leaderboard
            </h2>
            <Button 
              variant="outline" 
              onClick={onLeaveRoom}
              className="text-sm"
            >
              🚪 Keluar
            </Button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {leaderboard.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    index === 0 ? 'bg-yellow-50 border-yellow-200' :
                    index === 1 ? 'bg-gray-50 border-gray-200' :
                    index === 2 ? 'bg-orange-50 border-orange-200' :
                    'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {player.student?.name || player.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {player.correct_answers || 0} jawaban benar
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      {player.total_score || 0}
                    </div>
                    <div className="text-sm text-gray-500">poin</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {leaderboard.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl mb-4"
                >
                  📊
                </motion.div>
                <p>Belum ada data leaderboard</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Current Question Info */}
      <div>
        <Card className="p-6 bg-white/90 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">❓</span>
            Soal Saat Ini
          </h3>
          
          {currentQuestion ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Soal {questionNumber} dari {totalQuestions || '?'}
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-800 leading-relaxed">
                  {currentQuestion.question_text || currentQuestion}
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${gameStatus === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-600">
                  {gameStatus === 'active' ? 'Soal Aktif' : 'Menunggu Soal Berikutnya...'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl mb-2"
              >
                ⏳
              </motion.div>
              <p>Menunggu soal dari sistem...</p>
            </div>
          )}
        </Card>

        {/* Participant Stats */}
        <Card className="p-6 bg-white/90 backdrop-blur-sm mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">👥</span>
            Statistik Peserta
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Peserta:</span>
              <span className="font-semibold">{participants.length || leaderboard.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Yang Menjawab:</span>
              <span className="font-semibold text-green-600">
                {leaderboard.filter(p => p.total_score > 0).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Skor Tertinggi:</span>
              <span className="font-semibold text-purple-600">
                {leaderboard[0]?.total_score || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Student Game View - Question Answering
const StudentGameView = ({
  currentQuestion,
  gameSession,
  timeLeft,
  selectedAnswer,
  isAnswered,
  showResults,
  score,
  questionNumber,
  totalQuestions,
  gameStatus,
  onSubmitAnswer,
  onLeaveRoom,
  isLoading
}) => {
  if (!currentQuestion && gameStatus !== 'finished') {
    return (
      <Card className="p-8 text-center bg-white/90 backdrop-blur-sm">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity }
          }}
          className="text-6xl mb-4"
        >
          ⏳
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Menunggu Soal Berikutnya...
        </h2>
        <p className="text-gray-600 mb-6">
          Guru sedang mempersiapkan soal berikutnya
        </p>
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            onClick={async () => {
              console.log('Manual refresh triggered');
              resetGameState();
              await new Promise(resolve => setTimeout(resolve, 500)); // Wait for reset
              await pollGameData();
            }}
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
          >
            🔄 Refresh Game
          </Button>
          <Button 
            variant="outline" 
            onClick={onLeaveRoom}
          >
            🚪 Keluar Room
          </Button>
        </div>
      </Card>
    );
  }

  if (gameStatus === 'finished') {
    return (
      <Card className="p-8 text-center bg-white/90 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Game Selesai!
        </h2>
        <p className="text-xl text-gray-600 mb-6">
          Skor Akhir Anda: <span className="font-bold text-purple-600">{score} Poin</span>
        </p>
        <Button 
          onClick={onLeaveRoom}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          🏠 Kembali ke Dashboard
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Question Area */}
      <div className="lg:col-span-3">
        <Card className="p-6 bg-white/90 backdrop-blur-sm">
          {/* Timer */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Soal {questionNumber} dari {totalQuestions || '?'}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ 
                  scale: timeLeft <= 5 ? [1, 1.1, 1] : 1,
                  color: timeLeft <= 5 ? ['#000', '#ef4444', '#000'] : '#000'
                }}
                transition={{ duration: 0.5, repeat: timeLeft <= 5 ? Infinity : 0 }}
                className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-blue-600'}`}
              >
                ⏰ {timeLeft}s
              </motion.div>
              
              <Button 
                variant="outline" 
                onClick={onLeaveRoom}
                size="sm"
              >
                🚪 Keluar
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <motion.div
              className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / (gameSession?.time_limit || 30)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Question Content */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {currentQuestion.question_text}
            </h2>

            {/* Render different question types */}
            {currentQuestion.subtype === 'multiple_choice' && (
              <McqAnswerOptions 
                question={currentQuestion}
                selectedAnswer={selectedAnswer}
                isAnswered={isAnswered}
                onAnswer={onSubmitAnswer}
                isLoading={isLoading}
              />
            )}

            {currentQuestion.subtype === 'true_false' && (
              <TrueFalseOptions 
                question={currentQuestion}
                selectedAnswer={selectedAnswer}
                isAnswered={isAnswered}
                onAnswer={onSubmitAnswer}
                isLoading={isLoading}
              />
            )}

            {currentQuestion.subtype === 'matching' && (
              <MatchingOptions 
                question={currentQuestion}
                selectedAnswer={selectedAnswer}
                isAnswered={isAnswered}
                onAnswer={onSubmitAnswer}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Results */}
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-800 mb-2">
                  Jawaban Anda telah dikirim! ✅
                </div>
                <p className="text-blue-600">
                  Menunggu soal berikutnya...
                </p>
              </div>
            </motion.div>
          )}
        </Card>
      </div>

      {/* Sidebar */}
      <div>
        <Card className="p-6 bg-white/90 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Status Anda
          </h3>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {score}
              </div>
              <div className="text-sm text-gray-600">Total Poin</div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Progress:</span>
                <span className="font-semibold">
                  {questionNumber}/{totalQuestions || '?'}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: totalQuestions ? `${(questionNumber / totalQuestions) * 100}%` : '0%' 
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// MCQ Answer Options Component
const McqAnswerOptions = ({ question, selectedAnswer, isAnswered, onAnswer, isLoading }) => {
  return (
    <div className="space-y-3">
      {question.mcq_options?.map((option, index) => (
        <motion.div
          key={option.id}
          whileHover={!isAnswered ? { scale: 1.02 } : {}}
          whileTap={!isAnswered ? { scale: 0.98 } : {}}
        >
          <button
            onClick={() => !isAnswered && !isLoading && onAnswer(option.option_text)}
            disabled={isAnswered || isLoading}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
              selectedAnswer === option.option_text
                ? 'border-blue-500 bg-blue-50'
                : isAnswered
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                selectedAnswer === option.option_text
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-300'
              }`}>
                {String.fromCharCode(65 + index)}
              </div>
              <span className="text-gray-800">{option.option_text}</span>
            </div>
          </button>
        </motion.div>
      ))}
    </div>
  );
};

// True/False Options Component  
const TrueFalseOptions = ({ question, selectedAnswer, isAnswered, onAnswer, isLoading }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
      {['true', 'false'].map((option) => (
        <motion.div
          key={option}
          whileHover={!isAnswered ? { scale: 1.05 } : {}}
          whileTap={!isAnswered ? { scale: 0.95 } : {}}
          className="relative"
        >
          <button
            onClick={() => !isAnswered && !isLoading && onAnswer(option)}
            disabled={isAnswered || isLoading}
            className={`w-full p-8 rounded-xl border-2 transition-all duration-200 ${
              selectedAnswer === option
                ? option === 'true'
                  ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                  : 'border-red-500 bg-red-50 shadow-lg scale-105'
                : isAnswered
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-102'
            }`}
          >
            <div className="text-center">
              <div className="text-5xl mb-3">
                {option === 'true' ? '✅' : '❌'}
              </div>
              <div className="text-xl font-bold">
                {option === 'true' ? 'BENAR' : 'SALAH'}
              </div>
            </div>
          </button>
        </motion.div>
      ))}
    </div>
  );
};

// Matching Options Component (Simplified for now)
const MatchingOptions = ({ question, selectedAnswer, isAnswered, onAnswer, isLoading }) => {
  const [matches, setMatches] = useState({});
  
  const handleMatch = (leftId, rightId) => {
    if (isAnswered || isLoading) return;
    
    const newMatches = { ...matches };
    newMatches[leftId] = rightId;
    setMatches(newMatches);
    
    // Submit when all pairs are matched
    if (Object.keys(newMatches).length === question.matching_pairs?.length) {
      onAnswer(JSON.stringify(newMatches));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-lg font-semibold mb-4 text-gray-800">Kolom A</h4>
        <div className="space-y-3">
          {question.matching_pairs?.map((pair, index) => (
            <div
              key={pair.id}
              className="p-3 border rounded-lg bg-gray-50"
            >
              {pair.left_item}
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-lg font-semibold mb-4 text-gray-800">Kolom B</h4>
        <div className="space-y-3">
          {question.matching_pairs?.map((pair, index) => (
            <button
              key={pair.id}
              onClick={() => handleMatch(pair.id, pair.id)}
              disabled={isAnswered || isLoading}
              className="w-full p-3 text-left border rounded-lg hover:bg-blue-50 transition-colors"
            >
              {pair.right_item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameRoom;