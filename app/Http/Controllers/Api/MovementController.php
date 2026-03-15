<?php

/**
 * Movement Controller
 * 
 * Handles listing and basic movement operations.
 * Provides endpoints for viewing and filtering movements.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MovementResource;
use App\Models\Movement;
use Illuminate\Http\Request;

class MovementController extends Controller
{
    /**
     * List movements
     *
     * Returns a list of movements with optional filtering by type, product, shop, status, and date range.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Movement::with(['product', 'shop'])
            ->where('movements.user_id', $request->user()->id); // scope to user

        // Apply filters
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }
        if ($request->has('shop_id')) {
            $query->where('shop_id', $request->shop_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('from')) {
            $query->whereDate('recorded_at', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->whereDate('recorded_at', '<=', $request->to);
        }

        $movements = $query->orderBy('recorded_at', 'desc')->get();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Movements retrieved successfully.',
            'data' => MovementResource::collection($movements),
        ]);
    }
}
