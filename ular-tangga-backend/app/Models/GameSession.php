<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GameSession extends Model
{
    protected $fillable = [
        'room_id',
        'game_name',
        'max_players',
        'current_players',
        'player_positions',
        'board_state',
        'current_player_id',
        'turn_order',
        'status',
        'started_at',
        'ended_at'
    ];

    protected $casts = [
        'player_positions' => 'array',
        'board_state' => 'array',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(GameRoom::class, 'room_id');
    }

    public function currentPlayer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'current_player_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(GameSessionParticipant::class);
    }

    public function moves(): HasMany
    {
        return $this->hasMany(GameMove::class);
    }

    /**
     * Check if game session is full
     */
    public function isFull(): bool
    {
        return $this->current_players >= $this->max_players;
    }

    /**
     * Add a participant to this game session
     */
    public function addParticipant(int $participantId): GameSessionParticipant
    {
        if ($this->isFull()) {
            throw new \Exception('Game session is full');
        }

        $playerNumber = $this->current_players + 1;
        
        $participant = GameSessionParticipant::create([
            'game_session_id' => $this->id,
            'participant_id' => $participantId,
            'player_number' => $playerNumber,
            'current_position' => 0,
            'dice_rolls' => 0,
            'joined_at' => now()
        ]);

        $this->increment('current_players');
        
        // If this is the first player, set them as current player
        if ($this->current_players === 1) {
            $this->update(['current_player_id' => $participantId]);
        }

        return $participant;
    }

    /**
     * Start the game if we have at least 2 players
     */
    public function startGame(): bool
    {
        if ($this->current_players < 2) {
            return false;
        }

        $this->update([
            'status' => 'active',
            'started_at' => now()
        ]);

        return true;
    }

    /**
     * Get next player in turn order
     */
    public function getNextPlayer(): ?GameSessionParticipant
    {
        $currentParticipant = $this->participants()
            ->where('participant_id', $this->current_player_id)
            ->first();
            
        if (!$currentParticipant) {
            return $this->participants()->orderBy('player_number')->first();
        }

        $nextParticipant = $this->participants()
            ->where('player_number', '>', $currentParticipant->player_number)
            ->orderBy('player_number')
            ->first();

        // If no next player, wrap around to first player
        if (!$nextParticipant) {
            $nextParticipant = $this->participants()
                ->orderBy('player_number')
                ->first();
        }

        return $nextParticipant;
    }

    /**
     * Advance to next turn
     */
    public function nextTurn(): void
    {
        $nextPlayer = $this->getNextPlayer();
        
        if ($nextPlayer) {
            $this->update([
                'current_player_id' => $nextPlayer->participant_id,
                'turn_order' => $this->turn_order + 1
            ]);
        }
    }

    /**
     * Process a dice roll - returns position after dice but before question
     */
    public function processDiceRoll(int $playerId, int $diceValue): array
    {
        $participant = $this->participants()
            ->where('participant_id', $playerId)
            ->first();

        if (!$participant) {
            throw new \Exception('Player not found in this game session');
        }

        if ($this->current_player_id !== $playerId) {
            throw new \Exception('It is not your turn');
        }

        $positionBefore = $participant->current_position;
        $positionAfterDice = $positionBefore + $diceValue;

        // Don't go over 100
        if ($positionAfterDice > 100) {
            $positionAfterDice = 100 - ($positionAfterDice - 100);
        }

        // Check for snake or ladder at dice position
        $snakeLadderInfo = null;
        $snakeLadder = SnakeLadder::getSnakeOrLadder($positionAfterDice);
        if ($snakeLadder) {
            $snakeLadderInfo = $snakeLadder;
            $positionAfterDice = $snakeLadder['to_position'];
        }

        // Get a random question from the material
        $question = Question::where('material_id', $this->room->material_id)
            ->inRandomOrder()
            ->first();

        return [
            'position_before' => $positionBefore,
            'position_after_dice' => $positionAfterDice,
            'dice_value' => $diceValue,
            'snake_ladder_info' => $snakeLadderInfo,
            'question' => $question ? $this->loadQuestionDetails($question) : null,
            'participant' => $participant
        ];
    }

    /**
     * Process answer and complete the move
     */
    public function processAnswer(int $playerId, int $diceValue, array $moveData, $answer): array
    {
        $participant = $moveData['participant'];
        $question = $moveData['question'];
        $positionAfterDice = $moveData['position_after_dice'];
        $snakeLadderInfo = $moveData['snake_ladder_info'];

        $isCorrect = false;
        $bonusSteps = 0;
        $positionFinal = $positionAfterDice;

        // Evaluate answer if question exists
        if ($question) {
            $isCorrect = $this->evaluateAnswer($question, $answer);
            if ($isCorrect) {
                $bonusSteps = GameMove::getBonusSteps($question['difficulty'], true);
                $positionFinal = min($positionAfterDice + $bonusSteps, 100);
            }
        }

        // Check if player won
        $wonGame = $positionFinal >= 100;

        // Update participant position
        $participant->moveToPosition($positionFinal);

        // Record the move
        $move = GameMove::createMove(
            $this->id,
            $playerId,
            $this->turn_order,
            $diceValue,
            $moveData['position_before'],
            $positionAfterDice,
            $positionFinal,
            $snakeLadderInfo,
            $question['id'] ?? null,
            $answer,
            $isCorrect,
            $question['difficulty'] ?? null,
            $bonusSteps,
            $wonGame
        );

        // If player won, end the game
        if ($wonGame) {
            $this->update([
                'status' => 'finished',
                'ended_at' => now()
            ]);
        } else {
            // Advance to next turn
            $this->nextTurn();
        }

        return [
            'move' => $move,
            'participant' => $participant->fresh(),
            'question' => $question,
            'is_correct' => $isCorrect,
            'bonus_steps' => $bonusSteps,
            'snake_ladder_info' => $snakeLadderInfo,
            'won_game' => $wonGame,
            'next_player' => $wonGame ? null : $this->fresh()->currentPlayer
        ];
    }

    /**
     * Load question details based on subtype
     */
    private function loadQuestionDetails(Question $question): array
    {
        $questionData = $question->toArray();

        switch ($question->subtype) {
            case 'mcq':
                $questionData['options'] = McqOption::where('question_id', $question->id)->get();
                break;

            case 'true_false':
                $questionData['tf_statement'] = TfStatement::where('question_id', $question->id)->first();
                break;

            case 'matching':
                $questionData['matching_pairs'] = MatchingPair::where('question_id', $question->id)->get();
                break;
        }

        return $questionData;
    }

    /**
     * Evaluate student answer
     */
    private function evaluateAnswer(array $question, $answer): bool
    {
        switch ($question['subtype']) {
            case 'mcq':
                $correctOption = McqOption::where('question_id', $question['id'])
                    ->where('is_correct', true)
                    ->first();
                return $answer == $correctOption->id;

            case 'true_false':
                $statement = TfStatement::where('question_id', $question['id'])->first();
                return $answer == $statement->is_true;

            case 'matching':
                $pairs = MatchingPair::where('question_id', $question['id'])->get();
                $correctPairs = $pairs->pluck('right_item', 'left_item')->toArray();
                
                // For matching, answer should be an array of pairs
                if (is_array($answer)) {
                    $correctCount = 0;
                    foreach ($answer as $left => $right) {
                        if (isset($correctPairs[$left]) && $correctPairs[$left] == $right) {
                            $correctCount++;
                        }
                    }
                    return $correctCount == count($correctPairs);
                }
                return false;

            default:
                return false;
        }
    }
}
