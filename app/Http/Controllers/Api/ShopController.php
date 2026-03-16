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

class ShopController extends Controller
{
    // index() — filter by user
    public function index(Request $request)
    {
        $shops = Shop::where('user_id', $request->user()->id)
            ->where('archived', false)
            ->get();
        return ShopResource::collection($shops);
    }

    // store() — attach user_id
    public function store(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|max:255']);
        $shop = Shop::create([
            'user_id' => $request->user()->id,
            'name'    => $validated['name'],
        ]);
        return new ShopResource($shop);
    }

    // update() — verify ownership
    public function update(Request $request, Shop $shop)
    {
        abort_if($shop->user_id !== $request->user()->id, 403);
        $validated = $request->validate(['name' => 'required|string|max:255']);
        $shop->update($validated);
        return new ShopResource($shop);
    }

    // destroy() — verify ownership
    public function destroy(Request $request, Shop $shop)
    {
        abort_if($shop->user_id !== $request->user()->id, 403);
        $shop->update(['archived' => true]);
        return response()->json(null, 204);
    }
}
