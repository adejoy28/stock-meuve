<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Backfill unit_cost and selling_price on existing movements.
     *
     * Rules:
     * - unit_cost  → set to the product's current cost_price for ALL movement types
     * - selling_price → set to unit_cost for distribution movements only
     * - If a product has no cost_price (null or 0), both fields stay null for that movement
     * - Movements already having a non-null unit_cost are skipped (safe to re-run)
     */
    public function up(): void
    {
        // Step 1 — backfill unit_cost on ALL movement types
        // Join movements with products and copy cost_price → unit_cost
        // Only affects rows where unit_cost is currently null
        // Only affects rows where the product has a cost_price > 0
        DB::statement("
            UPDATE movements
            SET unit_cost = products.cost_price
            FROM products
            WHERE movements.product_id = products.id
              AND movements.unit_cost IS NULL
              AND products.cost_price IS NOT NULL
              AND products.cost_price > 0
        ");

        // Step 2 — backfill selling_price on distribution movements only
        // selling_price = unit_cost (since we have no record of original selling price)
        DB::statement("
            UPDATE movements
            SET selling_price = unit_cost
            WHERE type = 'distribution'
              AND selling_price IS NULL
              AND unit_cost IS NOT NULL
        ");
    }

    /**
     * Reverse — set all backfilled values back to null.
     * Only safe to run if you want to undo the backfill entirely.
     */
    public function down(): void
    {
        // We cannot know which rows were backfilled vs originally set,
        // so down() is a no-op to protect data integrity.
        // To manually undo: UPDATE movements SET unit_cost = null, selling_price = null;
    }
};
