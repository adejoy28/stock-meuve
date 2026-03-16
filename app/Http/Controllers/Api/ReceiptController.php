<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MovementResource;
use App\Models\Movement;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'products'              => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.qty'        => 'required|integer|min:1|max:10000',
            'note'                  => 'nullable|string|max:500',
        ]);

        $userId    = $request->user()->id;
        $movements = [];

        foreach ($request->products as $productData) {
            // Ensure product belongs to this user
            $product = Product::where('id', $productData['product_id'])
                ->where('user_id', $userId)
                ->first();

            if (!$product) continue;

            $movements[] = Movement::create([
                'user_id'     => $userId,
                'product_id'  => $productData['product_id'],
                'type'        => 'receipt',
                'qty'         => $productData['qty'],
                'status'      => 'confirmed',
                'note'        => $request->note ?? null,
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
            'message' => 'Goods receipt recorded successfully.',
            'data'    => MovementResource::collection($movements),
        ], 201);
    }
}
