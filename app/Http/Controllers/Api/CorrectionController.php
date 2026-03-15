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
            'qty' => 'required|integer|not_in:0', // Cannot be zero
            'shop_id' => 'nullable|exists:shops,id',
            'note' => 'required|string|max:500',
        ]);

        $movement = Movement::create([
            'user_id' => $request->user()->id,
            'product_id' => $validated['product_id'],
            'type' => 'correction',
            'qty' => $validated['qty'],
            'shop_id' => $validated['shop_id'] ?? null,
            'status' => 'confirmed',
            'note' => $validated['note'],
            'recorded_at' => now(),  // ← add this
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Correction recorded successfully.',
            'data' => new MovementResource($movement),
        ], 201);
    }
}
