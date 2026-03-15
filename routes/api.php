<?php

use App\Http\Controllers\Api\AuthController;
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

// ── Auth routes (public) ──────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    // Rate limit login to 10 attempts per minute per IP
    Route::middleware('throttle:10,1')->group(function () {
        Route::post('login',    [AuthController::class, 'login']);
    });
    // Rate limit registration to 5 per minute per IP
    Route::middleware('throttle:5,1')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
    });
});

// ── Protected routes (require valid Sanctum token) ────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me',      [AuthController::class, 'me']);
    Route::put('auth/profile', [AuthController::class, 'updateProfile']);

    // Products
    Route::apiResource('products', ProductController::class);

    // Shops
    Route::apiResource('shops', ShopController::class);

    // Movements
    Route::get('movements', [MovementController::class, 'index']);
    Route::middleware('idempotency')->group(function () {
        Route::post('movements/opening',      [OpeningStockController::class, 'store']);
        Route::post('movements/receipt',      [ReceiptController::class, 'store']);
        Route::post('movements/distribution', [DistributionController::class, 'store']);
        Route::post('movements/correction',   [CorrectionController::class, 'store']);
        Route::post('movements/spoil',        [SpoilController::class, 'store']);
    });
    Route::put('movements/spoil/{id}/confirm', [SpoilController::class, 'confirm']);
    Route::put('movements/spoil/{id}/reject',  [SpoilController::class, 'reject']);

    // Reports
    Route::get('reports/summary',    [ReportController::class, 'summary']);
    Route::get('reports/by-shop',    [ReportController::class, 'byShop']);
    Route::get('reports/by-product', [ReportController::class, 'byProduct']);
    Route::get('reports/spoils',     [ReportController::class, 'spoils']);
});
