<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Malt 33cl',
                'sku_code' => 'MLT-033',
                'cost_price' => 4200,
            ],
            [
                'name' => 'Malt 50cl',
                'sku_code' => 'MLT-050',
                'cost_price' => 5500,
            ],
            [
                'name' => 'Energy Drink 25cl',
                'sku_code' => 'EDR-025',
                'cost_price' => 3200,
            ],
            [
                'name' => 'Soda 33cl',
                'sku_code' => 'SDA-033',
                'cost_price' => 2800,
            ],
            [
                'name' => 'Water 50cl',
                'sku_code' => 'WTR-050',
                'cost_price' => 1500,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
