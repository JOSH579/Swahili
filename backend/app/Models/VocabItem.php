<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
class VocabItem extends Model
{
    protected $fillable = [
        'lesson_id',
        'swahili',
        'english',
        'sort_order',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function spokenWords(): HasMany
    {
        return $this->hasMany(SpokenWord::class);
    }
}