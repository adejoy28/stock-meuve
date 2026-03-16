<?php

/**
 * Correction Controller
 * 
 * Handles stock correction operations.
 * Provides endpoints for inventory adjustments and corrections.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MovementResource;
use App\Models\Movement;
use Illuminate\Http\Request;

class CorrectionController extends Controller
{
    /**
     * Record stock correction
     *
     * Records a stock correction (positive or negative) for inventory adjustments.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'qty'        => 'required|integer|not_in:0|min:-10000|max:10000',
            'shop_id'    => 'nullable|exists:shops,id',
            'note'       => 'required|string|min:5|max:500',
        ]);

        // Ensure product belongs to this user
        $product = \App\Models\Product::where('id', $validated['product_id'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$product) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Product not found.',
            ], 404);
        }

        $movement = Movement::create([
            'user_id'     => $request->user()->id,
            'product_id'  => $validated['product_id'],
            'type'        => 'correction',
            'qty'         => $validated['qty'],
            'shop_id'     => $validated['shop_id'] ?? null,
            'status'      => 'confirmed',
            'note'        => $validated['note'],
            'recorded_at' => now(),
            'recorded_by' => $request->user()->name,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Correction recorded successfully.',
            'data'    => new MovementResource($movement),
        ], 201);
    }
}
