<?php

namespace Database\Seeders;

use App\Models\Movement;
use App\Models\Sku;
use App\Models\Shop;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class MovementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the SKUs and shops we just created
        $malt33 = Sku::where('sku_code', 'MLT-033')->first();
        $malt50 = Sku::where('sku_code', 'MLT-050')->first();
        $energy = Sku::where('sku_code', 'EDR-025')->first();
        $soda = Sku::where('sku_code', 'SDA-033')->first();
        $water = Sku::where('sku_code', 'WTR-050')->first();

        $shopA = Shop::where('name', 'Shop A - Downtown')->first();
        $shopB = Shop::where('name', 'Shop B - Suburb')->first();
        $shopC = Shop::where('name', 'Shop C - Mall')->first();

        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        // Opening stock (yesterday)
        Movement::create([
            'sku_id' => $malt33->id,
            'type' => 'opening',
            'qty' => 100,
            'shop_id' => null,
            'reason' => null,
            'status' => 'confirmed',
            'note' => 'Initial stock',
            'recorded_at' => $yesterday,
        ]);

        Movement::create([
            'sku_id' => $malt50->id,
            'type' => 'opening',
            'qty' => 75,
            'shop_id' => null,
            'reason' => null,
            'status' => 'confirmed',
            'note' => 'Initial stock',
            'recorded_at' => $yesterday,
        ]);

        Movement::create([
            'sku_id' => $energy->id,
            'type' => 'opening',
            'qty' => 50,
            'shop_id' => null,
            'reason' => null,
            'status' => 'confirmed',
            'note' => 'Initial stock',
            'recorded_at' => $yesterday,
        ]);

        // Receipt (today)
        Movement::create([
            'sku_id' => $malt33->id,
            'type' => 'receipt',
            'qty' => 25,
            'shop_id' => null,
            'reason' => null,
            'status' => 'confirmed',
            'note' => 'Morning delivery from warehouse',
            'recorded_at' => $today,
        ]);

        // Distributions (today)
        Movement::create([
            'sku_id' => $malt33->id,
            'type' => 'distribution',
            'qty' => 15,
            'shop_id' => $shopA->id,
            'reason' => null,
            'status' => 'confirmed',
            'note' => 'Morning delivery',
            'recorded_at' => $today,
        ]);

        Movement::create([
            'sku_id' => $malt50->id,
            'type' => 'distribution',
            'qty' => 20,
            'shop_id' => $shopB->id,
            'reason' => null,
            'status' => 'confirmed',
            'note' => 'Afternoon delivery',
            'recorded_at' => $today,
        ]);

        // Spoils (today)
        Movement::create([
            'sku_id' => $energy->id,
            'type' => 'spoil',
            'qty' => 3,
            'shop_id' => null,
            'reason' => 'damaged',
            'status' => 'confirmed',
            'note' => 'Broken during transport',
            'recorded_at' => $today,
        ]);

        Movement::create([
            'sku_id' => $soda->id,
            'type' => 'spoil',
            'qty' => 2,
            'shop_id' => null,
            'reason' => 'expired',
            'status' => 'confirmed',
            'note' => 'Past expiry date',
            'recorded_at' => $today,
        ]);

        // Pending spoil (today)
        Movement::create([
            'sku_id' => $water->id,
            'type' => 'spoil',
            'qty' => 1,
            'shop_id' => null,
            'reason' => 'returned',
            'status' => 'pending',
            'note' => 'Customer returned damaged product',
            'recorded_at' => $today,
        ]);

        // Correction (today)
        Movement::create([
            'sku_id' => $malt33->id,
            'type' => 'correction',
            'qty' => -2,
            'shop_id' => $shopA->id,
            'reason' => null,
            'status' => 'confirmed',
            'note' => 'Found 2 damaged cartons during inventory check',
            'recorded_at' => $today,
        ]);
    }
}
