<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\GameRoom;
use App\Models\User;
use App\Models\Material;

class GameRoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teachers = User::where('role', 'teacher')->get();
        $materials = Material::all();

        if ($teachers->isEmpty() || $materials->isEmpty()) {
            $this->command->info('No teachers or materials found. Please run UserSeeder and create materials first.');
            return;
        }

        // Create sample game rooms
        $roomData = [
            [
                'room_name' => 'Kelas Matematika Dasar',
                'status' => 'waiting',
                'max_participants' => 30
            ],
            [
                'room_name' => 'Quiz Fisika Kelas 10',
                'status' => 'studying',
                'max_participants' => 25
            ],
            [
                'room_name' => 'Ujian Kimia Organik',
                'status' => 'playing',
                'max_participants' => 20
            ],
            [
                'room_name' => 'Latihan Biologi',
                'status' => 'finished',
                'max_participants' => 35,
                'started_at' => now()->subHours(2),
                'finished_at' => now()->subHour(1)
            ]
        ];

        foreach ($roomData as $data) {
            GameRoom::create([
                'room_code' => GameRoom::generateRoomCode(),
                'room_name' => $data['room_name'],
                'teacher_id' => $teachers->random()->id,
                'material_id' => $materials->random()->id,
                'status' => $data['status'],
                'max_participants' => $data['max_participants'],
                'started_at' => $data['started_at'] ?? null,
                'finished_at' => $data['finished_at'] ?? null
            ]);
        }
    }
}
