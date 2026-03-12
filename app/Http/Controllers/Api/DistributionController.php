<?php

/**
 * Distribution Controller
 * 
 * Handles stock distribution operations to shops.
 * Provides endpoints for transferring inventory to different locations.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MovementResource;
use App\Models\Movement;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DistributionController extends Controller
{
    /**
     * Distribute products to shop
     *
     * Distributes products to a specific shop. Validates that sufficient balance exists before distribution.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shop_id'                    => 'required|exists:shops,id',
            'products'                   => 'required|array|min:1',
            'products.*.product_id'      => 'required|exists:products,id',
            'products.*.qty'             => 'required|integer|min:1',
            'products.*.selling_price'   => 'nullable|numeric|min:0', // ← new, optional
            'note'                       => 'nullable|string|max:500',
        ]);

        $movements = [];

        foreach ($validated['products'] as $productData) {
            $product = Product::find($productData['product_id']);
            $currentBalance = $product->balance();

            // Check sufficient stock
            if ($currentBalance < $productData['qty']) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Insufficient stock for distribution',
                    'data'    => [
                        'product_id' => $productData['product_id'],
                        'available'  => $currentBalance,
                        'requested'  => $productData['qty'],
                    ],
                ], Response::HTTP_CONFLICT);
            }

            // Snapshot the current cost price — frozen forever on this movement
            $unitCost = $product->cost_price ?? null;

            // Use provided selling price, or fall back to cost price if not given
            $sellingPrice = isset($productData['selling_price'])
                ? (float) $productData['selling_price']
                : $unitCost;

            $movements[] = Movement::create([
                'product_id'    => $productData['product_id'],
                'type'          => 'distribution',
                'qty'           => -$productData['qty'],   // Negative = outgoing
                'shop_id'       => $validated['shop_id'],
                'status'        => 'confirmed',
                'note'          => $validated['note'] ?? null,
                'unit_cost'     => $unitCost,              // ← snapshot at time of recording
                'selling_price' => $sellingPrice,          // ← what shop was charged
                'recorded_at'   => now()
            ]);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Distribution recorded successfully.',
            'data'    => MovementResource::collection($movements),
        ], 201);
    }
}
