<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiQuery extends Model
{
    protected $fillable = [
        'type',
        'question',
        'answer',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];
}
