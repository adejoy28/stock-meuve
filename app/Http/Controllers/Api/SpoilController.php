<?php

/**
 * Spoil Controller
 * 
 * Handles spoil management operations.
 * Provides endpoints for recording and managing spoiled inventory.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MovementResource;
use App\Models\Movement;
use Illuminate\Http\Request;

class SpoilController extends Controller
{
    /**
     * Record spoil
     *
     * Records a spoil entry with pending status. Requires confirmation before affecting inventory balance.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'qty'        => 'required|integer|min:1|max:10000',
            'reason'     => 'required|in:damaged,expired,returned',
            'note'       => 'nullable|string|max:500',
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
            'type'        => 'spoil',
            'qty'         => -$validated['qty'],
            'reason'      => $validated['reason'],
            'status'      => 'pending',
            'note'        => $validated['note'] ?? null,
            'recorded_at' => now(),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Spoil recorded successfully.',
            'data'    => new MovementResource($movement),
        ], 201);
    }

    /**
     * Confirm spoil
     *
     * Confirms a pending spoil entry, which will affect the inventory balance.
     *
     * @param \App\Models\Movement $movement
     * @return \Illuminate\Http\JsonResponse
     */
    public function confirm(Request $request, $id)
    {
        $movement = Movement::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($movement->type !== 'spoil' || $movement->status !== 'pending') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Only pending spoils can be confirmed.',
            ], 400);
        }

        $movement->update(['status' => 'confirmed']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Spoil confirmed successfully.',
            'data'    => new MovementResource($movement),
        ]);
    }

    /**
     * Reject spoil
     *
     * Rejects a pending spoil entry, which will not affect the inventory balance.
     *
     * @param \App\Models\Movement $movement
     * @return \Illuminate\Http\JsonResponse
     */
    public function reject(Request $request, $id)
    {
        $movement = Movement::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($movement->type !== 'spoil' || $movement->status !== 'pending') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Only pending spoils can be rejected.',
            ], 400);
        }

        $movement->update(['status' => 'rejected']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Spoil rejected successfully.',
            'data'    => new MovementResource($movement),
        ]);
    }
}
