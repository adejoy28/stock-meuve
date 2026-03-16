<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MovementResource;
use App\Models\Movement;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class OpeningStockController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'products'                => 'required|array|min:1',
            'products.*.product_id'   => 'required|exists:products,id',
            'products.*.qty'          => 'required|integer|min:0|max:10000',
        ]);

        $today     = Carbon::today();
        $userId    = $request->user()->id;
        $movements = [];

        foreach ($request->products as $productData) {
            // Ensure product belongs to this user
            $product = Product::where('id', $productData['product_id'])
                ->where('user_id', $userId)
                ->first();

            if (!$product) continue; // skip products not owned by user

            // Check if opening already recorded today for this product
            $existing = Movement::where('product_id', $productData['product_id'])
                ->where('user_id', $userId)
                ->where('type', 'opening')
                ->whereDate('recorded_at', $today)
                ->first();

            if ($existing) {
                return response()->json([
                    'status'  => 'error',
                    'message' => "Opening stock already recorded today for {$product->name}.",
                ], Response::HTTP_CONFLICT);
            }

            if ($productData['qty'] === 0) continue; // skip zero-qty products silently

            $movements[] = Movement::create([
                'user_id'     => $userId,
                'product_id'  => $productData['product_id'],
                'type'        => 'opening',
                'qty'         => $productData['qty'],
                'status'      => 'confirmed',
                'recorded_at' => now(),
            ]);
        }

        if (empty($movements)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'No valid products to record.',
            ], 422);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Opening stock recorded successfully.',
            'data'    => MovementResource::collection($movements),
        ], 201);
    }
}
