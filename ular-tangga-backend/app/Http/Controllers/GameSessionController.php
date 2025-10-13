<?php

namespace App\Http\Controllers;

use App\Models\GameSession;
use App\Models\GameRoom;
use App\Models\StudentAnswer;
use App\Models\Question;
use App\Models\McqOption;
use App\Models\TfStatement;
use App\Models\MatchingPair;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GameSessionController extends Controller
{
    /**
     * Get current active question for room
     */
    public function getCurrentQuestion(string $roomCode): JsonResponse
    {
        $room = GameRoom::where('room_code', $roomCode)->first();

        if (!$room) {
            return response()->json([
                'status' => 'error',
                'message' => 'Room not found'
            ], 404);
        }

        $currentSession = GameSession::with(['question'])
            ->where('room_id', $room->id)
            ->where('status', 'active')
            ->first();

        if (!$currentSession) {
            // Check if there's a waiting session to start
            $nextSession = GameSession::with(['question'])
                ->where('room_id', $room->id)
                ->where('status', 'waiting')
                ->orderBy('question_order')
                ->first();

            if (!$nextSession) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'No more questions',
                    'data' => null
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Question ready to start',
                'data' => $nextSession
            ]);
        }

        // Load question details based on subtype
        $question = $currentSession->question;
        $questionData = $this->loadQuestionDetails($question);

        return response()->json([
            'status' => 'success',
            'data' => [
                'session' => $currentSession,
                'question' => $questionData
            ]
        ]);
    }

    /**
     * Start next question (for teachers)
     */
    public function startNextQuestion(string $roomCode): JsonResponse
    {
        $room = GameRoom::where('room_code', $roomCode)
            ->where('teacher_id', Auth::id())
            ->first();

        if (!$room) {
            return response()->json([
                'status' => 'error',
                'message' => 'Room not found or unauthorized'
            ], 404);
        }

        try {
            $hasNextQuestion = false;
            
            DB::transaction(function () use ($room, &$hasNextQuestion) {
                // End current active session
                $currentSession = GameSession::where('room_id', $room->id)
                    ->where('status', 'active')
                    ->first();

                if ($currentSession) {
                    $currentSession->update([
                        'status' => 'finished',
                        'ended_at' => now()
                    ]);

                    // Broadcast question ended with statistics
                    $stats = $this->getQuestionStatistics($currentSession);
                    broadcast(new \App\Events\GameSessionUpdated($room, $currentSession, 'question_ended', [
                        'stats' => $stats
                    ]));
                }

                // Start next waiting session
                $nextSession = GameSession::where('room_id', $room->id)
                    ->where('status', 'waiting')
                    ->orderBy('question_order')
                    ->first();

                if ($nextSession) {
                    $nextSession->update([
                        'status' => 'active',
                        'started_at' => now()
                    ]);

                    // Load question details
                    $questionData = $this->loadQuestionDetails($nextSession->question);
                    $nextSession->question = (object) $questionData;

                    // Broadcast question started
                    broadcast(new \App\Events\GameSessionUpdated($room, $nextSession, 'question_started'));
                    $hasNextQuestion = true;
                } else {
                    // No more questions, finish game
                    $room->update([
                        'status' => 'finished',
                        'finished_at' => now()
                    ]);

                    // Get final leaderboard
                    $leaderboard = $this->getFinalLeaderboard($room);

                    // Broadcast game finished
                    broadcast(new \App\Events\GameSessionUpdated($room, null, 'game_finished', [
                        'leaderboard' => $leaderboard
                    ]));
                }
            });

            return response()->json([
                'status' => 'success',
                'message' => $hasNextQuestion ? 'Next question started' : 'Game finished'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to start next question'
            ], 500);
        }
    }

    /**
     * Submit student answer
     */
    public function submitAnswer(Request $request, string $sessionId): JsonResponse
    {
        $request->validate([
            'answer' => 'required',
            'answer_time_seconds' => 'required|integer|min:1'
        ]);

        $session = GameSession::with('question')->find($sessionId);

        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Session not found'
            ], 404);
        }

        if ($session->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'Session is not active'
            ], 400);
        }

        // Check if student already answered
        $existingAnswer = StudentAnswer::where('game_session_id', $sessionId)
            ->where('student_id', Auth::id())
            ->first();

        if ($existingAnswer) {
            return response()->json([
                'status' => 'error',
                'message' => 'You have already answered this question'
            ], 400);
        }

        try {
            // Calculate score and correctness
            $result = $this->evaluateAnswer($session->question, $request->answer, $request->answer_time_seconds);

            $studentAnswer = StudentAnswer::create([
                'game_session_id' => $sessionId,
                'student_id' => Auth::id(),
                'answer' => $request->answer,
                'is_correct' => $result['is_correct'],
                'score' => $result['score'],
                'answer_time_seconds' => $request->answer_time_seconds
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Answer submitted successfully',
                'data' => [
                    'is_correct' => $result['is_correct'],
                    'score' => $result['score'],
                    'correct_answer' => $result['correct_answer'] ?? null
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to submit answer'
            ], 500);
        }
    }

    /**
     * Load question details based on subtype
     */
    private function loadQuestionDetails(Question $question): array
    {
        $questionData = $question->toArray();

        switch ($question->subtype) {
            case 'mcq':
                $questionData['options'] = McqOption::where('question_id', $question->id)->get();
                break;

            case 'true_false':
                $questionData['tf_statement'] = TfStatement::where('question_id', $question->id)->first();
                break;

            case 'matching':
                $questionData['matching_pairs'] = MatchingPair::where('question_id', $question->id)->get();
                break;
        }

        return $questionData;
    }

    /**
     * Evaluate student answer
     */
    private function evaluateAnswer(Question $question, $answer, int $answerTime): array
    {
        $isCorrect = false;
        $correctAnswer = null;
        $baseScore = $question->base_score;
        $score = 0;

        switch ($question->subtype) {
            case 'mcq':
                $correctOption = McqOption::where('question_id', $question->id)
                    ->where('is_correct', true)
                    ->first();
                $correctAnswer = $correctOption ? $correctOption->id : null;
                $isCorrect = $answer == $correctAnswer;
                break;

            case 'true_false':
                $statement = TfStatement::where('question_id', $question->id)->first();
                $correctAnswer = $statement ? $statement->is_true : null;
                $isCorrect = $answer == $correctAnswer;
                break;

            case 'matching':
                $pairs = MatchingPair::where('question_id', $question->id)->get();
                $correctPairs = $pairs->pluck('right_item', 'left_item')->toArray();
                $correctAnswer = $correctPairs;
                
                // For matching, answer should be an array of pairs
                if (is_array($answer)) {
                    $correctCount = 0;
                    foreach ($answer as $left => $right) {
                        if (isset($correctPairs[$left]) && $correctPairs[$left] == $right) {
                            $correctCount++;
                        }
                    }
                    $isCorrect = $correctCount == count($correctPairs);
                    // Partial scoring for matching
                    $score = ($correctCount / count($correctPairs)) * $baseScore;
                }
                break;
        }

        // Calculate final score with time bonus for MCQ and True/False
        if ($question->subtype !== 'matching') {
            if ($isCorrect) {
                // Time bonus: faster answers get higher scores
                $timeBonus = max(0, (30 - $answerTime) / 30 * 0.5); // Up to 50% bonus
                $score = $baseScore * (1 + $timeBonus);
            }
        }

        return [
            'is_correct' => $isCorrect,
            'score' => round($score, 2),
            'correct_answer' => $correctAnswer
        ];
    }

    /**
     * Get question statistics
     */
    private function getQuestionStatistics(GameSession $session): array
    {
        $answers = StudentAnswer::where('game_session_id', $session->id)->get();
        $totalParticipants = $session->room->participants()->count();
        
        $correctAnswers = $answers->where('is_correct', true)->count();
        $wrongAnswers = $answers->where('is_correct', false)->count();
        $noAnswer = $totalParticipants - $answers->count();

        // Get correct answer text
        $correctAnswerText = $this->getCorrectAnswerText($session->question);

        return [
            'total_participants' => $totalParticipants,
            'answered' => $answers->count(),
            'correct_answers' => $correctAnswers,
            'wrong_answers' => $wrongAnswers,
            'no_answer' => $noAnswer,
            'correct_answer' => $correctAnswerText,
            'accuracy_rate' => $answers->count() > 0 ? round(($correctAnswers / $answers->count()) * 100, 1) : 0,
            'average_time' => $answers->count() > 0 ? round($answers->avg('answer_time_seconds'), 1) : 0
        ];
    }

    /**
     * Get correct answer text for display
     */
    private function getCorrectAnswerText(Question $question): string
    {
        switch ($question->subtype) {
            case 'mcq':
                $correctOption = McqOption::where('question_id', $question->id)
                    ->where('is_correct', true)
                    ->first();
                return $correctOption ? $correctOption->option_text : 'Tidak ditemukan';

            case 'true_false':
                $statement = TfStatement::where('question_id', $question->id)->first();
                return $statement ? ($statement->is_true ? 'Benar' : 'Salah') : 'Tidak ditemukan';

            case 'matching':
                $pairs = MatchingPair::where('question_id', $question->id)->get();
                $pairTexts = [];
                foreach ($pairs as $pair) {
                    $pairTexts[] = "{$pair->left_item} → {$pair->right_item}";
                }
                return implode(', ', $pairTexts);

            default:
                return 'Tipe soal tidak dikenali';
        }
    }

    /**
     * Get final leaderboard for the game
     */
    private function getFinalLeaderboard(GameRoom $room): array
    {
        return DB::table('student_answers')
            ->join('game_sessions', 'student_answers.game_session_id', '=', 'game_sessions.id')
            ->join('users', 'student_answers.student_id', '=', 'users.id')
            ->where('game_sessions.room_id', $room->id)
            ->select(
                'users.id',
                'users.name',
                DB::raw('SUM(student_answers.score) as total_score'),
                DB::raw('COUNT(student_answers.id) as answered_questions'),
                DB::raw('SUM(CASE WHEN student_answers.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers'),
                DB::raw('AVG(student_answers.answer_time_seconds) as avg_time')
            )
            ->groupBy('users.id', 'users.name')
            ->orderBy('total_score', 'desc')
            ->orderBy('correct_answers', 'desc')
            ->orderBy('avg_time', 'asc')
            ->get()
            ->toArray();
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
