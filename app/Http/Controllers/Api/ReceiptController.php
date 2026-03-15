<?php

/**
 * Receipt Controller
 * 
 * Handles goods receipt operations.
 * Provides endpoints for recording incoming inventory.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MovementResource;
use App\Models\Movement;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReceiptController extends Controller
{
    /**
     * Record goods receipt
     *
     * Records goods receipt for multiple products. Only one receipt per day is allowed across all products.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.qty' => 'required|integer|min:0',
            'note' => 'nullable|string|max:500',
        ]);

        // Check if receipt already recorded today
        $today = Carbon::today();
        $existingReceipt = Movement::where('type', 'receipt')
            ->where('user_id', $request->user()->id)
            ->whereDate('recorded_at', $today)
            ->first();

        if ($existingReceipt) {
            return response()->json([
                'status' => 'error',
                'message' => 'Goods receipt already recorded today',
                'data' => [],
            ], Response::HTTP_CONFLICT);
        }

        $movements = [];

        foreach ($validated['products'] as $productData) {
            $movements[] = Movement::create([
                'user_id' => $request->user()->id,
                'product_id' => $productData['product_id'],
                'type' => 'receipt',
                'qty' => $productData['qty'],
                'status' => 'confirmed',
                'note' => $validated['note'] ?? null,
                'recorded_at' => $today,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Goods receipt recorded successfully.',
            'data' => MovementResource::collection($movements),
        ], 201);
    }
}
