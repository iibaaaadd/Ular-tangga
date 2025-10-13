<?php

namespace App\Jobs;

use App\Models\GameSession;
use App\Models\GameRoom;
use App\Events\GameSessionUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class AutoAdvanceQuestion implements ShouldQueue
{
    use Queueable;

    protected $sessionId;

    /**
     * Create a new job instance.
     */
    public function __construct($sessionId)
    {
        $this->sessionId = $sessionId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $session = GameSession::with(['room', 'question'])->find($this->sessionId);
        
        if (!$session || $session->status !== 'active') {
            return;
        }

        DB::transaction(function () use ($session) {
            // End current session
            $session->update([
                'status' => 'finished',
                'ended_at' => now()
            ]);

            // Get statistics for broadcast
            $stats = $this->getQuestionStatistics($session);

            // Broadcast question ended
            broadcast(new GameSessionUpdated($session->room, $session, 'question_ended', [
                'stats' => $stats
            ]));

            // Start next question after 3 seconds delay
            $nextSession = GameSession::where('room_id', $session->room_id)
                ->where('status', 'waiting')
                ->orderBy('question_order')
                ->first();

            if ($nextSession) {
                // Start next session immediately for auto flow
                $nextSession->update([
                    'status' => 'active',
                    'started_at' => now()->addSeconds(3)
                ]);

                // Load question details
                $questionData = $this->loadQuestionDetails($nextSession->question);
                $nextSession->question = (object) $questionData;

                // Broadcast question started after delay
                dispatch(function() use ($nextSession) {
                    broadcast(new GameSessionUpdated($nextSession->room, $nextSession, 'question_started'));
                })->delay(now()->addSeconds(3));
                
            } else {
                // No more questions, finish game
                $session->room->update([
                    'status' => 'finished',
                    'finished_at' => now()
                ]);

                // Get final leaderboard
                $leaderboard = $this->getFinalLeaderboard($session->room);

                // Broadcast game finished
                broadcast(new GameSessionUpdated($session->room, null, 'game_finished', [
                    'leaderboard' => $leaderboard
                ]));
            }
        });
    }

    private function getQuestionStatistics(GameSession $session): array
    {
        $answers = $session->studentAnswers;
        $totalParticipants = $session->room->participants()->count();
        
        $correctAnswers = $answers->where('is_correct', true)->count();
        $wrongAnswers = $answers->where('is_correct', false)->count();
        $noAnswer = $totalParticipants - $answers->count();

        return [
            'total_participants' => $totalParticipants,
            'answered' => $answers->count(),
            'correct_answers' => $correctAnswers,
            'wrong_answers' => $wrongAnswers,
            'no_answer' => $noAnswer,
            'accuracy_rate' => $answers->count() > 0 ? round(($correctAnswers / $answers->count()) * 100, 1) : 0
        ];
    }

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
                DB::raw('COUNT(CASE WHEN student_answers.is_correct = 1 THEN 1 END) as correct_answers'),
                DB::raw('COUNT(student_answers.id) as total_answers')
            )
            ->groupBy('users.id', 'users.name')
            ->orderBy('total_score', 'desc')
            ->get()
            ->toArray();
    }

    private function loadQuestionDetails($question): array
    {
        $questionData = [
            'id' => $question->id,
            'question_text' => $question->question_text,
            'type' => $question->type,
            'subtype' => $question->subtype,
        ];

        switch ($question->subtype) {
            case 'multiple_choice':
                $questionData['mcq_options'] = $question->mcqOptions;
                break;
            case 'true_false':
                $questionData['tf_statement'] = $question->tfStatement;
                break;
            case 'matching':
                $questionData['matching_pairs'] = $question->matchingPairs;
                break;
        }

        return $questionData;
    }
}
