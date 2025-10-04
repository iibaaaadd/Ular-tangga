<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('game_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_code', 6)->unique(); // Kode room untuk join
            $table->string('room_name'); // Nama room
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade'); // Guru yang membuat room
            $table->foreignId('material_id')->constrained('materials')->onDelete('cascade'); // Materi yang dipilih
            $table->enum('status', ['waiting', 'studying', 'playing', 'finished'])->default('waiting');
            $table->integer('max_participants')->default(50);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_rooms');
    }
};
