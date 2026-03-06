<?php

/**
 * Report Controller
 * 
 * Handles all reporting operations for inventory analytics.
 * Provides endpoints for summary, by-shop, by-product, and spoil reports.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Movement;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    // Get date range - custom from/to takes priority over period
    private function getDateRange(Request $request): array
    {
        $period = $request->get('period', 'today');

        // Custom date range takes priority over period
        if ($request->has('from') && $request->has('to')) {
            return [
                'start' => Carbon::parse($request->from)->startOfDay(),
                'end'   => Carbon::parse($request->to)->endOfDay(),
            ];
        }

        $now = Carbon::now();

        $start = match($period) {
            'today' => $now->copy()->startOfDay(),
            'week'  => $now->copy()->startOfWeek(),
            'month' => $now->copy()->startOfMonth(),
            'all'   => Carbon::createFromTimestamp(0),
            default => $now->copy()->startOfDay(),
        };

        return [
            'start' => $start,
            'end'   => $now->copy()->endOfDay(),
        ];
    }

    /**
     * Summary report
     *
     * Returns a summary report of all inventory movements for the specified period.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function summary(Request $request)
    {
        $range = $this->getDateRange($request);

        $movements = Movement::where('status', 'confirmed')
            ->where('recorded_at', '>=', $range['start'])
            ->where('recorded_at', '<=', $range['end'])
            ->get();

        $totalOpening = $movements->where('type', 'opening')->sum('qty');
        $totalReceived = $movements->where('type', 'receipt')->sum('qty');
        $totalDistributed = $movements->where('type', 'distribution')->sum('qty');
        $totalSpoiled = abs($movements->where('type', 'spoil')->sum('qty'));
        
        $currentBalance = $totalOpening + $totalReceived - $totalDistributed - $totalSpoiled;

        return [
            'period' => $request->get('period', 'today'),
            'total_opening' => $totalOpening,
            'total_received' => $totalReceived,
            'total_distributed' => $totalDistributed,
            'total_spoiled' => $totalSpoiled,
            'current_balance' => $currentBalance,
        ];
    }

    /**
     * By-shop report
     *
     * Returns a report of inventory distributions grouped by shop for the specified period.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    public function byShop(Request $request)
    {
        $range = $this->getDateRange($request);

        $movements = Movement::with(['shop', 'product'])
            ->where('status', 'confirmed')
            ->where('type', 'distribution')
            ->where('recorded_at', '>=', $range['start'])
            ->where('recorded_at', '<=', $range['end'])
            ->get()
            ->groupBy('shop_id');

        $result = [];

        foreach ($movements as $shopId => $shopMovements) {
            if (!$shopId) continue; // Skip null shops
            
            $shop = $shopMovements->first()->shop;
            $totalDistributed = $shopMovements->sum('qty');

            $result[] = [
                'shop' => [
                    'id' => $shop->id,
                    'name' => $shop->name,
                ],
                'total_distributed' => $totalDistributed,
                'movements' => $shopMovements->toArray(),
            ];
        }

        return $result;
    }

    /**
     * By-product report
     *
     * Returns a report of inventory movements grouped by product for the specified period.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function byProduct(Request $request)
    {
        $range = $this->getDateRange($request);

        $movements = Movement::with('product')
            ->where('status', 'confirmed')
            ->where('recorded_at', '>=', $range['start'])
            ->where('recorded_at', '<=', $range['end'])
            ->get()
            ->groupBy('product_id');

        $result = [];

        foreach ($movements as $productId => $productMovements) {
            $product = $productMovements->first()->product;
            
            $received = $productMovements->where('type', 'receipt')->sum('qty');
            $distributed = $productMovements->where('type', 'distribution')->sum('qty');
            $spoiled = abs($productMovements->where('type', 'spoil')->sum('qty'));
            $balance = $received - $distributed - $spoiled;

            $result[] = [
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku_code' => $product->sku_code,
                ],
                'total_received' => $received,       // ← was 'received'
                'total_distributed' => $distributed, // ← was 'distributed'
                'total_spoiled' => $spoiled,         // ← was 'spoiled'
                'balance' => $balance,
            ];
        }

        return $result;
    }

    /**
     * Spoils report
     *
     * Returns a report of spoiled inventory grouped by product and reason for the specified period.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    public function spoils(Request $request)
    {
        $range = $this->getDateRange($request);

        $movements = Movement::with('product')
            ->where('status', 'confirmed')
            ->where('type', 'spoil')
            ->where('recorded_at', '>=', $range['start'])
            ->where('recorded_at', '<=', $range['end'])
            ->get()
            ->groupBy('product_id');

        $result = [];

        foreach ($movements as $productId => $productMovements) {
            $product = $productMovements->first()->product;
            
            $damaged = $productMovements->where('reason', 'damaged')->sum('qty');
            $expired = $productMovements->where('reason', 'expired')->sum('qty');
            $returned = $productMovements->where('reason', 'returned')->sum('qty');
            
            // Convert to positive numbers since they're stored as negative
            $total = abs($damaged + $expired + $returned);

            $result[] = [
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku_code' => $product->sku_code,
                ],
                'reason_breakdown' => [              // ← new nested structure
                    'damaged' => abs($damaged),      // ← was 'damaged_qty' at root
                    'expired' => abs($expired),      // ← was 'expired_qty' at root
                    'returned' => abs($returned),    // ← was 'returned_qty' at root
                ],
                'total_spoiled' => $total,           // ← was 'total'
            ];
        }

        return $result;
    }
}
