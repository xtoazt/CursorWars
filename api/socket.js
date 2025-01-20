import { Server } from 'socket.io';

let io;

export default function handler(req, res) {
  if (!io) {
    io = new Server(res.socket.server);
    res.socket.server.io = io;

    let players = {};

    io.on('connection', (socket) => {
      console.log(`Player connected: ${socket.id}`);

      // Initialize player
      players[socket.id] = {
        x: 200,
        y: 200,
        health: 100,
        rank: 1,
        kills: 0,
      };

      // Send all players data to the new player
      socket.emit('init', players);

      // Notify others of the new player
      socket.broadcast.emit('new-player', { id: socket.id, data: players[socket.id] });

      // Handle movement
      socket.on('move', (data) => {
        if (players[socket.id]) {
          players[socket.id].x = data.x;
          players[socket.id].y = data.y;
          io.emit('player-move', { id: socket.id, x: data.x, y: data.y });
        }
      });

      // Handle click actions
      socket.on('click', (data) => {
        if (data.type === 'attack') {
          const target = players[data.targetId];
          if (target) {
            const damage = 10 * players[socket.id].rank;
            target.health -= damage;
            if (target.health <= 0) {
              players[socket.id].kills += 1;
              players[socket.id].rank += 1;
              target.health = 100; // Respawn
              io.emit('player-death', { id: data.targetId });
            }
            io.emit('update-health', { id: data.targetId, health: target.health });
          }
        } else if (data.type === 'heal') {
          players[socket.id].health = Math.min(100, players[socket.id].health + 5);
          io.emit('update-health', { id: socket.id, health: players[socket.id].health });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('player-disconnect', { id: socket.id });
        console.log(`Player disconnected: ${socket.id}`);
      });
    });
  }
  res.end();
}
