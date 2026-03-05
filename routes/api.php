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

// Opening Stock
Route::post('movements/opening', [OpeningStockController::class, 'store']);

// Goods Receipt
Route::post('movements/receipt', [ReceiptController::class, 'store']);

// Distribution
Route::post('movements/distribution', [DistributionController::class, 'store']);

// Correction
Route::post('movements/correction', [CorrectionController::class, 'store']);

// Spoil Management
Route::post('movements/spoil', [SpoilController::class, 'store']);
Route::put('movements/spoil/{movement}/confirm', [SpoilController::class, 'confirm']);
Route::put('movements/spoil/{movement}/reject', [SpoilController::class, 'reject']);

// Reports
Route::get('reports/summary', [ReportController::class, 'summary']);
Route::get('reports/by-shop', [ReportController::class, 'byShop']);
Route::get('reports/by-product', [ReportController::class, 'byProduct']);
Route::get('reports/spoils', [ReportController::class, 'spoils']);
