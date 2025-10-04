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
        Schema::create('student_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_session_id')->constrained('game_sessions')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->json('answer'); // Jawaban student (fleksibel untuk semua tipe soal)
            $table->boolean('is_correct')->default(false);
            $table->decimal('score', 8, 2)->default(0);
            $table->timestamp('answered_at')->useCurrent();
            $table->integer('answer_time_seconds'); // Waktu yang dibutuhkan untuk menjawab
            $table->timestamps();
            
            // Pastikan satu student hanya bisa menjawab satu kali per session
            $table->unique(['game_session_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_answers');
    }
};
