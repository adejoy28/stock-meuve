<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::where('user_id', $request->user()->id)->get();
        return response()->json([
            'status'  => 'success',
            'message' => 'Products retrieved successfully.',
            'data'    => ProductResource::collection($products),
        ]);
    }

    public function store(Request $request)
    {
        $userId = $request->user()->id;

        $request->validate([
            'name'       => [
                'required', 'string', 'max:255',
                // Unique name per user (not globally)
                Rule::unique('products')->where(fn ($q) => $q->where('user_id', $userId)),
            ],
            'sku_code'   => [
                'required', 'string',
                Rule::unique('products')->where(fn ($q) => $q->where('user_id', $userId)),
            ],
            'cost_price' => 'nullable|numeric|min:0',
        ]);

        $product = Product::create([
            'user_id'    => $userId,
            'name'       => $request->name,
            'sku_code'   => $request->sku_code,
            'cost_price' => $request->cost_price,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Product created successfully.',
            'data'    => new ProductResource($product),
        ], 201);
    }

    public function update(Request $request, Product $product)
    {
        abort_if($product->user_id !== $request->user()->id, 403);
        $userId = $request->user()->id;

        $request->validate([
            'name'       => [
                'required', 'string', 'max:255',
                Rule::unique('products')->where(fn ($q) => $q->where('user_id', $userId))->ignore($product->id),
            ],
            'sku_code'   => [
                'required', 'string',
                Rule::unique('products')->where(fn ($q) => $q->where('user_id', $userId))->ignore($product->id),
            ],
            'cost_price' => 'nullable|numeric|min:0',
        ]);

        $product->update($request->only(['name', 'sku_code', 'cost_price']));

        return response()->json([
            'status'  => 'success',
            'message' => 'Product updated successfully.',
            'data'    => new ProductResource($product),
        ]);
    }

    public function destroy(Request $request, Product $product)
    {
        abort_if($product->user_id !== $request->user()->id, 403);

        if ($product->movements()->exists()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Cannot delete a product with existing movements.',
            ], Response::HTTP_CONFLICT);
        }

        $product->delete();
        return response()->json([
            'status'  => 'success',
            'message' => 'Product deleted successfully.',
        ], 204);
    }

    public function show(Request $request, Product $product)
    {
        abort_if($product->user_id !== $request->user()->id, 403);
        return response()->json([
            'status'  => 'success',
            'message' => 'Product retrieved successfully.',
            'data'    => new ProductResource($product),
        ]);
    }
}
