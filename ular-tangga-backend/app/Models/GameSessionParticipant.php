<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameSessionParticipant extends Model
{
    protected $fillable = [
        'game_session_id',
        'participant_id',
        'player_number',
        'current_position',
        'dice_rolls',
        'joined_at'
    ];

    protected $casts = [
        'joined_at' => 'datetime',
    ];

    public function gameSession(): BelongsTo
    {
        return $this->belongsTo(GameSession::class);
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_id');
    }

    /**
     * Check if player has won (reached position 100)
     */
    public function hasWon(): bool
    {
        return $this->current_position >= 100;
    }

    /**
     * Move player to new position
     */
    public function moveToPosition(int $newPosition): void
    {
        $this->update([
            'current_position' => min($newPosition, 100), // Cap at 100
            'dice_rolls' => $this->dice_rolls + 1
        ]);
    }
}
