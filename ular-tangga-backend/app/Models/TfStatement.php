<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TfStatement extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_id',
        'is_true',
    ];

    protected $casts = [
        'is_true' => 'boolean',
    ];

    // Relasi ke Question
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
