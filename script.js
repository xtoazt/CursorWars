const socket = io('https://cursor-wars-backend.vercel.app/api/socket'); // Replace with your backend URL
const game = document.getElementById('game');

const players = {}; // Track all players and their data

// Create a cursor element for the current player
function createCursor(playerId) {
  const cursor = document.createElement('div');
  cursor.classList.add('cursor');
  cursor.id = `cursor-${playerId}`;
  
  const healthBar = document.createElement('div');
  healthBar.classList.add('health-bar');
  cursor.appendChild(healthBar);
  
  const rank = document.createElement('div');
  rank.classList.add('rank');
  cursor.appendChild(rank);

  game.appendChild(cursor);
}

// Update cursor position, health, and rank
function updateCursor(playerId, data) {
  let cursor = document.getElementById(`cursor-${playerId}`);
  
  if (!cursor) {
    createCursor(playerId);
    cursor = document.getElementById(`cursor-${playerId}`);
  }
  
  cursor.style.left = `${data.x}px`;
  cursor.style.top = `${data.y}px`;
  
  const healthBar = cursor.querySelector('.health-bar');
  healthBar.style.width = `${data.health}px`;
  healthBar.style.backgroundColor = data.health > 50 ? 'green' : 'red';
  
  const rank = cursor.querySelector('.rank');
  rank.textContent = `Rank: ${data.rank}`;
}

// Remove a player's cursor when they disconnect
function removeCursor(playerId) {
  const cursor = document.getElementById(`cursor-${playerId}`);
  if (cursor) {
    cursor.remove();
  }
}

// Send cursor movement data to the server
document.addEventListener('mousemove', (e) => {
  socket.emit('move', { x: e.clientX, y: e.clientY });
});

// Handle click events
document.addEventListener('click', (e) => {
  socket.emit('click', { x: e.clientX, y: e.clientY });
});

// Listen for updates from the server
socket.on('update', (playersData) => {
  for (const [playerId, data] of Object.entries(playersData)) {
    updateCursor(playerId, data);
  }
});

// Listen for a player disconnecting
socket.on('playerDisconnect', (playerId) => {
  removeCursor(playerId);
});
