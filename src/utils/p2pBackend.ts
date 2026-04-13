import { Peer } from 'peerjs';

export interface Room {
  id: string;
  creatorPhoto?: string;
  creatorStatus?: string;
  joinerPhoto?: string;
  joinerStatus?: string;
  joinerCreatedAt?: number;
  status: 'waiting' | 'completed';
  createdAt: number;
}

// Memory store for local display purposes only. 
// Data synchronization between browsers will happen via PeerJS.
const localStore: Record<string, Room> = {};
const listeners: Record<string, ((room: Room) => void)[]> = {};

// Keep a global reference to the peer connection to avoid garbage collection
let myPeer: Peer | null = null;

const notifyListeners = (room: Room) => {
  if (listeners[room.id]) {
    listeners[room.id].forEach(cb => cb(room));
  }
};

export const p2pBackend = {
  getRoom(id: string): Room | null {
    return localStore[id] || null;
  },

  // 1. Creator initiates a room and waits for connections
  async createRoom(photo: string, status: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Generate a unique ID that will also serve as the PeerJS ID
      const roomId = 'moment-' + crypto.randomUUID().split('-')[0];
      
      const newRoom: Room = {
        id: roomId,
        creatorPhoto: photo,
        creatorStatus: status,
        status: 'waiting',
        createdAt: Date.now(),
      };
      
      localStore[roomId] = newRoom;
      
      myPeer = new Peer(roomId);

      myPeer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        resolve(id);
      });

      myPeer.on('connection', (conn) => {
        console.log('Incoming connection from', conn.peer);
        
        conn.on('data', (data: unknown) => {
          const payload = data as Record<string, unknown>;
          if (payload.type === 'JOIN') {
            // Update local state with joiner's data
            const room = localStore[roomId];
            if (room) {
              room.joinerPhoto = payload.photo as string;
              room.joinerStatus = payload.status as string;
              room.joinerCreatedAt = (payload.joinerCreatedAt as number) || Date.now();
              room.status = 'completed';
              
              // Send the complete room back to the joiner
              conn.send({
                type: 'COMPLETE',
                room: room
              });

              // Notify local UI
              notifyListeners(room);
            }
          }
        });
      });

      myPeer.on('error', (err) => {
        console.error('PeerJS error:', err);
        reject(err);
      });
    });
  },

  // 2. Joiner connects to creator's peer ID and sends their data
  async joinRoom(roomId: string, photo: string, status: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Joiner gets a random ID
      myPeer = new Peer();

      myPeer.on('open', () => {
        console.log('Joiner ready, connecting to', roomId);
        if(!myPeer) return reject("Peer not initialized");

        const conn = myPeer.connect(roomId, {
          reliable: true
        });

        conn.on('open', () => {
          console.log('Connected to creator!');
          
          // Send joiner's data to the creator
          conn.send({
            type: 'JOIN',
            photo: photo,
            status: status,
            joinerCreatedAt: Date.now()
          });
        });

        conn.on('data', (data: unknown) => {
          const payload = data as Record<string, unknown>;
          // Receive the completed room back from the creator
          if (payload.type === 'COMPLETE') {
            const room = payload.room as Room;
            localStore[roomId] = room;
            notifyListeners(room);
            resolve();
          }
        });

        conn.on('error', (err) => {
          console.error('Connection error:', err);
          reject(err);
        });
      });

      myPeer.on('error', (err) => {
        console.error('PeerJS error:', err);
        reject(err);
      });
    });
  },

  subscribe(id: string, callback: (room: Room) => void): () => void {
    if (!listeners[id]) {
      listeners[id] = [];
    }
    listeners[id].push(callback);
    
    return () => {
      listeners[id] = listeners[id].filter(cb => cb !== callback);
    };
  }
};