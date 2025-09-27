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
        Schema::create('matching_pairs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->text('left_item'); // Item di sebelah kiri
            $table->text('right_item'); // Item di sebelah kanan
            $table->boolean('is_correct')->default(false); // true jika kiri = kanan (pasangan yang benar)
            $table->integer('order')->default(0); // Untuk mengatur urutan tampilan
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matching_pairs');
    }
};
