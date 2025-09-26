<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Question;
use App\Models\McqOption;
use App\Models\TfStatement;
use App\Models\EssayKey;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil user dengan role teacher untuk menjadi creator
        $teacher = User::where('role', 'teacher')->first();
        
        if (!$teacher) {
            // Buat teacher jika belum ada
            $teacher = User::factory()->create([
                'name' => 'Teacher Demo',
                'email' => 'teacher@demo.com',
                'role' => 'teacher',
            ]);
        }

        // 1. Multiple Choice Question
        $mcqQuestion = Question::create([
            'prompt' => 'Berapa hasil dari 2 + 2?',
            'difficulty' => 'easy',
            'base_score' => 10,
            'subtype' => 'mcq',
            'created_by' => $teacher->id,
        ]);

        McqOption::create([
            'question_id' => $mcqQuestion->id,
            'option_text' => '3',
            'is_correct' => false,
        ]);

        McqOption::create([
            'question_id' => $mcqQuestion->id,
            'option_text' => '4',
            'is_correct' => true,
        ]);

        McqOption::create([
            'question_id' => $mcqQuestion->id,
            'option_text' => '5',
            'is_correct' => false,
        ]);

        McqOption::create([
            'question_id' => $mcqQuestion->id,
            'option_text' => '6',
            'is_correct' => false,
        ]);

        // 2. True/False Question
        $tfQuestion = Question::create([
            'prompt' => 'Indonesia adalah negara kepulauan terbesar di dunia.',
            'difficulty' => 'medium',
            'base_score' => 15,
            'subtype' => 'true_false',
            'created_by' => $teacher->id,
        ]);

        TfStatement::create([
            'question_id' => $tfQuestion->id,
            'is_true' => true,
        ]);

        // 3. Essay Question
        $essayQuestion = Question::create([
            'prompt' => 'Jelaskan proses fotosintesis pada tumbuhan beserta faktor-faktor yang mempengaruhinya.',
            'difficulty' => 'hard',
            'base_score' => 25,
            'subtype' => 'essay',
            'created_by' => $teacher->id,
        ]);

        EssayKey::create([
            'question_id' => $essayQuestion->id,
            'key_points' => 'Poin kunci: 1) Definisi fotosintesis, 2) Tempat terjadinya (kloroplas), 3) Bahan yang dibutuhkan (CO2, H2O, cahaya), 4) Hasil (glukosa dan O2), 5) Faktor yang mempengaruhi (intensitas cahaya, suhu, konsentrasi CO2)',
            'max_score' => 25,
        ]);

        // 4. MCQ Math Question
        $mathQuestion = Question::create([
            'prompt' => 'Jika x = 5, berapa nilai dari 3x + 7?',
            'difficulty' => 'medium',
            'base_score' => 15,
            'subtype' => 'mcq',
            'created_by' => $teacher->id,
        ]);

        McqOption::create([
            'question_id' => $mathQuestion->id,
            'option_text' => '22',
            'is_correct' => true,
        ]);

        McqOption::create([
            'question_id' => $mathQuestion->id,
            'option_text' => '20',
            'is_correct' => false,
        ]);

        McqOption::create([
            'question_id' => $mathQuestion->id,
            'option_text' => '18',
            'is_correct' => false,
        ]);

        McqOption::create([
            'question_id' => $mathQuestion->id,
            'option_text' => '25',
            'is_correct' => false,
        ]);

        // 5. True/False Science Question
        $scienceQuestion = Question::create([
            'prompt' => 'Air mendidih pada suhu 100°C di permukaan laut.',
            'difficulty' => 'easy',
            'base_score' => 10,
            'subtype' => 'true_false',
            'created_by' => $teacher->id,
        ]);

        TfStatement::create([
            'question_id' => $scienceQuestion->id,
            'is_true' => true,
        ]);
    }
}
