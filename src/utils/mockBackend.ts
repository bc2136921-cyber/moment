export interface Room {
  id: string;
  creatorPhoto?: string;
  creatorStatus?: string;
  joinerPhoto?: string;
  joinerStatus?: string;
  status: 'waiting' | 'completed';
  createdAt: number;
}

const ROOMS_KEY = 'moment_rooms';
const bc = new BroadcastChannel('moment_channel');

export const mockBackend = {
  getRoom(id: string): Room | null {
    const rooms = JSON.parse(localStorage.getItem(ROOMS_KEY) || '{}');
    return rooms[id] || null;
  },

  createRoom(photo: string, status: string): string {
    const id = crypto.randomUUID();
    const newRoom: Room = {
      id,
      creatorPhoto: photo,
      creatorStatus: status,
      status: 'waiting',
      createdAt: Date.now(),
    };
    
    const rooms = JSON.parse(localStorage.getItem(ROOMS_KEY) || '{}');
    rooms[id] = newRoom;
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    
    // Broadcast creation
    bc.postMessage({ type: 'UPDATE_ROOM', room: newRoom });
    return id;
  },

  joinRoom(id: string, photo: string, status: string): Room {
    const rooms = JSON.parse(localStorage.getItem(ROOMS_KEY) || '{}');
    const room = rooms[id];
    
    if (!room) {
      throw new Error('Room not found');
    }
    
    room.joinerPhoto = photo;
    room.joinerStatus = status;
    room.status = 'completed';
    
    rooms[id] = room;
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    
    // Broadcast completion
    bc.postMessage({ type: 'UPDATE_ROOM', room });
    return room;
  },

  subscribe(id: string, callback: (room: Room) => void): () => void {
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'UPDATE_ROOM' && event.data.room.id === id) {
        callback(event.data.room);
      }
    };
    bc.addEventListener('message', handler);
    
    // Fallback polling for browsers that might have issues with BroadcastChannel
    let lastStatus = '';
    const interval = setInterval(() => {
      const room = mockBackend.getRoom(id);
      if (room && room.status !== lastStatus) {
        lastStatus = room.status;
        callback(room);
      }
    }, 1000);
    
    return () => {
      bc.removeEventListener('message', handler);
      clearInterval(interval);
    };
  }
};
