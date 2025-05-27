// script.js

// Matrix rain effect
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const cols = Math.floor(canvas.width / 20);
const drops = Array(cols).fill(1);

function drawMatrix() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0F0';
  ctx.font = '16px monospace';
  for (let i = 0; i < drops.length; i++) {
    const text = String.fromCharCode(0x30A0 + Math.random() * 96);
    ctx.fillText(text, i * 20, drops[i] * 20);
    if (drops[i] * 20 > canvas.height || Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  }
}
setInterval(drawMatrix, 50);

// Initialize xterm.js
const term = new Terminal({ cursorBlink: true });
term.open(document.getElementById('terminal'));
term.write('Welcome to my Matrix Terminal Portfolio\r\n');
term.write('Type / for help.\r\n\r\n');

// Simple prompt
const prompt = () => {
  term.write('\r\n> ');
};
prompt();

// Handle user input
term.onKey(e => {
  const char = e.key;
  if (char === '\r') {
    // Execute command (stub)
    prompt();
  } else if (char === '\u007f') {
    // Backspace
    term.write('\b \b');
  } else {
    term.write(char);
  }
});
