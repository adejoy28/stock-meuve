<?php

/**
 * Product Model
 * 
 * Represents a product in the inventory system.
 * Each product has a unique SKU code and tracks stock balance through movements.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    // Each Product has many movements
    protected $fillable = ['name', 'sku_code', 'cost_price'];

    // Helper: calculate current balance for this Product
    // Balance = sum of all confirmed movements
    public function balance(): float {
        return $this->movements()
            ->where('status', 'confirmed')
            ->sum('qty');
    }

    // Relationship: Product has many movements
    public function movements(): HasMany {
        return $this->hasMany(Movement::class);
    }
}
