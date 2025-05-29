// Matrix rain setup
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

const matrixChars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const fontSize = 16;
const columns = Math.floor(w / fontSize);
const drops = Array(columns).fill(0);

function drawMatrix() {
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#0f0';
  ctx.font = `${fontSize}px monospace`;

  drops.forEach((y, i) => {
    const x = i * fontSize;
    const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
    ctx.fillText(text, x, y * fontSize);
    drops[i] = y * fontSize > h && Math.random() > 0.975 ? 0 : y + 1;
  });
}
setInterval(drawMatrix, 50);
window.addEventListener('resize', () => {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
});

// xterm.js initialization
const { Terminal } = window;
const term = new Terminal({
  cursorBlink: true,
  theme: {
    background: 'transparent',
    foreground: '#39FF14', // neon green
    cursor: '#39FF14',
  },
});
term.open(document.getElementById('term'));

// Current directory state
let cwd = '/';
const updateCwd = () => {
  document.getElementById('cwd-display').textContent = cwd;
};
updateCwd();

// Prompt function (with auto-scroll)
const prompt = () => {
  term.write(
    `\r\n` +
    `\x1b[36muser@matrix\x1b[0m` +  // cyan user@matrix
    `:` +
    `\x1b[33m${cwd}\x1b[0m` +       // yellow cwd
    `$ `
  );
  term.scrollToBottom();
};
prompt();

// Key handling
term.onKey(e => {
  const ev = e.domEvent;
  const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;
  if (ev.key === 'Enter') {
    prompt();
  } else if (ev.key === 'Backspace') {
    term.write('\b \b');
  } else if (printable) {
    term.write(e.key);
  }
});

// Sidebar folder clicks
document.querySelectorAll('.sidebar-icon').forEach(el => {
  el.addEventListener('click', () => {
    cwd = el.getAttribute('data-path');
    updateCwd();
    term.write(`\r\nChanged directory to ${cwd}`);
    prompt();
  });
});
