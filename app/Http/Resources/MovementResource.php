<?php

/**
 * Movement Resource
 * 
 * Transforms Movement model data for API responses.
 * Returns movement information with nested product and shop data.
 */

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MovementResource extends JsonResource
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
            'type' => $this->type,
            'qty' => (float) $this->qty,
            'status' => $this->status,
            'reason' => $this->reason,
            'note' => $this->note,
            'recorded_at' => $this->recorded_at->toISOString(),
            'product' => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'sku_code' => $this->product->sku_code,
            ],
            'shop' => $this->shop ? [
                'id' => $this->shop->id,
                'name' => $this->shop->name,
            ] : null,
        ];
    }
}
