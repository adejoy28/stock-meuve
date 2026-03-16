<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MovementResource;
use App\Models\Movement;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DistributionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shop_id'                  => 'required|exists:shops,id',
            'products'                 => 'required|array|min:1',
            'products.*.product_id'    => 'required|exists:products,id',
            'products.*.qty'           => 'required|integer|min:1|max:10000', // min:1 not 0
            'products.*.selling_price' => 'nullable|numeric|min:0',
            'note'                     => 'nullable|string|max:500',
        ]);

        // Verify shop belongs to this user
        $shop = \App\Models\Shop::where('id', $validated['shop_id'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$shop) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Shop not found.',
            ], 404);
        }

        $movements = [];

        // Wrap in a transaction so partial failures roll back
        DB::transaction(function () use ($validated, $request, &$movements) {
            foreach ($validated['products'] as $productData) {

                // Lock the row to prevent concurrent over-distribution
                $product = Product::where('id', $productData['product_id'])
                    ->where('user_id', $request->user()->id)
                    ->lockForUpdate()
                    ->first();

                if (!$product) {
                    abort(404, 'Product not found.');
                }

                $currentBalance = $product->balance();

                if ($currentBalance < $productData['qty']) {
                    abort(409,
                        "Insufficient stock for {$product->name}. " .
                        "Available: {$currentBalance}, requested: {$productData['qty']}."
                    );
                }

                $unitCost     = $product->cost_price ?? null;
                $sellingPrice = isset($productData['selling_price'])
                    ? (float) $productData['selling_price']
                    : $unitCost;

                $movements[] = Movement::create([
                    'user_id'       => $request->user()->id,
                    'product_id'    => $productData['product_id'],
                    'type'          => 'distribution',
                    'qty'           => -$productData['qty'],
                    'shop_id'       => $validated['shop_id'],
                    'status'        => 'confirmed',
                    'note'          => $validated['note'] ?? null,
                    'unit_cost'     => $unitCost,
                    'selling_price' => $sellingPrice,
                    'recorded_at'   => now(),
                    'recorded_by'   => $request->user()->name,
                ]);
            }
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Distribution recorded successfully.',
            'data'    => MovementResource::collection($movements),
        ], 201);
    }
}
