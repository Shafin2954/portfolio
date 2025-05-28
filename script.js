// Matrix rain effect
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
let w = (canvas.width = window.innerWidth);
let h = (canvas.height = window.innerHeight);

// Change to 0,1 and A–Z
const matrixChars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const fontSize = 16;
const columns = Math.floor(w / fontSize);
const drops = Array(columns).fill(0);

function drawMatrix() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#0f0';
  ctx.font = `${fontSize}px monospace`;

  drops.forEach((y, i) => {
    const x = i * fontSize;
    const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
    ctx.fillText(text, x, y * fontSize);
    if (y * fontSize > h && Math.random() > 0.975) {
      drops[i] = 0;
    } else {
      drops[i]++;
    }
  });
}

setInterval(drawMatrix, 50);
window.addEventListener('resize', () => {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
});

// Terminal (xterm.js) setup
const { Terminal } = window;
const term = new Terminal({
  cursorBlink: true,
  theme: {
    background: 'transparent',
    foreground: '#DDD',    // light gray main text
    cursor:     '#0f0'     // keep the green cursor
  },
});
term.open(document.getElementById('terminal-container'));

// Simple file-structure state
let cwd = '/';
const updateCwdDisplay = () => {
  document.getElementById('cwd-display').textContent = cwd;
};
updateCwdDisplay();

// Basic prompt
const prompt = () => {
  term.write(
    `\r\n` +
    `\x1b[36muser@matrix\x1b[0m` +  // cyan username
    `:` +
    `\x1b[33m${cwd}\x1b[0m` +       // yellow cwd
    `$ `
  );
};

prompt();

// Handle input
term.onKey(e => {
  const ev = e.domEvent;
  const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;
  if (ev.key === 'Enter') {
    // For now, just re-prompt
    prompt();
  } else if (ev.key === 'Backspace') {
    term.write('\b \b');
  } else if (printable) {
    term.write(e.key);
  }
});

// Sidebar navigation (stub; clicking just changes cwd)
document.querySelectorAll('.sidebar-icon').forEach(el => {
  el.addEventListener('click', () => {
    cwd = el.getAttribute('data-path');
    updateCwdDisplay();
    term.write(`\r\nChanged directory to ${cwd}`);
    prompt();
  });
});
