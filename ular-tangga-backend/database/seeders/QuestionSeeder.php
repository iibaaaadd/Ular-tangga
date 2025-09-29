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

        // Ambil semua materials untuk distribusi soal
        $materials = Material::all();
        if ($materials->isEmpty()) {
            return; // Tidak ada material, skip seeding questions
        }

        // MCQ Questions (15 soal)
        $mcqPrompts = [
            ['prompt' => 'Berapa hasil dari 2 + 2?', 'options' => ['3', '4', '5', '6'], 'correct' => 1, 'difficulty' => 'easy'],
            ['prompt' => 'Siapa presiden pertama Indonesia?', 'options' => ['Soekarno', 'Soeharto', 'Habibie', 'Megawati'], 'correct' => 0, 'difficulty' => 'easy'],
            ['prompt' => 'Berapa hasil dari 5 × 6?', 'options' => ['25', '30', '35', '40'], 'correct' => 1, 'difficulty' => 'easy'],
            ['prompt' => 'Apa ibukota Jepang?', 'options' => ['Osaka', 'Kyoto', 'Tokyo', 'Hiroshima'], 'correct' => 2, 'difficulty' => 'easy'],
            ['prompt' => 'Berapa hasil dari 144 ÷ 12?', 'options' => ['11', '12', '13', '14'], 'correct' => 1, 'difficulty' => 'medium'],
            ['prompt' => 'Siapa penemu telepon?', 'options' => ['Thomas Edison', 'Alexander Graham Bell', 'Nikola Tesla', 'Benjamin Franklin'], 'correct' => 1, 'difficulty' => 'medium'],
            ['prompt' => 'Berapa akar kuadrat dari 81?', 'options' => ['7', '8', '9', '10'], 'correct' => 2, 'difficulty' => 'medium'],
            ['prompt' => 'Dalam sistem periodik, apa simbol untuk emas?', 'options' => ['Go', 'Gd', 'Au', 'Ag'], 'correct' => 2, 'difficulty' => 'medium'],
            ['prompt' => 'Berapa hasil dari sin(90°)?', 'options' => ['0', '0.5', '0.707', '1'], 'correct' => 3, 'difficulty' => 'hard'],
            ['prompt' => 'Siapa yang menulis novel "Laskar Pelangi"?', 'options' => ['Andrea Hirata', 'Pramoedya', 'Tere Liye', 'Dee Lestari'], 'correct' => 0, 'difficulty' => 'medium'],
            ['prompt' => 'Berapa nilai π (pi) hingga 2 desimal?', 'options' => ['3.14', '3.15', '3.16', '3.17'], 'correct' => 0, 'difficulty' => 'easy'],
            ['prompt' => 'Apa nama satelit alami Bumi?', 'options' => ['Mars', 'Venus', 'Bulan', 'Jupiter'], 'correct' => 2, 'difficulty' => 'easy'],
            ['prompt' => 'Berapa jumlah provinsi di Indonesia?', 'options' => ['32', '33', '34', '35'], 'correct' => 2, 'difficulty' => 'medium'],
            ['prompt' => 'Siapa bapak fisika modern?', 'options' => ['Newton', 'Einstein', 'Galileo', 'Planck'], 'correct' => 1, 'difficulty' => 'hard'],
            ['prompt' => 'Berapa hasil dari 2^8?', 'options' => ['128', '256', '512', '1024'], 'correct' => 1, 'difficulty' => 'hard'],
        ];

        foreach ($mcqPrompts as $index => $mcqData) {
            $mcqQuestion = Question::create([
                'material_id' => $materials[$index % $materials->count()]->id,
                'prompt' => $mcqData['prompt'],
                'difficulty' => $mcqData['difficulty'],
                'base_score' => $mcqData['difficulty'] === 'easy' ? 10 : ($mcqData['difficulty'] === 'medium' ? 20 : 30),
                'subtype' => 'mcq',
                'created_by' => $teacher->id,
            ]);

            foreach ($mcqData['options'] as $index => $option) {
                McqOption::create([
                    'question_id' => $mcqQuestion->id,
                    'option_text' => $option,
                    'is_correct' => $index === $mcqData['correct'],
                ]);
            }
        }

        // True/False Questions (12 soal)
        $tfPrompts = [
            ['prompt' => 'Indonesia adalah negara kepulauan terbesar di dunia.', 'answer' => true, 'difficulty' => 'easy'],
            ['prompt' => 'Air mendidih pada suhu 100°C di permukaan laut.', 'answer' => true, 'difficulty' => 'easy'],
            ['prompt' => 'Jakarta adalah ibukota Indonesia.', 'answer' => true, 'difficulty' => 'easy'],
            ['prompt' => 'Matahari terbit dari barat.', 'answer' => false, 'difficulty' => 'easy'],
            ['prompt' => 'Satu tahun memiliki 365 hari.', 'answer' => true, 'difficulty' => 'easy'],
            ['prompt' => 'Fotosintesis terjadi pada malam hari.', 'answer' => false, 'difficulty' => 'medium'],
            ['prompt' => 'DNA memiliki struktur double helix.', 'answer' => true, 'difficulty' => 'medium'],
            ['prompt' => 'Gravitasi di bulan sama dengan di bumi.', 'answer' => false, 'difficulty' => 'medium'],
            ['prompt' => 'Atom terdiri dari proton, neutron, dan elektron.', 'answer' => true, 'difficulty' => 'medium'],
            ['prompt' => 'Kecepatan cahaya dalam vakum adalah konstan.', 'answer' => true, 'difficulty' => 'hard'],
            ['prompt' => 'Energi dapat diciptakan dan dimusnahkan.', 'answer' => false, 'difficulty' => 'hard'],
            ['prompt' => 'Teori relativitas dikemukakan oleh Newton.', 'answer' => false, 'difficulty' => 'hard'],
        ];

        foreach ($tfPrompts as $index => $tfData) {
            $tfQuestion = Question::create([
                'material_id' => $materials[$index % $materials->count()]->id,
                'prompt' => $tfData['prompt'],
                'difficulty' => $tfData['difficulty'],
                'base_score' => $tfData['difficulty'] === 'easy' ? 10 : ($tfData['difficulty'] === 'medium' ? 20 : 30),
                'subtype' => 'true_false',
                'created_by' => $teacher->id,
            ]);

            TfStatement::create([
                'question_id' => $tfQuestion->id,
                'is_true' => $tfData['answer'],
            ]);
        }

        // Matching Questions (13 soal)
        $matchingPrompts = [
            [
                'prompt' => 'Jodohkan negara dengan ibukotanya.',
                'pairs' => [
                    ['Indonesia', 'Jakarta'],
                    ['Malaysia', 'Kuala Lumpur'],
                    ['Thailand', 'Bangkok'],
                    ['Singapura', 'Singapura']
                ],
                'distractors' => ['Manila', 'Hanoi'],
                'difficulty' => 'easy'
            ],
            [
                'prompt' => 'Jodohkan planet dengan cirinya.',
                'pairs' => [
                    ['Mars', 'Planet Merah'],
                    ['Venus', 'Planet Terpanas'],
                    ['Jupiter', 'Planet Terbesar'],
                    ['Saturnus', 'Planet Bercincin']
                ],
                'distractors' => ['Planet Terdingin', 'Planet Terkecil'],
                'difficulty' => 'easy'
            ],
            [
                'prompt' => 'Jodohkan rumus dengan bentuknya.',
                'pairs' => [
                    ['a² + b²', 'Teorema Pythagoras'],
                    ['E = mc²', 'Relativitas Einstein'],
                    ['F = ma', 'Hukum Newton II'],
                    ['PV = nRT', 'Gas Ideal']
                ],
                'distractors' => ['Hukum Ohm', 'Hukum Coulomb'],
                'difficulty' => 'medium'
            ],
            [
                'prompt' => 'Jodohkan unsur dengan simbolnya.',
                'pairs' => [
                    ['Hidrogen', 'H'],
                    ['Oksigen', 'O'],
                    ['Karbon', 'C'],
                    ['Natrium', 'Na']
                ],
                'distractors' => ['K', 'Cl'],
                'difficulty' => 'medium'
            ],
            [
                'prompt' => 'Jodohkan penulis dengan karyanya.',
                'pairs' => [
                    ['Pramoedya', 'Bumi Manusia'],
                    ['Andrea Hirata', 'Laskar Pelangi'],
                    ['Tere Liye', 'Hujan'],
                    ['Dee Lestari', 'Supernova']
                ],
                'distractors' => ['Ronggeng Dukuh Paruk', 'Ayat-Ayat Cinta'],
                'difficulty' => 'medium'
            ],
            [
                'prompt' => 'Jodohkan organ dengan fungsinya.',
                'pairs' => [
                    ['Jantung', 'Memompa Darah'],
                    ['Paru-paru', 'Pertukaran Gas'],
                    ['Ginjal', 'Filter Darah'],
                    ['Hati', 'Detoksifikasi']
                ],
                'distractors' => ['Produksi Hormon', 'Pencernaan'],
                'difficulty' => 'easy'
            ],
            [
                'prompt' => 'Jodohkan bahasa pemrograman dengan paradigmanya.',
                'pairs' => [
                    ['Java', 'Object-Oriented'],
                    ['Haskell', 'Functional'],
                    ['C', 'Procedural'],
                    ['Prolog', 'Logic']
                ],
                'distractors' => ['Assembly', 'Scripting'],
                'difficulty' => 'hard'
            ],
            [
                'prompt' => 'Jodohkan mata uang dengan negaranya.',
                'pairs' => [
                    ['Rupiah', 'Indonesia'],
                    ['Ringgit', 'Malaysia'],
                    ['Peso', 'Filipina'],
                    ['Baht', 'Thailand']
                ],
                'distractors' => ['Vietnam', 'Singapura'],
                'difficulty' => 'easy'
            ],
            [
                'prompt' => 'Jodohkan teknologi dengan pendirinya.',
                'pairs' => [
                    ['Microsoft', 'Bill Gates'],
                    ['Apple', 'Steve Jobs'],
                    ['Facebook', 'Mark Zuckerberg'],
                    ['Tesla', 'Elon Musk']
                ],
                'distractors' => ['Larry Page', 'Jeff Bezos'],
                'difficulty' => 'medium'
            ],
            [
                'prompt' => 'Jodohkan struktur data dengan operasinya.',
                'pairs' => [
                    ['Stack', 'LIFO'],
                    ['Queue', 'FIFO'],
                    ['Array', 'Random Access'],
                    ['Linked List', 'Sequential Access']
                ],
                'distractors' => ['Binary Search', 'Hash Function'],
                'difficulty' => 'hard'
            ],
            [
                'prompt' => 'Jodohkan benua dengan karakteristiknya.',
                'pairs' => [
                    ['Asia', 'Benua Terbesar'],
                    ['Afrika', 'Benua Hitam'],
                    ['Antartika', 'Benua Es'],
                    ['Australia', 'Benua Terkecil']
                ],
                'distractors' => ['Benua Baru', 'Benua Tua'],
                'difficulty' => 'easy'
            ],
            [
                'prompt' => 'Jodohkan algoritma dengan kompleksitasnya.',
                'pairs' => [
                    ['Linear Search', 'O(n)'],
                    ['Binary Search', 'O(log n)'],
                    ['Bubble Sort', 'O(n²)'],
                    ['Merge Sort', 'O(n log n)']
                ],
                'distractors' => ['O(1)', 'O(n³)'],
                'difficulty' => 'hard'
            ],
            [
                'prompt' => 'Jodohkan vitamin dengan fungsinya.',
                'pairs' => [
                    ['Vitamin A', 'Kesehatan Mata'],
                    ['Vitamin C', 'Antioksidan'],
                    ['Vitamin D', 'Penyerapan Kalsium'],
                    ['Vitamin K', 'Pembekuan Darah']
                ],
                'distractors' => ['Metabolisme', 'Pertumbuhan'],
                'difficulty' => 'medium'
            ]
        ];

        foreach ($matchingPrompts as $index => $matchingData) {
            $matchingQuestion = Question::create([
                'material_id' => $materials[$index % $materials->count()]->id,
                'prompt' => $matchingData['prompt'],
                'difficulty' => $matchingData['difficulty'],
                'base_score' => $matchingData['difficulty'] === 'easy' ? 10 : ($matchingData['difficulty'] === 'medium' ? 20 : 30),
                'subtype' => 'matching',
                'created_by' => $teacher->id,
            ]);

            $order = 1;
            
            // Buat pasangan yang benar
            foreach ($matchingData['pairs'] as $pair) {
                MatchingPair::create([
                    'question_id' => $matchingQuestion->id,
                    'left_item' => $pair[0],
                    'right_item' => $pair[1],
                    'is_correct' => true,
                    'order' => $order++,
                ]);
            }

            // Buat distractor (opsi pengecoh)
            foreach ($matchingData['distractors'] as $distractor) {
                MatchingPair::create([
                    'question_id' => $matchingQuestion->id,
                    'left_item' => '',
                    'right_item' => $distractor,
                    'is_correct' => false,
                    'order' => $order++,
                ]);
            }
        }
    }
}
