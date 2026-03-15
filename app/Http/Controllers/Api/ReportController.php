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

        // Add user scope
        $movements = Movement::where('user_id', $request->user()->id)
            ->where('status', 'confirmed')
            ->where('recorded_at', '>=', $range['start'])
            ->where('recorded_at', '<=', $range['end'])
            ->get();

        $totalOpening    = (float) $movements->where('type', 'opening')->sum('qty');
        $totalReceived   = (float) $movements->where('type', 'receipt')->sum('qty');
        $totalDistributed = (float) abs($movements->where('type', 'distribution')->sum('qty'));
        $totalSpoiled    = (float) abs($movements->where('type', 'spoil')->sum('qty'));
        $totalCorrections = (float) $movements->where('type', 'correction')->sum('qty');

        $currentBalance = $totalOpening + $totalReceived - $totalDistributed - $totalSpoiled + $totalCorrections;

        return [
            'period' => $request->get('period', 'today'),
            'total_opening' => $totalOpening,
            'total_received' => $totalReceived,
            'total_distributed' => $totalDistributed,
            'total_spoiled' => $totalSpoiled,
            'total_corrections' => $totalCorrections,
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
            ->where('user_id', $request->user()->id)
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
        $period = $request->get('period', 'today');
        $startDate = $this->getPeriodStart($period);

        $movements = Movement::with('product')
            ->where('user_id', $request->user()->id)
            ->where('status', 'confirmed')
            ->where('recorded_at', '>=', $startDate)
            ->get()
            ->groupBy('product_id');

        $result = [];

        foreach ($movements as $productId => $productMovements) {
            $product = $productMovements->first()->product;
            if (!$product) continue;

            // Each movement type — use abs() so values are always positive
            $opening    = $productMovements->where('type', 'opening')->sum('qty');
            $received   = $productMovements->where('type', 'receipt')->sum('qty');
            $distributed = abs($productMovements->where('type', 'distribution')->sum('qty')); // stored negative
            $spoiled    = abs($productMovements->where('type', 'spoil')->sum('qty'));          // stored negative
            $corrections = $productMovements->where('type', 'correction')->sum('qty');        // can be +/-

            // True balance for the period
            $periodBalance = $opening + $received - $distributed - $spoiled + $corrections;

            // Price history from stored movement snapshots
            $distributionMovements = $productMovements->where('type', 'distribution');

            $totalSellingValue = $distributionMovements
                ->filter(fn($m) => $m->selling_price !== null)
                ->sum(fn($m) => abs($m->qty) * $m->selling_price);

            $totalCostValue = $distributionMovements
                ->filter(fn($m) => $m->unit_cost !== null)
                ->sum(fn($m) => abs($m->qty) * $m->unit_cost);

            $grossMargin = $totalSellingValue - $totalCostValue;

            // Price at time of last distribution in this period
            $lastDistribution = $distributionMovements
                ->sortByDesc('recorded_at')
                ->first();

            $result[] = [
                'product' => [
                    'id'         => $product->id,
                    'name'       => $product->name,
                    'sku_code'   => $product->sku_code,
                    'cost_price' => (float) $product->cost_price,
                ],
                'opening'              => (float) $opening,
                'received'             => (float) $received,
                'distributed'          => (float) $distributed,
                'spoiled'              => (float) $spoiled,
                'corrections'          => (float) $corrections,
                'period_balance'       => (float) $periodBalance,
                'total_selling_value'  => (float) $totalSellingValue,
                'total_cost_value'     => (float) $totalCostValue,
                'gross_margin'         => (float) $grossMargin,
                'last_selling_price'   => $lastDistribution?->selling_price,
                'last_unit_cost'       => $lastDistribution?->unit_cost,
            ];
        }

        return $result;
    }

    /**
     * Get period start date for byProduct method
     */
    private function getPeriodStart(string $period): Carbon
    {
        $now = Carbon::now();

        return match($period) {
            'today' => $now->copy()->startOfDay(),
            'week'  => $now->copy()->startOfWeek(),
            'month' => $now->copy()->startOfMonth(),
            'all'   => Carbon::createFromTimestamp(0),
            default => $now->copy()->startOfDay(),
        };
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
            ->where('user_id', $request->user()->id)
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
                'damaged_qty' => abs($damaged),
                'expired_qty' => abs($expired),
                'returned_qty' => abs($returned),
                'total' => $total,
            ];
        }

        return $result;
    }
}
