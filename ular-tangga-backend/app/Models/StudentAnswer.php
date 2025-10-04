<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentAnswer extends Model
{
    protected $fillable = [
        'game_session_id',
        'student_id',
        'answer',
        'is_correct',
        'score',
        'answered_at',
        'answer_time_seconds'
    ];

    protected $casts = [
        'answer' => 'array',
        'is_correct' => 'boolean',
        'answered_at' => 'datetime',
        'score' => 'decimal:2',
    ];

    public function gameSession(): BelongsTo
    {
        return $this->belongsTo(GameSession::class, 'game_session_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
