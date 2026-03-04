<?php

/**
 * Opening Stock Controller
 * 
 * Handles opening stock recording operations.
 * Provides endpoints for initial inventory setup.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MovementResource;
use App\Models\Movement;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class OpeningStockController extends Controller
{
    // Record opening stock for multiple products
    public function store(Request $request)
    {
        $validated = $request->validate([
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.qty' => 'required|integer|min:0',
        ]);

        $today = Carbon::today();
        $movements = [];

        foreach ($validated['products'] as $productData) {
            // Check if opening stock already recorded for this product today
            $existing = Movement::where('product_id', $productData['product_id'])
                ->where('type', 'opening')
                ->whereDate('recorded_at', $today)
                ->first();

            if ($existing) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Opening stock already recorded for this Product today',
                    'data' => [],
                ], Response::HTTP_CONFLICT);
            }

            $movements[] = Movement::create([
                'product_id' => $productData['product_id'],
                'type' => 'opening',
                'qty' => $productData['qty'],
                'status' => 'confirmed',
                'recorded_at' => $today,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Opening stock recorded successfully.',
            'data' => MovementResource::collection($movements),
        ], 201);
    }
}
