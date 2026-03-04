<?php

/**
 * Product Resource
 * 
 * Transforms Product model data for API responses.
 * Returns product information including calculated balance.
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'sku_code' => $this->sku_code,
            'cost_price' => (float) $this->cost_price,
            'balance' => $this->balance(),
        ];
    }
}
