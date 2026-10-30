/**
 * CryptoVault — encrypt.js
 * Handles Caesar Cipher Encryption logic, particle canvas, step visualizer, and navigation.
 */

/* ── PARTICLES BACKGROUND ── */
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = 35;
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 2.5 + 1.2,
      alpha: Math.random() * 0.35 + 0.15
    });
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < COUNT; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99, 102, 241, ${p.alpha})`;
      ctx.fill();

      for (let j = i + 1; j < COUNT; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${(1 - d / 120) * 0.18})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }
  frame();
}

/* ── SHIFT CONTROLS ── */
function adjustShift(delta) {
  const input = document.getElementById('shift-val');
  let val = parseInt(input.value, 10) || 3;
  val = Math.min(25, Math.max(1, val + delta));
  input.value = val;
  updateShiftWheel();
  // If user has input, re-encrypt live
  const text = document.getElementById('pt-input').value;
  if (text.trim().length > 0) {
    doEncrypt(false);
  }
}

function updateShiftWheel() {
  const input = document.getElementById('shift-val');
  let s = parseInt(input.value, 10);
  if (isNaN(s)) s = 3;
  if (s < 1) s = 1;
  if (s > 25) s = 25;
  input.value = s;

  const wheel = document.getElementById('shift-wheel');
  if (!wheel) return;

  const sample = ['A', 'B', 'C', 'D', 'E', 'F', 'X', 'Y', 'Z'];
  let html = '<div class="wheel-preview">';
  sample.forEach(ch => {
    const code = ch.charCodeAt(0) - 65;
    const shifted = String.fromCharCode(((code + s) % 26) + 65);
    html += `<span class="wheel-pair"><strong>${ch}</strong>→<span class="shifted">${shifted}</span></span>`;
  });
  html += '</div>';
  wheel.innerHTML = html;
}

function updateCount() {
  const text = document.getElementById('pt-input').value;
  const countEl = document.getElementById('char-count');
  if (countEl) {
    countEl.textContent = `${text.length} character${text.length === 1 ? '' : 's'}`;
  }
}

/* ── ENCRYPT LOGIC ── */
function caesarEncryptChar(ch, shift) {
  const code = ch.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    return {
      char: String.fromCharCode(((code - 65 + shift) % 26) + 65),
      orig: ch,
      pos: code - 65,
      newPos: (code - 65 + shift) % 26,
      shifted: true
    };
  } else if (code >= 97 && code <= 122) {
    return {
      char: String.fromCharCode(((code - 97 + shift) % 26) + 97),
      orig: ch,
      pos: code - 97,
      newPos: (code - 97 + shift) % 26,
      shifted: true
    };
  }
  return {
    char: ch,
    orig: ch,
    pos: null,
    newPos: null,
    shifted: false
  };
}

function doEncrypt(showNotification = true) {
  const ptInput = document.getElementById('pt-input');
  const ctOutput = document.getElementById('ct-output');
  const shiftInput = document.getElementById('shift-val');

  const text = ptInput.value;
  if (!text || text.trim().length === 0) {
    if (showNotification) showToast('Please enter some text to encrypt!', 'error');
    ctOutput.value = '';
    renderEmptySteps();
    return;
  }

  const shift = (parseInt(shiftInput.value, 10) || 3) % 26;
  const transformed = [];
  let result = '';

  for (let i = 0; i < text.length; i++) {
    const t = caesarEncryptChar(text[i], shift);
    result += t.char;
    transformed.push(t);
  }

  ctOutput.value = result;

  // Save to sessionStorage for Decrypt page transfer
  try {
    sessionStorage.setItem('cryptovault_ct', result);
    sessionStorage.setItem('cryptovault_shift', shift.toString());
  } catch (e) {
    console.warn('sessionStorage not available:', e);
  }

  // Highlight effect
  ctOutput.classList.add('flash-highlight');
  setTimeout(() => ctOutput.classList.remove('flash-highlight'), 600);

  // Render visualizer
  renderSteps(transformed, shift);

  if (showNotification) {
    showToast(`Encrypted successfully with Shift +${shift}!`, 'success');
  }
}

/* ── STEP VISUALIZER ── */
function renderSteps(transformed, shift) {
  const container = document.getElementById('step-content');
  if (!container) return;

  const maxChars = 16;
  const charsToShow = transformed.slice(0, maxChars);

  let html = `<div class="step-grid">`;
  charsToShow.forEach((item, idx) => {
    if (item.shifted) {
      html += `
        <div class="step-card">
          <div class="step-idx">#${idx + 1}</div>
          <div class="step-orig">${escapeHtml(item.orig)}</div>
          <div class="step-math">(+${shift})</div>
          <div class="step-arrow-down">↓</div>
          <div class="step-res">${escapeHtml(item.char)}</div>
          <div class="step-formula">[${item.pos}→${item.newPos}]</div>
        </div>
      `;
    } else {
      const displayChar = item.orig === ' ' ? '␣' : item.orig;
      html += `
        <div class="step-card non-alpha">
          <div class="step-idx">#${idx + 1}</div>
          <div class="step-orig">${escapeHtml(displayChar)}</div>
          <div class="step-math">same</div>
          <div class="step-arrow-down">↓</div>
          <div class="step-res">${escapeHtml(displayChar)}</div>
          <div class="step-formula">no shift</div>
        </div>
      `;
    }
  });
  html += `</div>`;

  if (transformed.length > maxChars) {
    html += `<p class="step-more">+ ${transformed.length - maxChars} more characters encrypted using the same (+${shift}) formula</p>`;
  }

  container.innerHTML = html;
}

function renderEmptySteps() {
  const container = document.getElementById('step-content');
  if (container) {
    container.innerHTML = `<p class="step-placeholder">Encrypt a message to see each character's transformation</p>`;
  }
}

/* ── ACTIONS ── */
function goToDecrypt() {
  const ct = document.getElementById('ct-output').value;
  const shift = document.getElementById('shift-val').value;

  if (ct) {
    try {
      sessionStorage.setItem('cryptovault_ct', ct);
      sessionStorage.setItem('cryptovault_shift', shift);
    } catch (e) {}
  }

  window.location.href = 'decrypt.html';
}

function copyOutput() {
  const ct = document.getElementById('ct-output').value;
  if (!ct) {
    showToast('Nothing to copy yet. Encrypt something first!', 'error');
    return;
  }
  navigator.clipboard.writeText(ct).then(() => {
    showToast('Ciphertext copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy. Please select and copy manually.', 'error');
  });
}

function clearAll() {
  document.getElementById('pt-input').value = '';
  document.getElementById('ct-output').value = '';
  updateCount();
  renderEmptySteps();
  showToast('Cleared input & output', 'info');
}

function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 2800);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ── INITIALIZATION ── */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  updateShiftWheel();
  updateCount();

  // If input already has text, encrypt immediately
  const ptInput = document.getElementById('pt-input');
  if (ptInput && ptInput.value.trim().length > 0) {
    doEncrypt(false);
  } else {
    // Provide a sample secret phrase
    ptInput.value = 'CYBER SECURITY IS THE FUTURE';
    updateCount();
    doEncrypt(false);
  }
});
