<?php

use App\Http\Controllers\Api\CorrectionController;
use App\Http\Controllers\Api\DistributionController;
use App\Http\Controllers\Api\MovementController;
use App\Http\Controllers\Api\OpeningStockController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReceiptController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ShopController;
use App\Http\Controllers\Api\SpoilController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Products
Route::apiResource('products', ProductController::class);

// Shops
Route::apiResource('shops', ShopController::class);

// Movements (listing only)
Route::get('movements', [MovementController::class, 'index']);

// Wrap all movement store routes with idempotency middleware
Route::middleware(['idempotency'])->group(function () {
    Route::post('movements/opening',       [OpeningStockController::class, 'store']);
    Route::post('movements/receipt',       [ReceiptController::class, 'store']);
    Route::post('movements/distribution',  [DistributionController::class, 'store']);
    Route::post('movements/spoil',         [SpoilController::class, 'store']);
    Route::post('movements/correction',    [CorrectionController::class, 'store']);
});

// Spoil Management (confirm/reject don't need idempotency)
Route::put('movements/spoil/{movement}/confirm', [SpoilController::class, 'confirm']);
Route::put('movements/spoil/{movement}/reject', [SpoilController::class, 'reject']);

// Reports
Route::get('reports/summary', [ReportController::class, 'summary']);
Route::get('reports/by-shop', [ReportController::class, 'byShop']);
Route::get('reports/by-product', [ReportController::class, 'byProduct']);
Route::get('reports/spoils', [ReportController::class, 'spoils']);
