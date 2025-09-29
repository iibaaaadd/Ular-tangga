<?php

namespace Database\Seeders;

use App\Models\Material;
use Illuminate\Database\Seeder;

class MaterialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $materials = [
            [
                'title' => 'Matematika Dasar - Aljabar',
                'description' => 'Materi pembelajaran aljabar untuk tingkat dasar mencakup operasi bilangan, persamaan linear, dan fungsi.',
                'pdf_path' => 'materials/matematika-dasar-aljabar.pdf',
                'is_active' => true,
            ],
            [
                'title' => 'Bahasa Indonesia - Tata Bahasa',
                'description' => 'Materi tentang tata bahasa Indonesia meliputi struktur kalimat, kata benda, kata kerja, dan ejaan.',
                'pdf_path' => 'materials/bahasa-indonesia-tata-bahasa.pdf',
                'is_active' => true,
            ],
            [
                'title' => 'IPA - Sistem Tata Surya',
                'description' => 'Pembelajaran tentang sistem tata surya, planet-planet, dan fenomena astronomi.',
                'pdf_path' => 'materials/ipa-sistem-tata-surya.pdf',
                'is_active' => true,
            ],
            [
                'title' => 'Sejarah - Kemerdekaan Indonesia',
                'description' => 'Materi sejarah perjuangan kemerdekaan Indonesia dari masa kolonial hingga proklamasi.',
                'pdf_path' => 'materials/sejarah-kemerdekaan-indonesia.pdf',
                'is_active' => false,
            ],
        ];

        foreach ($materials as $material) {
            Material::create($material);
        }
    }
}