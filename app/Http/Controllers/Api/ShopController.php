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
    /**
     * List all shops
     *
     * Returns a list of all non-archived shops with their total distributed amounts.
     *
     * @return \App\Http\Resources\ShopResource
     */
    public function index(Request $request)
    {
        $query = Shop::query();
        
        // Include archived if requested
        if (!$request->boolean('include_archived')) {
            $query->where('archived', false);
        }
        
        return ShopResource::collection($query->get());
    }

    /**
     * Create shop
     *
     * Creates a new shop with the provided name.
     *
     * @param \Illuminate\Http\Request $request
     * @return \App\Http\Resources\ShopResource
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $shop = Shop::create($validated);
        return new ShopResource($shop);
    }

    /**
     * Update shop
     *
     * Updates the specified shop's name.
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\Shop $shop
     * @return \App\Http\Resources\ShopResource
     */
    public function update(Request $request, Shop $shop)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $shop->update($validated);
        return new ShopResource($shop);
    }

    /**
     * Archive shop
     *
     * Archives the specified shop (soft delete). Archived shops won't appear in the main list.
     *
     * @param \App\Models\Shop $shop
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Shop $shop)
    {
        $shop->update(['archived' => true]);
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
