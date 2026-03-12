<?php

/**
 * Shop Resource
 * 
 * Transforms Shop model data for API responses.
 * Returns shop information including calculated total distributed quantity.
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShopResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Distributions are stored as negative qty — use ABS to get positive count
        $distributionMovements = $this->movements()
            ->where('type', 'distribution')
            ->where('status', 'confirmed');

        $totalDistributed = abs($distributionMovements->sum('qty'));

        // Monetary value = sum of (abs(qty) * cost_price) joined with products
        $totalValue = $this->movements()
            ->where('movements.type', 'distribution')
            ->where('movements.status', 'confirmed')
            ->join('products', 'movements.product_id', '=', 'products.id')
            ->selectRaw('SUM(ABS(movements.qty) * COALESCE(products.cost_price, 0)) as total_value')
            ->value('total_value') ?? 0;

        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'archived'          => $this->archived,
            'total_distributed' => $totalDistributed,
            'total_value'       => (float) $totalValue,
        ];
    }
}
