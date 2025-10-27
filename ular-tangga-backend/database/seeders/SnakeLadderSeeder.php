<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SnakeLadderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $snakesLadders = [
            // Ladders (good - move up)
            ['from_position' => 3, 'to_position' => 22, 'type' => 'ladder', 'is_active' => true],
            ['from_position' => 5, 'to_position' => 8, 'type' => 'ladder', 'is_active' => true],
            ['from_position' => 11, 'to_position' => 26, 'type' => 'ladder', 'is_active' => true],
            ['from_position' => 17, 'to_position' => 47, 'type' => 'ladder', 'is_active' => true],
            ['from_position' => 19, 'to_position' => 60, 'type' => 'ladder', 'is_active' => true],
            ['from_position' => 21, 'to_position' => 42, 'type' => 'ladder', 'is_active' => true],
            ['from_position' => 27, 'to_position' => 84, 'type' => 'ladder', 'is_active' => true],
            ['from_position' => 51, 'to_position' => 67, 'type' => 'ladder', 'is_active' => true],
            
            // Snakes (bad - move down)
            ['from_position' => 32, 'to_position' => 10, 'type' => 'snake', 'is_active' => true],
            ['from_position' => 36, 'to_position' => 6, 'type' => 'snake', 'is_active' => true],
            ['from_position' => 48, 'to_position' => 26, 'type' => 'snake', 'is_active' => true],
            ['from_position' => 62, 'to_position' => 18, 'type' => 'snake', 'is_active' => true],
            ['from_position' => 88, 'to_position' => 24, 'type' => 'snake', 'is_active' => true],
            ['from_position' => 95, 'to_position' => 56, 'type' => 'snake', 'is_active' => true],
            ['from_position' => 97, 'to_position' => 78, 'type' => 'snake', 'is_active' => true],
        ];

        foreach ($snakesLadders as $item) {
            \App\Models\SnakeLadder::updateOrCreate(
                ['from_position' => $item['from_position']], // Find by this
                [
                    'to_position' => $item['to_position'],
                    'type' => $item['type'],
                    'is_active' => $item['is_active'],
                    'updated_at' => now(),
                ]
            );
        }

        $this->command->info('Snakes and Ladders seeded successfully!');
    }
}
