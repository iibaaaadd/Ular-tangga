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

        // MCQ Questions (15 soal tentang bahasa Jawa)
        $mcqPrompts = [
            ['prompt' => 'Apa jeneng aksara Jawa sing kapisan?', 'options' => ['Na', 'Ha', 'Ca', 'Ra'], 'correct' => 1, 'difficulty' => 'easy'],
            ['prompt' => 'Tembung "nandur" ing basa krama yaiku?', 'options' => ['nanem', 'tandur', 'tetanem', 'nandur'], 'correct' => 2, 'difficulty' => 'medium'],
            ['prompt' => 'Aksara Jawa gunane kanggo nulis basa apa?', 'options' => ['Indonesia', 'Inggris', 'Jawa', 'Arab'], 'correct' => 2, 'difficulty' => 'easy'],
            ['prompt' => 'Apa wujude unggah-ungguh basa sing paling alus?', 'options' => ['Ngoko', 'Madya', 'Krama', 'Krama Inggil'], 'correct' => 3, 'difficulty' => 'medium'],
            ['prompt' => 'Tembung "sare" artine apa?', 'options' => ['mangan', 'turu', 'adus', 'mlaku'], 'correct' => 1, 'difficulty' => 'easy'],
            ['prompt' => 'Sandhangan sing dipasang ing ngisor aksara yaiku?', 'options' => ['Wulu', 'Suku', 'Pepet', 'Taling'], 'correct' => 1, 'difficulty' => 'medium'],
            ['prompt' => 'Geguritan yaiku karya sastra awujud?', 'options' => ['Prosa', 'Puisi', 'Drama', 'Cerkak'], 'correct' => 1, 'difficulty' => 'easy'],
            ['prompt' => 'Aksara murda digunakake kanggo nulis?', 'options' => ['jeneng wong', 'jeneng papan', 'jeneng dina', 'kabeh bener'], 'correct' => 3, 'difficulty' => 'hard'],
            ['prompt' => 'Tembang macapat sing kasebut "Pocung" nduweni guru lagu?', 'options' => ['12u, 6a, 8i, 12a', '7u, 9i, 7a, 7i', '8u, 11i, 8u, 7a', '10u, 10a, 8i, 7a'], 'correct' => 0, 'difficulty' => 'hard'],
            ['prompt' => 'Basa krama alus kanggo "aku" yaiku?', 'options' => ['kula', 'dalem', 'kawula', 'abdi'], 'correct' => 0, 'difficulty' => 'medium'],
            ['prompt' => 'Crita rakyat "Jaka Tarub" nyritakake babagan?', 'options' => ['timun mas', 'bidadari', 'roro jonggrang', 'malin kundang'], 'correct' => 1, 'difficulty' => 'easy'],
            ['prompt' => 'Apa gunane pasangan aksara Jawa?', 'options' => ['hiasan', 'mati aksara', 'ngubah swara', 'tandha wacan'], 'correct' => 1, 'difficulty' => 'medium'],
            ['prompt' => 'Tembung "priyayi" asale saka basa?', 'options' => ['Jawa', 'Sansekerta', 'Arab', 'Kawi'], 'correct' => 1, 'difficulty' => 'hard'],
            ['prompt' => 'Ukara "Adhik tindak sekolah" nggunakake basa?', 'options' => ['Ngoko lugu', 'Ngoko alus', 'Krama lugu', 'Krama alus'], 'correct' => 2, 'difficulty' => 'medium'],
            ['prompt' => 'Sandhangan "cecak" wujude yaiku?', 'options' => ['titik', 'garis', 'kurung', 'cecak'], 'correct' => 0, 'difficulty' => 'easy'],
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

        // True/False Questions (12 soal tentang bahasa Jawa)
        $tfPrompts = [
            ['prompt' => 'Aksara Jawa duwe 20 aksara dhasar.', 'answer' => true, 'difficulty' => 'easy'],
            ['prompt' => 'Basa krama luwih alus tinimbang basa ngoko.', 'answer' => true, 'difficulty' => 'easy'],
            ['prompt' => 'Sandhangan "wulu" dipasang ing dhuwur aksara.', 'answer' => true, 'difficulty' => 'medium'],
            ['prompt' => 'Tembung "turu" ing krama yaiku "sare".', 'answer' => true, 'difficulty' => 'easy'],
            ['prompt' => 'Geguritan lan puisi iku padha wae.', 'answer' => false, 'difficulty' => 'medium'],
            ['prompt' => 'Aksara murda namung kanggo nulis jeneng wong.', 'answer' => false, 'difficulty' => 'medium'],
            ['prompt' => 'Basa Jawa kuno biasane nggunakake aksara Pallawa.', 'answer' => true, 'difficulty' => 'hard'],
            ['prompt' => 'Tembang macapat duwe 11 jinis tembang.', 'answer' => true, 'difficulty' => 'hard'],
            ['prompt' => 'Pasangan aksara dipasang ing sisih tengen aksara.', 'answer' => false, 'difficulty' => 'medium'],
            ['prompt' => 'Crita wayang sumber utamane saka Ramayana lan Mahabharata.', 'answer' => true, 'difficulty' => 'easy'],
            ['prompt' => 'Basa krama inggil luwih dhuwur tinimbang krama alus.', 'answer' => true, 'difficulty' => 'hard'],
            ['prompt' => 'Sandhangan "pepet" kanggo swara "e" taling.', 'answer' => true, 'difficulty' => 'medium'],
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

        // Matching Questions (13 soal tentang bahasa Jawa)
        $matchingPrompts = [
            [
                'prompt' => 'Jodohna aksara Jawa karo jenenge.',
                'pairs' => [
                    ['ꦲ', 'Ha'],
                    ['ꦤ', 'Na'],
                    ['ꦕ', 'Ca'],
                    ['ꦫ', 'Ra']
                ],
                'distractors' => ['Ka', 'Da'],
                'difficulty' => 'easy'
            ],
            [
                'prompt' => 'Jodohna tembung ngoko karo krama.',
                'pairs' => [
                    ['aku', 'kula'],
                    ['kowe', 'panjenengan'],
                    ['mangan', 'dhahar'],
                    ['turu', 'sare']
                ],
                'distractors' => ['tilem', 'nedha'],
                'difficulty' => 'medium'
            ],
            [
                'prompt' => 'Jodohna sandhangan karo jenenge.',
                'pairs' => [
                    ['◌ꦴ', 'taling tarung'],
                    ['◌ꦸ', 'suku'],
                    ['◌ꦶ', 'wulu'],
                    ['◌ꦺ', 'taling']
                ],
                'distractors' => ['pepet', 'cecak'],
                'difficulty' => 'medium'
            ],
            [
                'prompt' => 'Jodohna tembang macapat karo guru lagune.',
                'pairs' => [
                    ['Gambuh', '7u, 10u, 12i, 8u, 8o'],
                    ['Mijil', '10i, 6o, 10e, 10i, 6i, 6u'],
                    ['Sinom', '8a, 8i, 8a, 8i, 7i, 8u, 7a, 8i, 12a'],
                    ['Pocung', '12u, 6a, 8i, 12a']
                ],
                'distractors' => ['8a, 8a, 8a', '12u, 12u, 12u'],
                'difficulty' => 'hard'
            ],
            [
                'prompt' => 'Jodohna tokoh wayang karo watake.',
                'pairs' => [
                    ['Arjuna', 'Satria tampan'],
                    ['Bima', 'Kuat lan gagah'],
                    ['Yudhistira', 'Adil lan wicaksana'],
                    ['Kresna', 'Pinter lan wicaksana']
                ],
                'distractors' => ['Jahat', 'Pengecut'],
                'difficulty' => 'easy'
            ],
            [
                'prompt' => 'Jodohna jinis karya sastra karo conto.',
                'pairs' => [
                    ['Geguritan', 'Dhandhanggula'],
                    ['Cerkak', 'Crita cekak'],
                    ['Novel', 'Durma Gandul'],
                    ['Drama', 'Ketoprak']
                ],
                'distractors' => ['Babad', 'Serat'],
                'difficulty' => 'medium'
            ],
            [
                'prompt' => 'Jodohna wilayah karo dialek basane.',
                'pairs' => [
                    ['Yogyakarta', 'Basa Ngayogyakarta'],
                    ['Surakarta', 'Basa Surakarta'],
                    ['Banyumas', 'Basa Banyumasan'],
                    ['Malang', 'Basa Malangan']
                ],
                'distractors' => ['Basa Betawi', 'Basa Sunda'],
                'difficulty' => 'medium'
            ],
            [
                'prompt' => 'Jodohna upacara adat karo tujuane.',
                'pairs' => [
                    ['Tedak Siten', 'Anak umur 7 lapan'],
                    ['Mitoni', 'Meteng 7 sasi'],
                    ['Siraman', 'Resik sukma'],
                    ['Sungkeman', 'Nyuwun pangestu']
                ],
                'distractors' => ['Nikahan', 'Sunatan'],
                'difficulty' => 'easy'
            ],
            [
                'prompt' => 'Jodohna crita rakyat karo asale.',
                'pairs' => [
                    ['Jaka Tarub', 'Jawa Tengah'],
                    ['Sangkuriang', 'Jawa Barat'],
                    ['Loro Jonggrang', 'Yogyakarta'],
                    ['Timun Mas', 'Jawa Timur']
                ],
                'distractors' => ['Bali', 'Sumatra'],
                'difficulty' => 'medium'
            ],
            [
                'prompt' => 'Jodohna pasangan aksara karo swara sing dipateni.',
                'pairs' => [
                    ['◌꧀ꦏ', 'ka mati'],
                    ['◌꧀ꦠ', 'ta mati'],
                    ['◌꧀ꦤ', 'na mati'],
                    ['◌꧀ꦩ', 'ma mati']
                ],
                'distractors' => ['sa mati', 'la mati'],
                'difficulty' => 'hard'
            ],
            [
                'prompt' => 'Jodohna jinis tembung karo conto.',
                'pairs' => [
                    ['Tembung Aran', 'omah'],
                    ['Tembung Kriya', 'mlaku'],
                    ['Tembung Sifat', 'ayu'],
                    ['Tembung Katrangan', 'cepet']
                ],
                'distractors' => ['sesanti', 'paribasan'],
                'difficulty' => 'easy'
            ],
            [
                'prompt' => 'Jodohna raja Mataram karo gegayuhe.',
                'pairs' => [
                    ['Sultan Agung', 'Mataram Islam'],
                    ['Panembahan Senopati', 'Pendiri Mataram'],
                    ['Amangkurat I', 'Trunajaya'],
                    ['Pakubuwono X', 'Surakarta']
                ],
                'distractors' => ['Majapahit', 'Singasari'],
                'difficulty' => 'hard'
            ],
            [
                'prompt' => 'Jodohna gamelan karo jenise.',
                'pairs' => [
                    ['Slendro', 'Laras 5 nada'],
                    ['Pelog', 'Laras 7 nada'],
                    ['Gendhing', 'Lagu gamelan'],
                    ['Rebab', 'Piranti musik']
                ],
                'distractors' => ['Suling', 'Kendang'],
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
