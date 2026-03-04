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
    // Distribute products to a shop
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shop_id' => 'required|exists:shops,id',
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.qty' => 'required|integer|min:0',
            'note' => 'nullable|string|max:500',
        ]);

        $movements = [];

        foreach ($validated['products'] as $productData) {
            $product = Product::find($productData['product_id']);
            $currentBalance = $product->balance();

            // Check if distribution would make balance negative
            if ($currentBalance < $productData['qty']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient stock for distribution',
                    'data' => [
                        'product_id' => $productData['product_id'],
                        'available' => $currentBalance,
                        'requested' => $productData['qty'],
                    ],
                ], Response::HTTP_CONFLICT);
            }

            $movements[] = Movement::create([
                'product_id' => $productData['product_id'],
                'type' => 'distribution',
                'qty' => -$productData['qty'], // Negative for outgoing
                'shop_id' => $validated['shop_id'],
                'status' => 'confirmed',
                'note' => $validated['note'] ?? null,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Distribution recorded successfully.',
            'data' => MovementResource::collection($movements),
        ], 201);
    }
}
