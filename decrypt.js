/**
 * CryptoVault — decrypt.js
 * Handles Caesar Cipher Decryption logic, reverse step visualizer, sessionStorage pickup, and navigation.
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
      ctx.fillStyle = `rgba(16, 185, 129, ${p.alpha})`;
      ctx.fill();

      for (let j = i + 1; j < COUNT; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(16, 185, 129, ${(1 - d / 120) * 0.18})`;
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
  const text = document.getElementById('ct-input').value;
  if (text.trim().length > 0) {
    doDecrypt(false);
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

  // Show reverse mapping: Cipher Char -> Plain Char
  const sample = ['D', 'E', 'F', 'G', 'H', 'I', 'A', 'B', 'C'];
  let html = '<div class="wheel-preview decrypt-preview">';
  sample.forEach(ch => {
    const code = ch.charCodeAt(0) - 65;
    const reversed = String.fromCharCode(((code - s + 260) % 26) + 65);
    html += `<span class="wheel-pair"><strong>${ch}</strong>→<span class="shifted-reverse">${reversed}</span></span>`;
  });
  html += '</div>';
  wheel.innerHTML = html;
}

function updateCount() {
  const text = document.getElementById('ct-input').value;
  const countEl = document.getElementById('char-count');
  if (countEl) {
    countEl.textContent = `${text.length} character${text.length === 1 ? '' : 's'}`;
  }
}

/* ── DECRYPT LOGIC ── */
function caesarDecryptChar(ch, shift) {
  const code = ch.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    const origPos = code - 65;
    const newPos = (origPos - shift + 260) % 26;
    return {
      char: String.fromCharCode(newPos + 65),
      orig: ch,
      pos: origPos,
      newPos: newPos,
      shifted: true
    };
  } else if (code >= 97 && code <= 122) {
    const origPos = code - 97;
    const newPos = (origPos - shift + 260) % 26;
    return {
      char: String.fromCharCode(newPos + 97),
      orig: ch,
      pos: origPos,
      newPos: newPos,
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

function doDecrypt(showNotification = true) {
  const ctInput = document.getElementById('ct-input');
  const ptOutput = document.getElementById('pt-output');
  const shiftInput = document.getElementById('shift-val');

  const text = ctInput.value;
  if (!text || text.trim().length === 0) {
    if (showNotification) showToast('Please enter ciphertext to decrypt!', 'error');
    ptOutput.value = '';
    renderEmptySteps();
    return;
  }

  const shift = (parseInt(shiftInput.value, 10) || 3) % 26;
  const transformed = [];
  let result = '';

  for (let i = 0; i < text.length; i++) {
    const t = caesarDecryptChar(text[i], shift);
    result += t.char;
    transformed.push(t);
  }

  ptOutput.value = result;

  // Flash highlight effect
  ptOutput.classList.add('flash-highlight');
  setTimeout(() => ptOutput.classList.remove('flash-highlight'), 600);

  // Render reverse visualizer
  renderSteps(transformed, shift);

  if (showNotification) {
    showToast(`Decrypted successfully with Shift -${shift}!`, 'success');
  }
}

/* ── STEP VISUALIZER ── */
function renderSteps(transformed, shift) {
  const container = document.getElementById('step-content');
  if (!container) return;

  const maxChars = 16;
  const charsToShow = transformed.slice(0, maxChars);

  let html = `<div class="step-grid decrypt-step-grid">`;
  charsToShow.forEach((item, idx) => {
    if (item.shifted) {
      html += `
        <div class="step-card decrypt-card">
          <div class="step-idx">#${idx + 1}</div>
          <div class="step-orig ct-color">${escapeHtml(item.orig)}</div>
          <div class="step-math math-minus">(−${shift})</div>
          <div class="step-arrow-down">↓</div>
          <div class="step-res pt-color">${escapeHtml(item.char)}</div>
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
    html += `<p class="step-more">+ ${transformed.length - maxChars} more characters decoded using the same (−${shift}) reverse formula</p>`;
  }

  container.innerHTML = html;
}

function renderEmptySteps() {
  const container = document.getElementById('step-content');
  if (container) {
    container.innerHTML = `<p class="step-placeholder">Decrypt a ciphertext to see reverse character decoding</p>`;
  }
}

/* ── ACTIONS ── */
function pasteFromSession() {
  try {
    const savedCt = sessionStorage.getItem('cryptovault_ct');
    const savedShift = sessionStorage.getItem('cryptovault_shift');

    if (savedCt) {
      document.getElementById('ct-input').value = savedCt;
      if (savedShift) {
        document.getElementById('shift-val').value = savedShift;
        updateShiftWheel();
      }
      updateCount();
      doDecrypt(false);
      showToast('Imported ciphertext from Encrypt page!', 'success');
    } else {
      showToast('No saved ciphertext found from Encrypt page yet.', 'info');
    }
  } catch (e) {
    showToast('Could not access session storage.', 'error');
  }
}

function goToEncrypt() {
  window.location.href = 'index.html';
}

function copyOutput() {
  const pt = document.getElementById('pt-output').value;
  if (!pt) {
    showToast('Nothing to copy yet. Decrypt something first!', 'error');
    return;
  }
  navigator.clipboard.writeText(pt).then(() => {
    showToast('Decrypted plain text copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy. Please select and copy manually.', 'error');
  });
}

function clearAll() {
  document.getElementById('ct-input').value = '';
  document.getElementById('pt-output').value = '';
  updateCount();
  renderEmptySteps();
  showToast('Cleared ciphertext and output', 'info');
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

  // Check if we came with data from Encrypt page
  let loadedFromSession = false;
  try {
    const savedCt = sessionStorage.getItem('cryptovault_ct');
    const savedShift = sessionStorage.getItem('cryptovault_shift');
    if (savedCt && savedCt.trim().length > 0) {
      document.getElementById('ct-input').value = savedCt;
      if (savedShift) {
        document.getElementById('shift-val').value = savedShift;
        updateShiftWheel();
      }
      updateCount();
      doDecrypt(false);
      loadedFromSession = true;
      setTimeout(() => {
        showToast('Auto-imported ciphertext from Encrypt page!', 'success');
      }, 350);
    }
  } catch (e) {}

  if (!loadedFromSession) {
    // Provide a sample ciphertext
    const ctInput = document.getElementById('ct-input');
    ctInput.value = 'FBCHU VHFXULWB LV WKH IXWXUH';
    document.getElementById('shift-val').value = '3';
    updateShiftWheel();
    updateCount();
    doDecrypt(false);
  }
});
