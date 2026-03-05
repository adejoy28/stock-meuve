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
            'qty' => 'required|integer|min:1',
            'reason' => 'required|in:damaged,expired,returned',
            'note' => 'nullable|string|max:500',
        ]);

        $movement = Movement::create([
            'product_id' => $validated['product_id'],
            'type' => 'spoil',
            'qty' => -$validated['qty'], // Negative for outgoing
            'reason' => $validated['reason'],
            'status' => 'pending',
            'note' => $validated['note'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Spoil recorded successfully.',
            'data' => new MovementResource($movement),
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
    public function confirm(Movement $movement)
    {
        if ($movement->type !== 'spoil' || $movement->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only pending spoils can be confirmed',
                'data' => [],
            ], 400);
        }

        $movement->update(['status' => 'confirmed']);

        return response()->json([
            'status' => 'success',
            'message' => 'Spoil confirmed successfully.',
            'data' => new MovementResource($movement),
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
    public function reject(Movement $movement)
    {
        if ($movement->type !== 'spoil' || $movement->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only pending spoils can be rejected',
                'data' => [],
            ], 400);
        }

        $movement->update(['status' => 'rejected']);

        return response()->json([
            'status' => 'success',
            'message' => 'Spoil rejected successfully.',
            'data' => new MovementResource($movement),
        ]);
    }
}
