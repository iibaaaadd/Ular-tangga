<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\StudentAnswer;
use App\Models\GameSession;
use App\Models\RoomParticipant;
use App\Models\McqOption;
use App\Models\TfStatement;
use App\Models\MatchingPair;

class StudentAnswerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Only create answers for finished game sessions
        $finishedSessions = GameSession::where('status', 'finished')->get();

        foreach ($finishedSessions as $session) {
            // Get participants of this room
            $participants = RoomParticipant::where('room_id', $session->room_id)->get();

            foreach ($participants as $participant) {
                // 80% chance a student answered
                if (rand(1, 100) <= 80) {
                    $answer = $this->generateAnswer($session->question);
                    
                    StudentAnswer::create([
                        'game_session_id' => $session->id,
                        'student_id' => $participant->student_id,
                        'answer' => $answer['answer'],
                        'is_correct' => $answer['is_correct'],
                        'score' => $answer['score'],
                        'answered_at' => $session->started_at->addSeconds(rand(5, 25)),
                        'answer_time_seconds' => rand(5, 25)
                    ]);
                }
            }
        }
    }

    private function generateAnswer($question): array
    {
        $baseScore = $question->base_score ?? 10;
        $isCorrect = rand(1, 100) <= 70; // 70% chance of correct answer
        
        switch ($question->subtype) {
            case 'mcq':
                $options = McqOption::where('question_id', $question->id)->get();
                if ($isCorrect) {
                    $correctOption = $options->where('is_correct', true)->first();
                    $answer = $correctOption ? $correctOption->id : $options->random()->id;
                } else {
                    $incorrectOptions = $options->where('is_correct', false);
                    $answer = $incorrectOptions->isNotEmpty() ? $incorrectOptions->random()->id : $options->random()->id;
                }
                break;

            case 'true_false':
                $statement = TfStatement::where('question_id', $question->id)->first();
                if ($isCorrect) {
                    $answer = $statement ? $statement->is_true : (bool)rand(0, 1);
                } else {
                    $answer = $statement ? !$statement->is_true : (bool)rand(0, 1);
                }
                break;

            case 'matching':
                $pairs = MatchingPair::where('question_id', $question->id)->get();
                $correctPairs = $pairs->pluck('right_item', 'left_item')->toArray();
                
                if ($isCorrect) {
                    $answer = $correctPairs;
                } else {
                    // Shuffle some answers incorrectly
                    $answer = $correctPairs;
                    $keys = array_keys($answer);
                    if (count($keys) >= 2) {
                        // Swap two random answers
                        $key1 = $keys[rand(0, count($keys) - 1)];
                        $key2 = $keys[rand(0, count($keys) - 1)];
                        $temp = $answer[$key1];
                        $answer[$key1] = $answer[$key2];
                        $answer[$key2] = $temp;
                    }
                }
                break;

            default:
                $answer = null;
        }

        $score = $isCorrect ? $baseScore * (1 + rand(0, 50) / 100) : 0; // Random time bonus

        return [
            'answer' => $answer,
            'is_correct' => $isCorrect,
            'score' => round($score, 2)
        ];
    }
}
