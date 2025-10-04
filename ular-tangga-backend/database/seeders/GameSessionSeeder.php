<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\GameSession;
use App\Models\GameRoom;
use App\Models\Question;

class GameSessionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $gameRooms = GameRoom::whereIn('status', ['playing', 'finished'])->get();

        foreach ($gameRooms as $room) {
            // Get questions for this room's material
            $questions = Question::where('material_id', $room->material_id)
                ->inRandomOrder()
                ->limit(5) // Limit to 5 questions per game
                ->get();

            if ($questions->isEmpty()) {
                continue;
            }

            foreach ($questions as $index => $question) {
                $status = 'waiting';
                $startedAt = null;
                $endedAt = null;

                if ($room->status === 'playing') {
                    // For playing rooms, make first question active, others waiting
                    if ($index === 0) {
                        $status = 'active';
                        $startedAt = now()->subMinutes(rand(1, 10));
                    }
                } elseif ($room->status === 'finished') {
                    // For finished rooms, all questions are finished
                    $status = 'finished';
                    $startedAt = now()->subHours(2)->addMinutes($index * 2);
                    $endedAt = $startedAt->copy()->addMinutes(1);
                }

                GameSession::create([
                    'room_id' => $room->id,
                    'question_id' => $question->id,
                    'question_order' => $index + 1,
                    'status' => $status,
                    'started_at' => $startedAt,
                    'ended_at' => $endedAt,
                    'time_limit' => 30
                ]);
            }
        }
    }
}
