<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Stock Meuve API is running',
        'version' => '1.0.0',
        'status' => 'active'
    ]);
});

Route::get('/welcome', function () {
    return view('welcome');
});
