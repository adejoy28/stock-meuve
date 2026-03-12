<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IdempotencyKey extends Model
{
    protected $fillable = ['key', 'route', 'status_code', 'response_body', 'expires_at'];

    protected $casts = ['expires_at' => 'datetime'];

    // Scope to find a valid (non-expired) key
    public function scopeValid($query)
    {
        return $query->where('expires_at', '>', now());
    }
}
