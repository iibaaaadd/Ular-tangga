<?php

namespace App\Http\Controllers;

use App\Models\GameSession;
use App\Models\GameSessionParticipant;
use App\Models\GameMove;
use App\Models\SnakeLadder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SnakesLaddersController extends Controller
{
    /**
     * Get game session details for a player
     */
    public function getGameSession(int $sessionId): JsonResponse
    {
        $session = GameSession::with([
            'participants.participant',
            'currentPlayer',
            'room',
            'moves' => function($query) {
                $query->orderBy('turn_number', 'desc')->limit(5);
            }
        ])->find($sessionId);

        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Game session not found'
            ], 404);
        }

        // Check if current user is a participant
        $userParticipant = $session->participants()
            ->where('participant_id', Auth::id())
            ->first();

        if (!$userParticipant) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not a participant in this game'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'session' => $session,
                'user_participant' => $userParticipant,
                'snakes_ladders' => SnakeLadder::getActiveSnakesAndLadders(),
                'is_your_turn' => $session->current_player_id === Auth::id()
            ]
        ]);
    }

    /**
     * Roll dice - First phase of the turn
     */
    public function rollDice(int $sessionId): JsonResponse
    {
        $session = GameSession::with(['participants.participant', 'room'])->find($sessionId);

        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Game session not found'
            ], 404);
        }

        if ($session->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'Game is not active'
            ], 400);
        }

        if ($session->current_player_id !== Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'It is not your turn'
            ], 400);
        }

        try {
            $diceValue = rand(1, 6); // Roll the dice
            
            $moveData = DB::transaction(function () use ($session, $diceValue) {
                return $session->processDiceRoll(Auth::id(), $diceValue);
            });

            // Store move data in session for the answer phase
            session(['pending_move_' . $sessionId => $moveData]);

            return response()->json([
                'status' => 'success',
                'message' => 'Dice rolled! Now answer the question to complete your move.',
                'data' => [
                    'dice_value' => $diceValue,
                    'position_before' => $moveData['position_before'],
                    'position_after_dice' => $moveData['position_after_dice'],
                    'question' => $moveData['question'],
                    'snake_ladder_info' => $moveData['snake_ladder_info'],
                    'requires_answer' => $moveData['question'] !== null
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Submit answer to complete the move
     */
    public function submitAnswer(int $sessionId, Request $request): JsonResponse
    {
        $request->validate([
            'answer' => 'required'
        ]);

        $session = GameSession::with(['participants.participant', 'room'])->find($sessionId);

        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Game session not found'
            ], 404);
        }

        if ($session->current_player_id !== Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'It is not your turn'
            ], 400);
        }

        // Get pending move data
        $moveData = session('pending_move_' . $sessionId);
        if (!$moveData) {
            return response()->json([
                'status' => 'error',
                'message' => 'No pending move found. Please roll dice first.'
            ], 400);
        }

        try {
            $result = DB::transaction(function () use ($session, $moveData, $request) {
                return $session->processAnswer(
                    Auth::id(), 
                    $moveData['dice_value'], 
                    $moveData, 
                    $request->answer
                );
            });

            // Clear pending move data
            session()->forget('pending_move_' . $sessionId);

            // Broadcast the completed move to all participants
            broadcast(new \App\Events\GameSessionUpdated(
                $session->room, 
                $session->fresh(), 
                'move_completed', 
                $result
            ));

            return response()->json([
                'status' => 'success',
                'message' => $result['won_game'] ? 'Congratulations! You won!' : 'Move completed',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get game board state (positions of snakes and ladders)
     */
    public function getBoardState(): JsonResponse
    {
        $snakesLadders = SnakeLadder::getActiveSnakesAndLadders();
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'board_size' => 100,
                'snakes_ladders' => $snakesLadders,
                'snakes' => SnakeLadder::getSnakes(),
                'ladders' => SnakeLadder::getLadders()
            ]
        ]);
    }

    /**
     * Get game history (recent moves)
     */
    public function getGameHistory(int $sessionId): JsonResponse
    {
        $session = GameSession::find($sessionId);

        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Game session not found'
            ], 404);
        }

        // Check if user is participant
        $isParticipant = $session->participants()
            ->where('participant_id', Auth::id())
            ->exists();

        if (!$isParticipant) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not authorized to view this game'
            ], 403);
        }

        $moves = $session->moves()
            ->with('player')
            ->orderBy('turn_number', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $moves
        ]);
    }

    /**
     * Get current game statistics
     */
    public function getGameStats(int $sessionId): JsonResponse
    {
        $session = GameSession::with('participants.participant')->find($sessionId);

        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Game session not found'
            ], 404);
        }

        $stats = [
            'game_name' => $session->game_name,
            'status' => $session->status,
            'started_at' => $session->started_at,
            'ended_at' => $session->ended_at,
            'current_turn' => $session->turn_order,
            'participants' => [],
            'total_moves' => $session->moves()->count(),
            'winner' => null
        ];

        foreach ($session->participants as $participant) {
            $playerStats = [
                'id' => $participant->participant_id,
                'name' => $participant->participant->name,
                'player_number' => $participant->player_number,
                'current_position' => $participant->current_position,
                'dice_rolls' => $participant->dice_rolls,
                'is_current_player' => $session->current_player_id === $participant->participant_id,
                'has_won' => $participant->hasWon()
            ];

            if ($participant->hasWon()) {
                $stats['winner'] = $playerStats;
            }

            $stats['participants'][] = $playerStats;
        }

        return response()->json([
            'status' => 'success',
            'data' => $stats
        ]);
    }

    /**
     * Leave game session (for participants)
     */
    public function leaveGame(int $sessionId): JsonResponse
    {
        $session = GameSession::find($sessionId);

        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Game session not found'
            ], 404);
        }

        $participant = $session->participants()
            ->where('participant_id', Auth::id())
            ->first();

        if (!$participant) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not in this game'
            ], 400);
        }

        if ($session->status === 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot leave an active game'
            ], 400);
        }

        try {
            $participant->delete();
            $session->decrement('current_players');

            return response()->json([
                'status' => 'success',
                'message' => 'Successfully left the game'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to leave game'
            ], 500);
        }
    }
}
