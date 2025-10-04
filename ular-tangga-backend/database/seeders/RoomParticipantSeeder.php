<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\RoomParticipant;
use App\Models\GameRoom;
use App\Models\User;

class RoomParticipantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $gameRooms = GameRoom::all();
        $students = User::where('role', 'student')->get();

        if ($gameRooms->isEmpty() || $students->isEmpty()) {
            $this->command->info('No game rooms or students found. Please run GameRoomSeeder and UserSeeder first.');
            return;
        }

        foreach ($gameRooms as $room) {
            // Random number of participants per room (2-8 students)
            $participantCount = rand(2, min(8, $students->count()));
            $selectedStudents = $students->random($participantCount);

            foreach ($selectedStudents as $student) {
                RoomParticipant::create([
                    'room_id' => $room->id,
                    'student_id' => $student->id,
                    'joined_at' => now()->subMinutes(rand(5, 60)),
                    'is_ready' => $room->status !== 'waiting' ? true : (bool)rand(0, 1)
                ]);
            }
        }
    }
}
