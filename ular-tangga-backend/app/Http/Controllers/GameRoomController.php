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
     * Start game
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

        try {
            DB::transaction(function () use ($room) {
                // Get questions for the material
                $questions = Question::where('material_id', $room->material_id)
                    ->inRandomOrder()
                    ->get();

                // Create game sessions for each question
                foreach ($questions as $index => $question) {
                    GameSession::create([
                        'room_id' => $room->id,
                        'question_id' => $question->id,
                        'question_order' => $index + 1,
                        'status' => 'waiting',
                        'time_limit' => 30 // Default 30 seconds
                    ]);
                }

                // Update room status
                $room->update([
                    'status' => 'playing',
                    'started_at' => now()
                ]);
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Game started successfully',
                'data' => $room
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to start game'
            ], 500);
        }
    }

    /**
     * Get leaderboard
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

        $leaderboard = DB::table('student_answers')
            ->join('game_sessions', 'student_answers.game_session_id', '=', 'game_sessions.id')
            ->join('users', 'student_answers.student_id', '=', 'users.id')
            ->where('game_sessions.room_id', $room->id)
            ->select(
                'users.id',
                'users.name',
                DB::raw('SUM(student_answers.score) as total_score'),
                DB::raw('COUNT(student_answers.id) as answered_questions'),
                DB::raw('SUM(CASE WHEN student_answers.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers')
            )
            ->groupBy('users.id', 'users.name')
            ->orderBy('total_score', 'desc')
            ->orderBy('answered_questions', 'desc')
            ->get();

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
