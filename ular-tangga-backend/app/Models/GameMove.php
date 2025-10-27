<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameMove extends Model
{
    protected $fillable = [
        'game_session_id',
        'player_id',
        'turn_number',
        'dice_value',
        'position_before',
        'position_after_dice',
        'position_final',
        'hit_snake',
        'hit_ladder',
        'snake_ladder_from',
        'snake_ladder_to',
        'question_id',
        'player_answer',
        'is_correct',
        'question_difficulty',
        'bonus_steps',
        'won_game',
        'moved_at'
    ];

    protected $casts = [
        'player_answer' => 'array',
        'hit_snake' => 'boolean',
        'hit_ladder' => 'boolean',
        'is_correct' => 'boolean',
        'won_game' => 'boolean',
        'moved_at' => 'datetime',
    ];

    public function gameSession(): BelongsTo
    {
        return $this->belongsTo(GameSession::class);
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(User::class, 'player_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Create a new move record with question
     */
    public static function createMove(
        int $gameSessionId,
        int $playerId,
        int $turnNumber,
        int $diceValue,
        int $positionBefore,
        int $positionAfterDice,
        int $positionFinal,
        ?array $snakeLadderInfo = null,
        ?int $questionId = null,
        ?array $playerAnswer = null,
        ?bool $isCorrect = null,
        ?string $questionDifficulty = null,
        int $bonusSteps = 0,
        bool $wonGame = false
    ): self {
        return self::create([
            'game_session_id' => $gameSessionId,
            'player_id' => $playerId,
            'turn_number' => $turnNumber,
            'dice_value' => $diceValue,
            'position_before' => $positionBefore,
            'position_after_dice' => $positionAfterDice,
            'position_final' => $positionFinal,
            'hit_snake' => $snakeLadderInfo && $snakeLadderInfo['type'] === 'snake',
            'hit_ladder' => $snakeLadderInfo && $snakeLadderInfo['type'] === 'ladder',
            'snake_ladder_from' => $snakeLadderInfo['from_position'] ?? null,
            'snake_ladder_to' => $snakeLadderInfo['to_position'] ?? null,
            'question_id' => $questionId,
            'player_answer' => $playerAnswer,
            'is_correct' => $isCorrect,
            'question_difficulty' => $questionDifficulty,
            'bonus_steps' => $bonusSteps,
            'won_game' => $wonGame,
            'moved_at' => now()
        ]);
    }

    /**
     * Get bonus steps based on difficulty and correctness
     */
    public static function getBonusSteps(string $difficulty, bool $isCorrect): int
    {
        if (!$isCorrect) return 0;
        
        return match($difficulty) {
            'easy' => 1,
            'medium' => 2,
            'hard' => 3,
            default => 0
        };
    }
}
