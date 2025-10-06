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
                'title' => 'Aksara Jawa Nglegena',
                'description' => 'Sinau aksara Jawa dhasar (ha-na-ca-ra-ka) kanggo maca lan nulis tembung-tembung prasaja.',
                'pdf_path' => 'materials/aksara-jawa-nglegena.pdf',
                'is_active' => true,
            ],
            [
                'title' => 'Tembung Kriya lan Aran',
                'description' => 'Ngerteni prabedane tembung kriya (ukara tanduk) lan tembung aran ing basa Jawa.',
                'pdf_path' => 'materials/tembung-kriya-aran.pdf',
                'is_active' => true,
            ],
            [
                'title' => 'Unggah-ungguh Basa',
                'description' => 'Sinau tingkatan basa Jawa: ngoko, madya, lan krama kanggo komunikasi sing sopan.',
                'pdf_path' => 'materials/unggah-ungguh-basa.pdf',
                'is_active' => true,
            ],
            [
                'title' => 'Crita Rakyat Jawa',
                'description' => 'Kumpulan crita rakyat Jawa kaya Timun Mas, Jaka Tarub, lan Loro Jonggrang.',
                'pdf_path' => 'materials/crita-rakyat-jawa.pdf',
                'is_active' => false,
            ],
            [
                'title' => 'Geguritan lan Tembang',
                'description' => 'Sinau nulis geguritan (puisi Jawa) lan tembang dolanan anak Jawa.',
                'pdf_path' => 'materials/geguritan-tembang.pdf',
                'is_active' => true,
            ],
            [
                'title' => 'Pasangan Aksara Jawa',
                'description' => 'Sinau aksara pasangan (sandhangan) kanggo nulis tembung-tembung kompleks.',
                'pdf_path' => 'materials/pasangan-aksara-jawa.pdf',
                'is_active' => true,
            ],
        ];

        foreach ($materials as $material) {
            Material::create($material);
        }
    }
}