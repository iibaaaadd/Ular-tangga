<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'material_id',
        'prompt',
        'difficulty',
        'base_score',
        'subtype',
        'created_by',
    ];

    protected $casts = [
        'base_score' => 'decimal:2',
    ];

    // Relasi ke User (created_by)
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Relasi ke Material
    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    // Relasi ke MCQ Options
    public function mcqOptions(): HasMany
    {
        return $this->hasMany(McqOption::class);
    }

    // Relasi ke True/False Statement
    public function tfStatement(): HasOne
    {
        return $this->hasOne(TfStatement::class);
    }

    // Relasi ke Matching Pairs
    public function matchingPairs(): HasMany
    {
        return $this->hasMany(MatchingPair::class);
    }

    // Helper methods
    public function isMultipleChoice(): bool
    {
        return $this->subtype === 'mcq';
    }

    public function isTrueFalse(): bool
    {
        return $this->subtype === 'true_false';
    }

    public function isMatching(): bool
    {
        return $this->subtype === 'matching';
    }
}
