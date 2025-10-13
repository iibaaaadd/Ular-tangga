<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Material;
use App\Models\Question;
use App\Models\McqOption;
use App\Models\TfStatement;
use App\Models\MatchingPair;
use App\Models\GameRoom;

class GameTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test users if they don't exist
        $teacher = User::firstOrCreate([
            'email' => 'teacher@test.com'
        ], [
            'name' => 'Guru Test',
            'role' => 'teacher',
            'password' => bcrypt('password')
        ]);

        $students = [];
        for ($i = 1; $i <= 5; $i++) {
            $students[] = User::firstOrCreate([
                'email' => "student{$i}@test.com"
            ], [
                'name' => "Siswa Test {$i}",
                'role' => 'student',
                'password' => bcrypt('password')
            ]);
        }

        // Create test material
        $material = Material::firstOrCreate([
            'title' => 'Materi Test Gaming'
        ], [
            'description' => 'Materi untuk testing sistem gaming real-time',
            'pdf_path' => 'materials/test-material.pdf'
        ]);

        // Create Multiple Choice Questions
        $mcqQuestion = Question::firstOrCreate([
            'material_id' => $material->id,
            'prompt' => 'Apa ibu kota Indonesia?'
        ], [
            'subtype' => 'mcq',
            'difficulty' => 'easy',
            'base_score' => 100,
            'created_by' => $teacher->id
        ]);

        McqOption::firstOrCreate([
            'question_id' => $mcqQuestion->id,
            'option_text' => 'Jakarta'
        ], [
            'is_correct' => true
        ]);

        McqOption::firstOrCreate([
            'question_id' => $mcqQuestion->id,
            'option_text' => 'Surabaya'
        ], [
            'is_correct' => false
        ]);

        McqOption::firstOrCreate([
            'question_id' => $mcqQuestion->id,
            'option_text' => 'Bandung'
        ], [
            'is_correct' => false
        ]);

        McqOption::firstOrCreate([
            'question_id' => $mcqQuestion->id,
            'option_text' => 'Medan'
        ], [
            'is_correct' => false
        ]);

        // Create True/False Question
        $tfQuestion = Question::firstOrCreate([
            'material_id' => $material->id,
            'prompt' => 'Indonesia adalah negara kepulauan terbesar di dunia.'
        ], [
            'subtype' => 'true_false',
            'difficulty' => 'easy',
            'base_score' => 80,
            'created_by' => $teacher->id
        ]);

        TfStatement::firstOrCreate([
            'question_id' => $tfQuestion->id
        ], [
            'is_true' => true
        ]);

        // Create Matching Question
        $matchingQuestion = Question::firstOrCreate([
            'material_id' => $material->id,
            'prompt' => 'Cocokkan pulau dengan provinsinya:'
        ], [
            'subtype' => 'matching',
            'difficulty' => 'medium',
            'base_score' => 120,
            'created_by' => $teacher->id
        ]);

        $matchingPairs = [
            ['Jawa Barat', 'Pulau Jawa'],
            ['Sumatera Utara', 'Pulau Sumatera'],
            ['Bali', 'Pulau Bali'],
            ['Sulawesi Selatan', 'Pulau Sulawesi']
        ];

        foreach ($matchingPairs as $pair) {
            MatchingPair::firstOrCreate([
                'question_id' => $matchingQuestion->id,
                'left_item' => $pair[0],
                'right_item' => $pair[1]
            ]);
        }

        // Create additional MCQ questions for variety
        $questions = [
            [
                'prompt' => 'Berapa jumlah provinsi di Indonesia?',
                'options' => [
                    ['34', true],
                    ['33', false],
                    ['35', false],
                    ['32', false]
                ]
            ],
            [
                'prompt' => 'Apa mata uang resmi Indonesia?',
                'options' => [
                    ['Rupiah', true],
                    ['Ringgit', false],
                    ['Peso', false],
                    ['Baht', false]
                ]
            ],
            [
                'prompt' => 'Gunung tertinggi di Indonesia adalah?',
                'options' => [
                    ['Puncak Jaya', true],
                    ['Gunung Kerinci', false],
                    ['Gunung Rinjani', false],
                    ['Gunung Semeru', false]
                ]
            ]
        ];

        foreach ($questions as $questionData) {
            $question = Question::create([
                'material_id' => $material->id,
                'prompt' => $questionData['prompt'],
                'subtype' => 'mcq',
                'difficulty' => 'easy',
                'base_score' => 100,
                'created_by' => $teacher->id
            ]);

            foreach ($questionData['options'] as $optionData) {
                McqOption::create([
                    'question_id' => $question->id,
                    'option_text' => $optionData[0],
                    'is_correct' => $optionData[1]
                ]);
            }
        }

        // Create True/False questions
        $tfQuestions = [
            ['Indonesia memiliki lebih dari 17.000 pulau.', true],
            ['Bahasa Indonesia adalah satu-satunya bahasa yang digunakan di Indonesia.', false],
            ['Indonesia terletak di antara dua benua dan dua samudra.', true],
            ['Jakarta adalah kota terbesar di Asia Tenggara.', true]
        ];

        foreach ($tfQuestions as $tfData) {
            $question = Question::create([
                'material_id' => $material->id,
                'prompt' => $tfData[0],
                'subtype' => 'true_false',
                'difficulty' => 'easy',
                'base_score' => 80,
                'created_by' => $teacher->id
            ]);

            TfStatement::create([
                'question_id' => $question->id,
                'is_true' => $tfData[1]
            ]);
        }

        // Create test room
        GameRoom::firstOrCreate([
            'room_code' => 'TEST01'
        ], [
            'room_name' => 'Room Test Gaming',
            'teacher_id' => $teacher->id,
            'material_id' => $material->id,
            'status' => 'waiting',
            'max_participants' => 30
        ]);

        $this->command->info('Game test data seeded successfully!');
        $this->command->info('Teacher login: teacher@test.com / password');
        $this->command->info('Student login: student1@test.com / password (sampai student5@test.com)');
        $this->command->info('Test room code: TEST01');
    }
}
