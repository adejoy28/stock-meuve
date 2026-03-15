<?php

/**
 * Product Controller
 * 
 * Handles all CRUD operations for Products.
 * Provides API endpoints for creating, reading, updating, and deleting products.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * List all products
     *
     * Returns a list of all products with their current balance.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $products = Product::where('user_id', $request->user()->id)->get();
        return response()->json([
            'status' => 'success',
            'message' => 'Products retrieved successfully.',
            'data' => ProductResource::collection($products),
        ]);
    }

    /**
     * Create new product
     *
     * Creates a new product with the provided details.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku_code' => 'required|string|unique:products,sku_code',
            'cost_price' => 'nullable|numeric|min:0',
        ]);

        $validated['user_id'] = $request->user()->id;
        $product = Product::create($validated);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Product created successfully.',
            'data' => new ProductResource($product),
        ], 201);
    }

    /**
     * Update product
     *
     * Updates the specified product with the provided details.
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\Product $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Product $product)
    {
        abort_if($product->user_id !== $request->user()->id, 403, 'Unauthorized');
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku_code' => [
                'required',
                'string',
                Rule::unique('products', 'sku_code')->ignore($product->id),
            ],
            'cost_price' => 'nullable|numeric|min:0',
        ]);

        $product->update($validated);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Product updated successfully.',
            'data' => new ProductResource($product),
        ]);
    }

    /**
     * Delete product
     *
     * Deletes the specified product. Only allowed if no movements exist for this product.
     *
     * @param \App\Models\Product $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, Product $product)
    {
        abort_if($product->user_id !== $request->user()->id, 403, 'Unauthorized');
        
        if ($product->movements()->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot delete Product with existing movements',
                'data' => [],
            ], Response::HTTP_CONFLICT);
        }

        $product->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Product deleted successfully.',
            'data' => [],
        ], 204);
    }

    /**
     * Get specific product
     *
     * Returns the details of the specified product including current balance.
     *
     * @param \App\Models\Product $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, Product $product)
    {
        abort_if($product->user_id !== $request->user()->id, 403, 'Unauthorized');
        
        return response()->json([
            'status' => 'success',
            'message' => 'Product retrieved successfully.',
            'data' => new ProductResource($product),
        ]);
    }
}
