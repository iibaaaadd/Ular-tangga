<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SnakeLadder extends Model
{
    protected $table = 'snakes_ladders';
    
    protected $fillable = [
        'from_position',
        'to_position', 
        'type',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get all active snakes and ladders
     */
    public static function getActiveSnakesAndLadders(): array
    {
        return self::where('is_active', true)->get()->keyBy('from_position')->toArray();
    }

    /**
     * Check if a position has a snake or ladder
     */
    public static function getSnakeOrLadder(int $position): ?array
    {
        $snakeLadder = self::where('from_position', $position)
            ->where('is_active', true)
            ->first();
            
        return $snakeLadder ? $snakeLadder->toArray() : null;
    }

    /**
     * Get all snakes positions
     */
    public static function getSnakes(): array
    {
        return self::where('type', 'snake')
            ->where('is_active', true)
            ->pluck('to_position', 'from_position')
            ->toArray();
    }

    /**
     * Get all ladders positions
     */
    public static function getLadders(): array
    {
        return self::where('type', 'ladder')
            ->where('is_active', true)
            ->pluck('to_position', 'from_position')
            ->toArray();
    }
}
