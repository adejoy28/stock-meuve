<?php

/**
 * Shop Model
 * 
 * Represents a shop/location in the inventory system.
 * Tracks shop information and archived status for soft deletes.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shop extends Model
{
    // Fields that can be mass assigned
    protected $fillable = ['name', 'archived'];
    
    // Cast archived to boolean
    protected $casts = ['archived' => 'boolean'];

    // Relationship: Shop has many movements
    public function movements(): HasMany {
        return $this->hasMany(Movement::class);
    }
}
