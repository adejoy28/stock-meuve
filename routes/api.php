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

// ── Public auth routes ────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::middleware('throttle:10,1')->post('login',    [AuthController::class, 'login']);
    Route::middleware('throttle:5,1')->post('register',  [AuthController::class, 'register']);
});

// ── Protected routes — require valid Sanctum token ────────────────────────────
Route::middleware(['auth:sanctum', 'throttle:120,1'])->group(function () {

    // Auth
    Route::post('auth/logout',      [AuthController::class, 'logout']);
    Route::get('auth/me',           [AuthController::class, 'me']);
    Route::put('auth/profile',      [AuthController::class, 'updateProfile']);
    Route::delete('auth/account',   [AuthController::class, 'deleteAccount']);

    // Products
    Route::apiResource('products', ProductController::class);

    // Shops
    Route::apiResource('shops', ShopController::class);

    // Movements — read
    Route::get('movements', [MovementController::class, 'index']);

    // Movements — write (idempotency middleware)
    Route::middleware('idempotency')->group(function () {
        Route::post('movements/opening',       [OpeningStockController::class, 'store']);
        Route::post('movements/receipt',       [ReceiptController::class, 'store']);
        Route::post('movements/distribution',  [DistributionController::class, 'store']);
        Route::post('movements/correction',    [CorrectionController::class, 'store']);
        Route::post('movements/spoil',         [SpoilController::class, 'store']);
    });

    Route::put('movements/spoil/{id}/confirm', [SpoilController::class, 'confirm']);
    Route::put('movements/spoil/{id}/reject',  [SpoilController::class, 'reject']);

    // Reports
    Route::get('reports/summary',    [ReportController::class, 'summary']);
    Route::get('reports/by-shop',    [ReportController::class, 'byShop']);
    Route::get('reports/by-product', [ReportController::class, 'byProduct']);
    Route::get('reports/spoils',     [ReportController::class, 'spoils']);

    // Export
    Route::get('export/movements', [\App\Http\Controllers\Api\ExportController::class, 'movements']);
    Route::get('export/products',  [\App\Http\Controllers\Api\ExportController::class, 'products']);
});
