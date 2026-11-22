<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\UserMediaController;

Route::apiResource('media', MediaController::class);

// Route untuk koleksi media user
Route::get('/users/{userId}/media', [UserMediaController::class, 'index']);
Route::post('/users/{userId}/media', [UserMediaController::class, 'store']);
Route::delete('/users/{userId}/media/{mediaId}', [UserMediaController::class, 'destroy']);
