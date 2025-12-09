<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ShopifySyncController;
use App\Http\Controllers\AiStockAnalystController;

Route::prefix('shopify')->group(function () {
    Route::get('dashboard', [ShopifySyncController::class, 'dashboard']);
    Route::post('sync/products', [ShopifySyncController::class, 'syncProducts']);
    Route::post('sync/orders', [ShopifySyncController::class, 'syncOrders']);
});

Route::prefix('ai')->group(function () {
    Route::post('stock-analyst', [AiStockAnalystController::class, 'analyse']);
    Route::get('stock-analyst/daily-summary', [AiStockAnalystController::class, 'dailySummary']);
});
