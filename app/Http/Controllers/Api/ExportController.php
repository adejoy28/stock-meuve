<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Movement;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    /**
     * Export movements as CSV
     */
    public function movements(Request $request)
    {
        $query = Movement::with(['product', 'shop'])
            ->where('user_id', $request->user()->id)
            ->orderBy('recorded_at', 'desc');

        // Optional filters
        if ($request->filled('from')) {
            $query->whereDate('recorded_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('recorded_at', '<=', $request->to);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $movements = $query->get();

        $filename = 'charly-hb-movements-' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control'       => 'no-cache',
        ];

        $columns = [
            'Date', 'Time', 'Type', 'Product', 'SKU',
            'Qty', 'Shop', 'Unit Cost (₦)', 'Selling Price (₦)',
            'Total Value (₦)', 'Status', 'Reason', 'Note', 'Recorded By',
        ];

        $callback = function () use ($movements, $columns) {
            $file = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($file, $columns);

            foreach ($movements as $m) {
                $qty         = (float) $m->qty;
                $absQty      = abs($qty);
                $sellingPrice = $m->selling_price ?? 0;
                $totalValue   = $sellingPrice > 0 ? $sellingPrice * $absQty : 0;

                fputcsv($file, [
                    $m->recorded_at->format('d/m/Y'),
                    $m->recorded_at->format('H:i'),
                    ucfirst($m->type),
                    $m->product?->name ?? '',
                    $m->product?->sku_code ?? '',
                    $qty,
                    $m->shop?->name ?? '',
                    $m->unit_cost ?? '',
                    $m->selling_price ?? '',
                    $totalValue > 0 ? $totalValue : '',
                    ucfirst($m->status),
                    $m->reason ?? '',
                    $m->note ?? '',
                    $m->recorded_by ?? '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export products as CSV
     */
    public function products(Request $request)
    {
        $products = \App\Models\Product::where('user_id', $request->user()->id)->get();

        $filename = 'charly-hb-products-' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $columns = ['Product Name', 'SKU Code', 'Cost Price (₦)', 'Current Balance'];

        $callback = function () use ($products, $columns) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($file, $columns);

            foreach ($products as $p) {
                fputcsv($file, [
                    $p->name,
                    $p->sku_code,
                    $p->cost_price ?? '',
                    $p->balance(),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
