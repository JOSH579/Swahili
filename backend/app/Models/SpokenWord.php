<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpokenWord extends Model
{
    protected $fillable = [
        'user_id',
        'vocab_item_id',
        'heard',
        'passed',
    ];

    protected function casts(): array
    {
        return [
            'passed' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vocabItem(): BelongsTo
    {
        return $this->belongsTo(VocabItem::class);
    }
}