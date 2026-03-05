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
        return [
            'id' => $this->id,
            'name' => $this->name,
            'archived' => $this->archived,
            'total_distributed' => abs($this->movements()
                ->where('type', 'distribution')
                ->where('status', 'confirmed')
                ->sum('qty')),
        ];
    }
}
