<?php

namespace App\Events;

use App\Models\GameRoom;
use App\Models\GameSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GameSessionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $room;
    public $session;
    public $eventType;
    public $data;

    /**
     * Create a new event instance.
     */
    public function __construct(GameRoom $room, GameSession $session = null, string $eventType = 'updated', array $data = [])
    {
        $this->room = $room;
        $this->session = $session;
        $this->eventType = $eventType;
        $this->data = $data;
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
        return 'game.session.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'room' => $this->room,
            'session' => $this->session ? $this->session->load('question') : null,
            'eventType' => $this->eventType,
            'data' => $this->data,
            'timestamp' => now()->toISOString()
        ];
    }
}
