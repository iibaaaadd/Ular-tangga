<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GameRoom extends Model
{
    protected $fillable = [
        'room_code',
        'room_name',
        'teacher_id',
        'material_id',
        'status',
        'max_participants',
        'started_at',
        'finished_at'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(RoomParticipant::class, 'room_id');
    }

    public function gameSessions(): HasMany
    {
        return $this->hasMany(GameSession::class, 'room_id');
    }

    // Generate unique room code
    public static function generateRoomCode(): string
    {
        do {
            $code = strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 6));
        } while (self::where('room_code', $code)->exists());

        return $code;
    }

    /**
     * Auto-create game sessions based on participants
     * Groups participants into sessions of max 4 players each
     */
    public function createGameSessions(): array
    {
        $participants = $this->participants()->get();
        $participantCount = $participants->count();

        if ($participantCount < 2) {
            throw new \Exception('At least 2 participants are required to create game sessions');
        }

        // Calculate how many game sessions we need
        $fullSessions = intval($participantCount / 4); // Complete sessions of 4 players
        $remainingPlayers = $participantCount % 4;

        $gameSessions = [];
        $participantIndex = 0;

        // Create full sessions of 4 players
        for ($i = 1; $i <= $fullSessions; $i++) {
            $gameSession = GameSession::create([
                'room_id' => $this->id,
                'game_name' => "Ular Tangga Game {$i}",
                'max_players' => 4,
                'current_players' => 0,
                'turn_order' => 1,
                'status' => 'waiting'
            ]);

            // Add 4 participants to this session
            for ($j = 0; $j < 4; $j++) {
                $participant = $participants[$participantIndex];
                $gameSession->addParticipant($participant->student_id);
                $participantIndex++;
            }

            $gameSessions[] = $gameSession;
        }

        // Handle remaining players
        if ($remainingPlayers >= 2) {
            $gameSession = GameSession::create([
                'room_id' => $this->id,
                'game_name' => "Ular Tangga Game " . ($fullSessions + 1),
                'max_players' => 4,
                'current_players' => 0,
                'turn_order' => 1,
                'status' => 'waiting'
            ]);

            // Add remaining participants
            for ($j = 0; $j < $remainingPlayers; $j++) {
                $participant = $participants[$participantIndex];
                $gameSession->addParticipant($participant->student_id);
                $participantIndex++;
            }

            $gameSessions[] = $gameSession;
        } elseif ($remainingPlayers === 1 && count($gameSessions) > 0) {
            // Add the last participant to the last created session
            $lastSession = end($gameSessions);
            $participant = $participants[$participantIndex];
            $lastSession->addParticipant($participant->student_id);
        }

        return $gameSessions;
    }

    /**
     * Start all game sessions for this room
     */
    public function startAllGames(): array
    {
        $gameSessions = $this->gameSessions()->where('status', 'waiting')->get();
        $startedSessions = [];

        foreach ($gameSessions as $session) {
            if ($session->startGame()) {
                $startedSessions[] = $session;
            }
        }

        if (!empty($startedSessions)) {
            $this->update([
                'status' => 'playing',
                'started_at' => now()
            ]);
        }

        return $startedSessions;
    }

    /**
     * Check if all games in this room are finished
     */
    public function areAllGamesFinished(): bool
    {
        $totalGames = $this->gameSessions()->count();
        $finishedGames = $this->gameSessions()->where('status', 'finished')->count();

        return $totalGames > 0 && $totalGames === $finishedGames;
    }

    /**
     * Get overall leaderboard for the room (all games combined)
     */
    public function getOverallLeaderboard(): array
    {
        $leaderboard = [];
        
        foreach ($this->gameSessions as $session) {
            foreach ($session->participants as $participant) {
                $userId = $participant->participant_id;
                $user = $participant->participant;
                
                if (!isset($leaderboard[$userId])) {
                    $leaderboard[$userId] = [
                        'id' => $userId,
                        'name' => $user->name,
                        'games_played' => 0,
                        'games_won' => 0,
                        'total_moves' => 0,
                        'best_position' => 0,
                        'average_position' => 0
                    ];
                }

                $leaderboard[$userId]['games_played']++;
                $leaderboard[$userId]['total_moves'] += $participant->dice_rolls;
                $leaderboard[$userId]['best_position'] = max($leaderboard[$userId]['best_position'], $participant->current_position);
                
                // Check if this participant won their game
                if ($participant->current_position >= 100) {
                    $leaderboard[$userId]['games_won']++;
                }
            }
        }

        // Calculate averages and sort
        foreach ($leaderboard as $userId => &$stats) {
            $stats['average_position'] = $stats['games_played'] > 0 ? 
                round($stats['best_position'] / $stats['games_played'], 1) : 0;
        }

        // Sort by games won, then by best position, then by fewer moves
        usort($leaderboard, function($a, $b) {
            if ($a['games_won'] !== $b['games_won']) {
                return $b['games_won'] - $a['games_won'];
            }
            if ($a['best_position'] !== $b['best_position']) {
                return $b['best_position'] - $a['best_position'];
            }
            return $a['total_moves'] - $b['total_moves'];
        });

        return array_values($leaderboard);
    }
}
