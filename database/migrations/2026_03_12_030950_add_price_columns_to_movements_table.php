<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('movements', function (Blueprint $table) {
            // Snapshot of product cost_price at time of recording — set automatically, never changes
            $table->decimal('unit_cost', 12, 2)->nullable()->after('note');

            // What the shop was actually charged — can differ from unit_cost — distribution only
            $table->decimal('selling_price', 12, 2)->nullable()->after('unit_cost');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('movements', function (Blueprint $table) {
            $table->dropColumn(['unit_cost', 'selling_price']);
        });
    }
};
