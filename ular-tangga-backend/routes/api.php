<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\GameRoomController;
use App\Http\Controllers\GameSessionController;
use App\Http\Controllers\SnakesLaddersController;

// Public routes (no authentication required)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::post('/admin/create-user', [AuthController::class, 'createUser']);
    
    Route::prefix('admin/users')->group(function () {
        Route::get('/', [UserController::class, 'index']); // GET all users
        Route::post('/', [UserController::class, 'store']); // CREATE user
        Route::get('/{id}', [UserController::class, 'show']); // GET single user
        Route::put('/{id}', [UserController::class, 'update']); // UPDATE user
        Route::delete('/{id}', [UserController::class, 'destroy']); // DELETE user
    });
    
    Route::apiResource('questions', QuestionController::class);
    Route::get('/materials/{materialId}/questions', [QuestionController::class, 'getByMaterial']);

    Route::apiResource('materials', MaterialController::class);
    Route::get('/materials-with-counts', [MaterialController::class, 'withQuestionCounts']);
    
    // Game Room Routes
    Route::prefix('game-rooms')->group(function () {
        Route::get('/', [GameRoomController::class, 'index']); // Get teacher's rooms
        Route::post('/', [GameRoomController::class, 'store']); // Create new room
        Route::get('/student/joined', [GameRoomController::class, 'getStudentRooms']); // Get student's joined rooms
        Route::get('/{roomCode}', [GameRoomController::class, 'show']); // Get room details
        Route::post('/join', [GameRoomController::class, 'joinRoom']); // Join room (students)
        Route::post('/leave', [GameRoomController::class, 'leaveRoom']); // Leave room (students)
        Route::post('/update-ready', [GameRoomController::class, 'updateParticipantReady']); // Update participant ready status
        Route::post('/{roomCode}/start-studying', [GameRoomController::class, 'startStudying']); // Start study phase
        Route::post('/{roomCode}/start-game', [GameRoomController::class, 'startGame']); // Start game
        Route::get('/{roomCode}/leaderboard', [GameRoomController::class, 'getLeaderboard']); // Get leaderboard
        Route::get('/{roomCode}/game-sessions', [GameRoomController::class, 'getGameSessions']); // Get room game sessions
    });
    
    // Snakes and Ladders Game Routes
    Route::prefix('snakes-ladders')->group(function () {
        Route::get('/board', [SnakesLaddersController::class, 'getBoardState']); // Get board configuration
        Route::get('/session/{sessionId}', [SnakesLaddersController::class, 'getGameSession']); // Get game session details
        Route::post('/session/{sessionId}/roll-dice', [SnakesLaddersController::class, 'rollDice']); // Roll dice (first phase)
        Route::post('/session/{sessionId}/submit-answer', [SnakesLaddersController::class, 'submitAnswer']); // Submit answer (second phase)
        Route::get('/session/{sessionId}/history', [SnakesLaddersController::class, 'getGameHistory']); // Get move history
        Route::get('/session/{sessionId}/stats', [SnakesLaddersController::class, 'getGameStats']); // Get game statistics
        Route::post('/session/{sessionId}/leave', [SnakesLaddersController::class, 'leaveGame']); // Leave game
    });

    // Game Session Routes (Deprecated - keeping for compatibility)
    Route::prefix('game-sessions')->group(function () {
        Route::get('/room/{roomCode}/current-question', [GameSessionController::class, 'getCurrentQuestion']); // Get current question
        Route::post('/room/{roomCode}/next-question', [GameSessionController::class, 'startNextQuestion']); // Start next question (teacher)
        Route::post('/{sessionId}/submit-answer', [GameSessionController::class, 'submitAnswer']); // Submit answer (student)
    });
});