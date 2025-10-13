<?php

namespace App\Events;

use App\Models\GameRoom;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ParticipantLeft implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $room;
    public $participant;

    /**
     * Create a new event instance.
     */
    public function __construct(GameRoom $room, User $participant)
    {
        $this->room = $room;
        $this->participant = $participant;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('room.' . $this->room->room_code),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'participant.left';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'room' => $this->room->load(['participants.student']),
            'participant' => $this->participant,
            'participantCount' => $this->room->participants()->count(),
            'timestamp' => now()->toISOString()
        ];
    }
}