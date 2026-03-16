<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Movement extends Model
{
    protected $fillable = [
        'user_id', 'product_id', 'type', 'qty', 'shop_id',
        'reason', 'status', 'note', 'recorded_at',
        'unit_cost', 'selling_price', 'recorded_by',
    ];

    protected $casts = [
        'recorded_at'   => 'datetime',
        'unit_cost'     => 'float',
        'selling_price' => 'float',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
