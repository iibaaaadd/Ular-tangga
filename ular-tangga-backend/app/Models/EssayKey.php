<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EssayKey extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_id',
        'key_points',
        'max_score',
    ];

    protected $casts = [
        'max_score' => 'decimal:2',
    ];

    // Relasi ke Question
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
