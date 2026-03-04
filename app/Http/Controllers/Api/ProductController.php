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
    // List all Products with balance
    public function index()
    {
        $products = Product::all();
        return response()->json([
            'status' => 'success',
            'message' => 'Products retrieved successfully.',
            'data' => ProductResource::collection($products),
        ]);
    }

    // Create new Product
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku_code' => 'required|string|unique:products,sku_code',
            'cost_price' => 'nullable|numeric|min:0',
        ]);

        $product = Product::create($validated);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Product created successfully.',
            'data' => new ProductResource($product),
        ], 201);
    }

    // Update Product
    public function update(Request $request, Product $product)
    {
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

    // Delete Product (only if no movements exist)
    public function destroy(Product $product)
    {
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

    // Get specific Product
    public function show(Product $product)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Product retrieved successfully.',
            'data' => new ProductResource($product),
        ]);
    }
}
