<?php

namespace App\Http\Controllers;

use App\Models\GameRoom;
use App\Models\Material;
use App\Models\RoomParticipant;
use App\Models\Question;
use App\Models\GameSession;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GameRoomController extends Controller
{
    /**
     * Display teacher's rooms
     */
    public function index(): JsonResponse
    {
        $rooms = GameRoom::with(['material', 'participants.student'])
            ->where('teacher_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $rooms
        ]);
    }

    /**
     * Get student's joined rooms
     */
    public function getStudentRooms(): JsonResponse
    {
        $studentId = Auth::id();
        
        // Get rooms that the student has joined
        $rooms = GameRoom::with(['material', 'teacher'])
            ->whereHas('participants', function ($query) use ($studentId) {
                $query->where('student_id', $studentId);
            })
            ->withCount(['participants', 'sessions as games_count'])
            ->orderBy('updated_at', 'desc')
            ->get();

        // Transform data to include additional info
        $transformedRooms = $rooms->map(function ($room) use ($studentId) {
            // Get student's average score for this room
            $averageScore = $room->sessions()
                ->whereHas('participants', function ($query) use ($studentId) {
                    $query->where('student_id', $studentId);
                })
                ->avg('score') ?? 0;

            return [
                'id' => $room->id,
                'room_name' => $room->room_name,
                'room_code' => $room->room_code,
                'status' => $room->status,
                'description' => $room->description ?? "Kelas {$room->room_name}",
                'created_at' => $room->created_at,
                'updated_at' => $room->updated_at,
                'participants_count' => $room->participants_count,
                'games_count' => $room->games_count,
                'average_score' => round($averageScore, 1),
                'material' => $room->material,
                'teacher' => [
                    'id' => $room->teacher->id,
                    'name' => $room->teacher->name
                ]
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $transformedRooms
        ]);
    }

    /**
     * Create new game room
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'room_name' => 'required|string|max:255',
            'material_id' => 'required|exists:materials,id',
            'max_participants' => 'integer|min:2|max:100'
        ]);

        try {
            $room = GameRoom::create([
                'room_code' => GameRoom::generateRoomCode(),
                'room_name' => $request->room_name,
                'teacher_id' => Auth::id(),
                'material_id' => $request->material_id,
                'max_participants' => $request->max_participants ?? 50,
                'status' => 'waiting'
            ]);

            $room->load(['material', 'teacher']);

            return response()->json([
                'status' => 'success',
                'message' => 'Room created successfully',
                'data' => $room
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create room'
            ], 500);
        }
    }

    /**
     * Get room details
     */
    public function show(string $roomCode): JsonResponse
    {
        $room = GameRoom::with(['material', 'teacher', 'participants.student'])
            ->where('room_code', $roomCode)
            ->first();

        if (!$room) {
            return response()->json([
                'status' => 'error',
                'message' => 'Room not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $room
        ]);
    }

    /**
     * Join room (for students)
     */
    public function joinRoom(Request $request): JsonResponse
    {
        $request->validate([
            'room_code' => 'required|string|exists:game_rooms,room_code'
        ]);

        $room = GameRoom::where('room_code', $request->room_code)->first();

        if ($room->status !== 'waiting') {
            return response()->json([
                'status' => 'error',
                'message' => 'Room is not accepting new participants'
            ], 400);
        }

        if ($room->participants()->count() >= $room->max_participants) {
            return response()->json([
                'status' => 'error',
                'message' => 'Room is full'
            ], 400);
        }

        // Check if student already joined
        $existing = RoomParticipant::where('room_id', $room->id)
            ->where('student_id', Auth::id())
            ->first();

        if ($existing) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are already in this room'
            ], 400);
        }

        try {
            $participant = RoomParticipant::create([
                'room_id' => $room->id,
                'student_id' => Auth::id(),
                'is_ready' => false
            ]);

            $participant->load('student');

            // Broadcast participant joined event
            broadcast(new \App\Events\ParticipantJoined($room, $participant));

            return response()->json([
                'status' => 'success',
                'message' => 'Successfully joined room',
                'data' => [
                    'room' => $room,
                    'participant' => $participant
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to join room'
            ], 500);
        }
    }

    /**
     * Leave room
     */
    public function leaveRoom(Request $request): JsonResponse
    {
        $request->validate([
            'room_code' => 'required|string'
        ]);

        $room = GameRoom::where('room_code', $request->room_code)->first();

        if (!$room) {
            return response()->json([
                'status' => 'error',
                'message' => 'Room not found'
            ], 404);
        }

        $participant = RoomParticipant::where('room_id', $room->id)
            ->where('student_id', Auth::id())
            ->first();

        if (!$participant) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not in this room'
            ], 400);
        }

        try {
            $user = Auth::user();
            
            // Delete participant
            $participant->delete();

            // Broadcast participant left event
            broadcast(new \App\Events\ParticipantLeft($room, $user));

            return response()->json([
                'status' => 'success',
                'message' => 'Successfully left room'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to leave room'
            ], 500);
        }
    }

    /**
     * Start studying phase
     */
    public function startStudying(string $roomCode): JsonResponse
    {
        $room = GameRoom::where('room_code', $roomCode)
            ->where('teacher_id', Auth::id())
            ->first();

        if (!$room) {
            return response()->json([
                'status' => 'error',
                'message' => 'Room not found or unauthorized'
            ], 404);
        }

        if ($room->status !== 'waiting') {
            return response()->json([
                'status' => 'error',
                'message' => 'Room is not in waiting state'
            ], 400);
        }

        try {
            $room->update(['status' => 'studying']);
            $room->load(['material', 'teacher', 'participants.student']);

            // Broadcast room status change
            broadcast(new \App\Events\RoomUpdated($room, 'status_changed', [
                'old_status' => 'waiting',
                'new_status' => 'studying'
            ]));

            return response()->json([
                'status' => 'success',
                'message' => 'Study phase started',
                'data' => $room
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to start study phase'
            ], 500);
        }
    }

    /**
     * Update participant ready status
     */
    public function updateParticipantReady(Request $request): JsonResponse
    {
        $request->validate([
            'room_code' => 'required|string',
            'is_ready' => 'required|boolean'
        ]);

        $room = GameRoom::where('room_code', $request->room_code)->first();

        if (!$room) {
            return response()->json([
                'status' => 'error',
                'message' => 'Room not found'
            ], 404);
        }

        $participant = RoomParticipant::where('room_id', $room->id)
            ->where('student_id', Auth::id())
            ->first();

        if (!$participant) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not in this room'
            ], 400);
        }

        try {
            $participant->update(['is_ready' => $request->is_ready]);
            $participant->load('student');

            // Get updated ready count
            $readyCount = RoomParticipant::where('room_id', $room->id)
                ->where('is_ready', true)
                ->count();
            
            $totalCount = RoomParticipant::where('room_id', $room->id)->count();

            // Broadcast participant ready status change
            broadcast(new \App\Events\RoomUpdated($room, 'participant_ready_changed', [
                'participant' => $participant,
                'ready_count' => $readyCount,
                'total_count' => $totalCount,
                'all_ready' => $readyCount === $totalCount
            ]));

            return response()->json([
                'status' => 'success',
                'message' => 'Ready status updated',
                'data' => [
                    'participant' => $participant,
                    'ready_count' => $readyCount,
                    'total_count' => $totalCount,
                    'all_ready' => $readyCount === $totalCount
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update ready status'
            ], 500);
        }
    }

    /**
     * Start game - Create snakes and ladders game sessions
     */
    public function startGame(string $roomCode): JsonResponse
    {
        $room = GameRoom::where('room_code', $roomCode)
            ->where('teacher_id', Auth::id())
            ->first();

        if (!$room) {
            return response()->json([
                'status' => 'error',
                'message' => 'Room not found or unauthorized'
            ], 404);
        }

        if ($room->status !== 'studying') {
            return response()->json([
                'status' => 'error',
                'message' => 'Room must be in studying phase'
            ], 400);
        }

        // Check if all participants are ready
        $totalParticipants = RoomParticipant::where('room_id', $room->id)->count();
        $readyParticipants = RoomParticipant::where('room_id', $room->id)
            ->where('is_ready', true)
            ->count();

        if ($readyParticipants !== $totalParticipants || $totalParticipants < 2) {
            return response()->json([
                'status' => 'error',
                'message' => 'All participants must be ready and at least 2 participants required to start the game',
                'data' => [
                    'ready_count' => $readyParticipants,
                    'total_count' => $totalParticipants
                ]
            ], 400);
        }

        try {
            DB::transaction(function () use ($room) {
                // Auto-create game sessions based on participants
                $gameSessions = $room->createGameSessions();

                // Start all game sessions
                $startedSessions = $room->startAllGames();

                // Load room with relationships
                $room->load(['material', 'teacher', 'participants.student', 'gameSessions.participants.participant']);

                // Broadcast game started with session details
                broadcast(new \App\Events\RoomUpdated($room, 'snakes_ladders_game_started', [
                    'total_sessions' => count($gameSessions),
                    'game_sessions' => $gameSessions->map(function($session) {
                        return [
                            'id' => $session->id,
                            'game_name' => $session->game_name,
                            'participants' => $session->participants()->with('participant')->get()
                        ];
                    })
                ]));
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Snakes and Ladders games started successfully',
                'data' => [
                    'room' => $room,
                    'game_sessions' => $room->gameSessions()->with('participants.participant')->get()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to start games: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get room game sessions
     */
    public function getGameSessions(string $roomCode): JsonResponse
    {
        $room = GameRoom::where('room_code', $roomCode)->first();

        if (!$room) {
            return response()->json([
                'status' => 'error',
                'message' => 'Room not found'
            ], 404);
        }

        $gameSessions = $room->gameSessions()->with([
            'participants.participant',
            'currentPlayer',
            'moves' => function($query) {
                $query->orderBy('turn_number', 'desc')->limit(10); // Last 10 moves
            }
        ])->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'room' => $room,
                'game_sessions' => $gameSessions,
                'snakes_ladders' => \App\Models\SnakeLadder::getActiveSnakesAndLadders()
            ]
        ]);
    }

    /**
     * Get leaderboard - Updated for snakes and ladders
     */
    public function getLeaderboard(string $roomCode): JsonResponse
    {
        $room = GameRoom::where('room_code', $roomCode)->first();

        if (!$room) {
            return response()->json([
                'status' => 'error',
                'message' => 'Room not found'
            ], 404);
        }

        $leaderboard = $room->getOverallLeaderboard();

        return response()->json([
            'status' => 'success',
            'data' => $leaderboard
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
