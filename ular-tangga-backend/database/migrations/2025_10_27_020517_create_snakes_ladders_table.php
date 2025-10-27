<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('snakes_ladders', function (Blueprint $table) {
            $table->id();
            $table->integer('from_position'); // Starting position (head of snake or bottom of ladder)
            $table->integer('to_position'); // Ending position (tail of snake or top of ladder)
            $table->enum('type', ['snake', 'ladder']); // Type: snake or ladder
            $table->boolean('is_active')->default(true); // Can be used to enable/disable certain snakes/ladders
            $table->timestamps();
            
            // Ensure no duplicate positions
            $table->unique('from_position');
        });

        // Insert default snakes and ladders for a standard 100-square board
        DB::table('snakes_ladders')->insert([
            // Ladders (good - move up)
            ['from_position' => 3, 'to_position' => 22, 'type' => 'ladder', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['from_position' => 5, 'to_position' => 8, 'type' => 'ladder', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['from_position' => 11, 'to_position' => 26, 'type' => 'ladder', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['from_position' => 20, 'to_position' => 29, 'type' => 'ladder', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['from_position' => 17, 'to_position' => 4, 'type' => 'ladder', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['from_position' => 19, 'to_position' => 7, 'type' => 'ladder', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['from_position' => 21, 'to_position' => 9, 'type' => 'ladder', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['from_position' => 27, 'to_position' => 1, 'type' => 'ladder', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            
            // Snakes (bad - move down)
            ['from_position' => 32, 'to_position' => 10, 'type' => 'snake', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['from_position' => 36, 'to_position' => 6, 'type' => 'snake', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['from_position' => 48, 'to_position' => 26, 'type' => 'snake', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['from_position' => 62, 'to_position' => 18, 'type' => 'snake', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['from_position' => 88, 'to_position' => 24, 'type' => 'snake', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['from_position' => 95, 'to_position' => 56, 'type' => 'snake', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['from_position' => 97, 'to_position' => 78, 'type' => 'snake', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('snakes_ladders');
    }
};
