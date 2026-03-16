<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Product;
use App\Models\Shop;
use App\Models\Movement;

class TestMovementsSeeder extends Seeder
{
    public function run()
    {
        echo "Seeding test movements for test users...\n";

        // Get test users (excluding first two users who already have data)
        $testUsers = User::where('id', '>', 2)->get();
        echo "Found {$testUsers->count()} test users\n";

        // Get some products and shops from user 2 (who has existing data)
        $products = Product::where('user_id', 2)->limit(10)->get();
        $shops = Shop::where('user_id', 2)->limit(5)->get();

        if ($products->count() === 0 || $shops->count() === 0) {
            echo "No products or shops found to reference\n";
            return;
        }

        foreach ($testUsers as $user) {
            echo "Seeding movements for user: {$user->name} (ID: {$user->id})\n";
            
            // Create 5-8 movements per test user
            $numMovements = rand(5, 8);
            
            for ($i = 0; $i < $numMovements; $i++) {
                $product = $products->random();
                $shop = $shops->random();
                $type = ['receipt', 'distribution', 'spoil', 'correction'][array_rand(['receipt', 'distribution', 'spoil', 'correction'])];
                $qty = rand(1, 50);
                $unitCost = rand(100, 5000);
                $sellingPrice = $unitCost + rand(50, 1000);
                
                Movement::create([
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                    'shop_id' => $shop->id,
                    'type' => $type,
                    'qty' => $qty,
                    'unit_cost' => $unitCost,
                    'selling_price' => $sellingPrice,
                    'note' => "Test movement for {$user->name}",
                    'reason' => 'Test data',
                    'status' => 'completed',
                    'recorded_at' => now()->subDays(rand(1, 30)),
                    'created_at' => now()->subDays(rand(1, 30)),
                    'updated_at' => now(),
                ]);
            }
        }

        echo "Test movements created successfully!\n";
    }
}
