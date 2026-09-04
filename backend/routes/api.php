<?php

use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\MeController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [RegisterController::class, 'store']);
Route::post('/login', [LoginController::class, 'store']);
Route::middleware('auth:sanctum')->get('/me', [MeController::class, 'show']);
Route::middleware('auth:sanctum')->post('/logout', [MeController::class, 'destroy']);