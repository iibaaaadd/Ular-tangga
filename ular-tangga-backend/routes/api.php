<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\UserController;

// Public routes (no authentication required)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Admin-only routes
    Route::post('/admin/create-user', [AuthController::class, 'createUser']);
    
    // Admin User Management CRUD
    Route::prefix('admin/users')->group(function () {
        Route::get('/', [UserController::class, 'index']); // GET all users
        Route::post('/', [UserController::class, 'store']); // CREATE user
        Route::get('/{id}', [UserController::class, 'show']); // GET single user
        Route::put('/{id}', [UserController::class, 'update']); // UPDATE user
        Route::delete('/{id}', [UserController::class, 'destroy']); // DELETE user
    });
    
    // Future game routes will go here
    // Route::get('/rooms', [RoomController::class, 'index']);
    // Route::post('/rooms', [RoomController::class, 'store']);
    // Route::get('/games/{game}', [GameController::class, 'show']);
});