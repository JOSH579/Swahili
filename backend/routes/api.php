<?php

use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\MeController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\PlacementController;

Route::post('/register', [RegisterController::class, 'store']);
Route::post('/login', [LoginController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [MeController::class, 'show']);
    Route::post('/logout', [MeController::class, 'destroy']);
    Route::get('/placement', [PlacementController::class, 'show']);
    Route::post('/placement', [PlacementController::class, 'store']);
    Route::get('/lessons', [LessonController::class, 'index']);
    Route::get('/lessons/{lesson}/quiz', [LessonController::class, 'quiz']);
    Route::get('/lessons/{lesson}', [LessonController::class, 'show']);
});