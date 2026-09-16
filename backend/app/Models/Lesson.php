<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
    ];

    public function vocabItems(): HasMany
    {
        return $this->hasMany(VocabItem::class)->orderBy('sort_order');
    }
}