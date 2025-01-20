const socket = io('https://your-vercel-backend.vercel.app/api/socket'); // Replace with your backend URL
const game = document.getElementById('game');

const players = {}; // Tracks all players and their data

// Ranks and their associated colors
const rankColors = {
  Bronze: 'bronze',
  Silver: 'silver',
  Gold: 'gold',
  Ruby: 'red',
  Saphire: 'lightblue',
  Obsidian: 'black',
  Diamond: 'linear-gradient(to bottom right, #fff, #00f, #0ff, #f0f)'
};

// Create a cursor element for a player
function createCursor(playerId) {
  const cursor = document.createElement('div');
  cursor.classList.add('cursor');
  cursor.id = `cursor-${playerId}`;

  const healthBar = document.createElement('div');
  healthBar.classList.add('health-bar');
  cursor.appendChild(healthBar);

  const rankDot = document.createElement('div');
  rankDot.classList.add('rank-dot');
  cursor.appendChild(rankDot);

  game.appendChild(cursor);
}

// Update the cursor with player data
function updateCursor(playerId, data) {
  let cursor = document.getElementById(`cursor-${playerId}`);
  if (!cursor) {
    createCursor(playerId);
    cursor = document.getElementById(`cursor-${playerId}`);
  }

  // Update position
  cursor.style.left = `${data.x}px`;
  cursor.style.top = `${data.y}px`;

  // Update health bar
  const healthBar = cursor.querySelector('.health-bar');
  healthBar.style.width = `${data.health / 2}px`;
  healthBar.style.backgroundColor = data.health > 50 ? 'green' : 'red';

  // Update rank dot color
  const rankDot = cursor.querySelector('.rank-dot');
  rankDot.style.background = rankColors[data.rank];
}

// Remove a cursor when a player disconnects
function removeCursor(playerId) {
  const cursor = document.getElementById(`cursor-${playerId}`);
  if (cursor) cursor.remove();
}

// Handle mouse movement
document.addEventListener('mousemove', (e) => {
  socket.emit('move', { x: e.clientX, y: e.clientY });
});

// Handle clicks (heal or attack)
document.addEventListener('click', (e) => {
  socket.emit('click', { x: e.clientX, y: e.clientY });
});

// Listen for updates from the server
socket.on('update', (playersData) => {
  for (const [playerId, data] of Object.entries(playersData)) {
    updateCursor(playerId, data);
  }
});

// Listen for player disconnections
socket.on('playerDisconnect', (playerId) => {
  removeCursor(playerId);
});
