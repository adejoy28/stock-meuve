<?php

/**
 * Shop Controller
 * 
 * Handles all CRUD operations for Shops.
 * Provides API endpoints for managing shop locations and their archived status.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShopResource;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ShopController extends Controller
{
    // List all non-archived shops
    public function index()
    {
        $shops = Shop::where('archived', false)->get();
        return ShopResource::collection($shops);
    }

    // Create shop
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $shop = Shop::create($validated);
        return new ShopResource($shop);
    }

    // Update shop name
    public function update(Request $request, Shop $shop)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $shop->update($validated);
        return new ShopResource($shop);
    }

    // Archive shop (soft delete)
    public function destroy(Shop $shop)
    {
        $shop->update(['archived' => true]);
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
