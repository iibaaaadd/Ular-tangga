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
        Schema::create('game_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('game_rooms')->onDelete('cascade');
            $table->string('game_name'); // Name for the game instance
            $table->integer('max_players')->default(4); // Max 4 players per game
            $table->integer('current_players')->default(0); // Current number of players
            $table->json('player_positions')->nullable(); // Track each player's position on board
            $table->json('board_state')->nullable(); // Current state of the game board
            $table->foreignId('current_player_id')->nullable()->constrained('users')->onDelete('set null'); // Whose turn it is
            $table->integer('turn_order')->default(1); // Current turn number
            $table->enum('status', ['waiting', 'active', 'finished'])->default('waiting');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
        });

        // Create game session participants table
        Schema::create('game_session_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_session_id')->constrained('game_sessions')->onDelete('cascade');
            $table->foreignId('participant_id')->constrained('users')->onDelete('cascade');
            $table->integer('player_number')->comment('1-4, player order in the game');
            $table->integer('current_position')->default(0)->comment('Current position on the board (0-100)');
            $table->integer('dice_rolls')->default(0)->comment('Number of times this player has rolled the dice');
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamps();
            
            // Ensure unique player numbers within a game session
            $table->unique(['game_session_id', 'player_number']);
            // Ensure a participant can only be in one game session per room at a time
            $table->unique(['game_session_id', 'participant_id']);
        });

        // Create game moves table
        Schema::create('game_moves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_session_id')->constrained('game_sessions')->onDelete('cascade');
            $table->foreignId('player_id')->constrained('users')->onDelete('cascade');
            $table->integer('turn_number'); // Turn sequence in the game
            $table->integer('dice_value'); // Result of dice roll (1-6)
            $table->integer('position_before'); // Position before this move
            $table->integer('position_after_dice'); // Position after dice roll (before question)
            $table->integer('position_final'); // Final position after question bonus
            
            // Snake and ladder info
            $table->boolean('hit_snake')->default(false); // Did player hit a snake?
            $table->boolean('hit_ladder')->default(false); // Did player hit a ladder?
            $table->integer('snake_ladder_from')->nullable(); // If hit snake/ladder, from which position
            $table->integer('snake_ladder_to')->nullable(); // If hit snake/ladder, to which position
            
            // Question and answer info
            $table->foreignId('question_id')->nullable()->constrained('questions')->onDelete('set null');
            $table->json('player_answer')->nullable(); // Player's answer
            $table->boolean('is_correct')->default(false); // Is answer correct?
            $table->enum('question_difficulty', ['easy', 'medium', 'hard'])->nullable(); // Question difficulty
            $table->integer('bonus_steps')->default(0); // Bonus steps from correct answer (1/2/3)
            
            $table->boolean('won_game')->default(false); // Did this move win the game?
            $table->timestamp('moved_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_moves');
        Schema::dropIfExists('game_session_participants');
        Schema::dropIfExists('game_sessions');
    }
};
