<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchingPair extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_id',
        'left_item',
        'right_item',
        'is_correct',
        'order',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'order' => 'integer',
    ];

    // Relasi ke Question
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    // Scope untuk mendapatkan pasangan yang benar
    public function scopeCorrectPairs($query)
    {
        return $query->where('is_correct', true);
    }

    // Scope untuk mendapatkan pasangan berdasarkan urutan
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}