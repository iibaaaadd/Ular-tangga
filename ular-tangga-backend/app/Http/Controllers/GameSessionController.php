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
            DB::transaction(function () use ($room) {
                // End current active session
                GameSession::where('room_id', $room->id)
                    ->where('status', 'active')
                    ->update([
                        'status' => 'finished',
                        'ended_at' => now()
                    ]);

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
                } else {
                    // No more questions, finish game
                    $room->update([
                        'status' => 'finished',
                        'finished_at' => now()
                    ]);
                }
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Next question started'
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
                $questionData['statement'] = TfStatement::where('question_id', $question->id)->first();
                break;

            case 'matching':
                $questionData['pairs'] = MatchingPair::where('question_id', $question->id)->get();
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
