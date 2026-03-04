<?php

namespace Database\Seeders;

use App\Models\Shop;
use Illuminate\Database\Seeder;

class ShopSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $shops = [
            [
                'name' => 'Shop A - Downtown',
                'archived' => false,
            ],
            [
                'name' => 'Shop B - Suburb',
                'archived' => false,
            ],
            [
                'name' => 'Shop C - Mall',
                'archived' => false,
            ],
            [
                'name' => 'Shop D - Airport',
                'archived' => false,
            ],
            [
                'name' => 'Old Shop - Closed',
                'archived' => true, // Example of archived shop
            ],
        ];

        foreach ($shops as $shop) {
            Shop::create($shop);
        }
    }
}
