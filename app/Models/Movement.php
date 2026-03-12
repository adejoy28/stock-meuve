<?php

/**
 * Movement Model
 * 
 * Represents stock movements (in/out transactions) for products.
 * Tracks all inventory changes including opening stock, receipts, distributions, and spoils.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Movement extends Model
{
    // Fields that can be mass assigned
    protected $fillable = [
        'product_id', 'type', 'qty', 'shop_id',
        'reason', 'status', 'note', 'recorded_at',
        'unit_cost',       // ← add
        'selling_price',   // ← add
    ];
    
    // Cast recorded_at to datetime and price fields to float
    protected $casts = [
        'recorded_at'   => 'datetime',
        'unit_cost'     => 'float',      // ← add
        'selling_price' => 'float',      // ← add
    ];

    // Relationship: Movement belongs to a Product
    public function product(): BelongsTo {
        return $this->belongsTo(Product::class);
    }
    
    // Relationship: Movement belongs to a Shop
    public function shop(): BelongsTo {
        return $this->belongsTo(Shop::class);
    }
}
