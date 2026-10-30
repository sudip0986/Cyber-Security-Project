/**
 * CryptoVault — script.js
 * One-Page Slide Controller, Caesar Cipher Engine, and Interactive Educational Visualizer
 */

'use strict';

/* ── STATE ── */
let currentSlide = 0;
const TOTAL_SLIDES = 3;

/* ── SLIDE NAVIGATION ── */
function goToSlide(index) {
  if (index < 0 || index >= TOTAL_SLIDES) return;
  currentSlide = index;

  const track = document.getElementById('slidesTrack');
  if (track) {
    // slidesTrack is 300% width, so each slide is 1/3 (33.333333%) of the track
    const percentage = (currentSlide * 100) / TOTAL_SLIDES;
    track.style.transform = `translateX(-${percentage}%)`;
  }

  // Update slide panels active state
  const panels = document.querySelectorAll('.slide-panel');
  panels.forEach((p, i) => {
    if (i === currentSlide) {
      p.classList.add('active-slide');
    } else {
      p.classList.remove('active-slide');
    }
  });

  // Update tabs
  for (let i = 0; i < TOTAL_SLIDES; i++) {
    const tab = document.getElementById(`tab-${i}`);
    if (tab) {
      if (i === currentSlide) tab.classList.add('active');
      else tab.classList.remove('active');
    }
  }

  // Update dots
  const dots = document.querySelectorAll('.slide-dots .dot');
  dots.forEach((dot, i) => {
    if (i === currentSlide) dot.classList.add('active');
    else dot.classList.remove('active');
  });

  // Update counter
  const counter = document.getElementById('slide-counter');
  if (counter) {
    counter.textContent = `Slide ${currentSlide + 1} / ${TOTAL_SLIDES}`;
  }

  // Update prev/next button states
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  if (prevBtn) prevBtn.disabled = currentSlide === 0;
  if (nextBtn) nextBtn.disabled = currentSlide === TOTAL_SLIDES - 1;

  // Sync URL hash
  const hashes = ['#encrypt', '#decrypt', '#how'];
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, null, hashes[currentSlide]);
  }

  // Window scroll to top for comfortable viewing
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextSlide() {
  if (currentSlide < TOTAL_SLIDES - 1) {
    goToSlide(currentSlide + 1);
  }
}

function prevSlide() {
  if (currentSlide > 0) {
    goToSlide(currentSlide - 1);
  }
}

// Keyboard arrow navigation
document.addEventListener('keydown', (e) => {
  // Only trigger if not actively typing inside a textarea or input
  if (['TEXTAREA', 'INPUT'].includes(document.activeElement?.tagName)) return;
  if (e.key === 'ArrowRight') nextSlide();
  else if (e.key === 'ArrowLeft') prevSlide();
});


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

  const COUNT = 32;
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
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
          ctx.strokeStyle = `rgba(99, 102, 241, ${(1 - d / 120) * 0.16})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }
  frame();
}


/* ── CAESAR CIPHER MATHEMATICS ── */
function caesarTransformChar(ch, shift, isEncrypt = true) {
  const code = ch.charCodeAt(0);
  const effectiveShift = isEncrypt ? shift : (260 - shift) % 26;

  if (code >= 65 && code <= 90) { // Uppercase
    const origPos = code - 65;
    const newPos = (origPos + effectiveShift) % 26;
    return {
      char: String.fromCharCode(newPos + 65),
      orig: ch,
      pos: origPos,
      newPos: newPos,
      shifted: true
    };
  } else if (code >= 97 && code <= 122) { // Lowercase
    const origPos = code - 97;
    const newPos = (origPos + effectiveShift) % 26;
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


/* ── SLIDE 1: ENCRYPT LOGIC ── */
function getEncryptShift() {
  const val = parseInt(document.getElementById('shift-input')?.value, 10);
  return isNaN(val) ? 3 : Math.min(25, Math.max(1, val));
}

function changeShift(delta) {
  const input = document.getElementById('shift-input');
  if (!input) return;
  let val = getEncryptShift() + delta;
  val = Math.min(25, Math.max(1, val));
  input.value = val;
  updateEncryptWheel();
  executeEncrypt(false);
}

function onShiftInputChange() {
  updateEncryptWheel();
  executeEncrypt(false);
}

function updateEncryptWheel() {
  const s = getEncryptShift();
  const preview = document.getElementById('encrypt-wheel-preview');
  if (!preview) return;

  const samples = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  let html = '';
  samples.forEach(ch => {
    const t = caesarTransformChar(ch, s, true);
    html += `<span class="pair">${ch}→<strong>${t.char}</strong></span>`;
  });
  preview.innerHTML = html;
}

function handleEncryptInput() {
  const text = document.getElementById('pt-input')?.value || '';
  const countEl = document.getElementById('pt-count');
  if (countEl) countEl.textContent = `${text.length} chars`;
  executeEncrypt(false);
}

function executeEncrypt(showNotification = false) {
  const ptInput = document.getElementById('pt-input');
  const ctOutput = document.getElementById('ct-output');
  if (!ptInput || !ctOutput) return;

  const text = ptInput.value;
  const shift = getEncryptShift();

  if (!text || text.trim().length === 0) {
    ctOutput.value = '';
    renderEncryptSteps([]);
    return;
  }

  const transformed = [];
  let cipherText = '';

  for (let i = 0; i < text.length; i++) {
    const t = caesarTransformChar(text[i], shift, true);
    cipherText += t.char;
    transformed.push(t);
  }

  ctOutput.value = cipherText;
  renderEncryptSteps(transformed, shift);

  // Auto-sync ciphertext to Decrypt Slide so user can transition seamlessly
  const decryptInput = document.getElementById('ct-input');
  const decryptShift = document.getElementById('decrypt-shift-input');
  if (decryptInput) {
    decryptInput.value = cipherText;
    const ctCount = document.getElementById('ct-count');
    if (ctCount) ctCount.textContent = `${cipherText.length} chars`;
  }
  if (decryptShift) {
    decryptShift.value = shift;
    updateDecryptWheel();
  }
  executeDecrypt(false);

  if (showNotification) {
    showToast(`Encrypted with Shift +${shift}!`, 'success');
  }
}

function runEncryptAndSlide() {
  const ptInput = document.getElementById('pt-input');
  if (!ptInput || ptInput.value.trim().length === 0) {
    showToast('Please type some text first!', 'error');
    return;
  }
  executeEncrypt(true);
  // Smoothly slide to Decrypt Slide (Slide 2)
  setTimeout(() => {
    goToSlide(1);
    showToast('Slid to Decryption! Ciphertext imported.', 'info');
  }, 350);
}

function renderEncryptSteps(transformed, shift = 3) {
  const grid = document.getElementById('encrypt-vis-grid');
  if (!grid) return;

  if (transformed.length === 0) {
    grid.innerHTML = `<p class="vis-empty">Type letters above to see live character-by-character transformation.</p>`;
    return;
  }

  const max = 12;
  const items = transformed.slice(0, max);
  let html = '';

  items.forEach((item, idx) => {
    const displayOrig = item.orig === ' ' ? '␣' : item.orig;
    const displayRes = item.char === ' ' ? '␣' : item.char;

    if (item.shifted) {
      html += `
        <div class="vis-card">
          <span class="vis-idx">#${idx + 1}</span>
          <span class="vis-orig">${escapeHtml(displayOrig)}</span>
          <span class="vis-math">(+${shift})</span>
          <span class="vis-arrow">↓</span>
          <span class="vis-res">${escapeHtml(displayRes)}</span>
        </div>
      `;
    } else {
      html += `
        <div class="vis-card non-alpha">
          <span class="vis-idx">#${idx + 1}</span>
          <span class="vis-orig">${escapeHtml(displayOrig)}</span>
          <span class="vis-math">same</span>
          <span class="vis-arrow">↓</span>
          <span class="vis-res">${escapeHtml(displayRes)}</span>
        </div>
      `;
    }
  });

  if (transformed.length > max) {
    html += `<div class="vis-more">+${transformed.length - max} more</div>`;
  }
  grid.innerHTML = html;
}

function clearEncrypt() {
  document.getElementById('pt-input').value = '';
  document.getElementById('ct-output').value = '';
  document.getElementById('pt-count').textContent = '0 chars';
  renderEncryptSteps([]);
  showToast('Cleared encryption workspace', 'info');
}


/* ── SLIDE 2: DECRYPT LOGIC ── */
function getDecryptShift() {
  const val = parseInt(document.getElementById('decrypt-shift-input')?.value, 10);
  return isNaN(val) ? 3 : Math.min(25, Math.max(1, val));
}

function changeDecryptShift(delta) {
  const input = document.getElementById('decrypt-shift-input');
  if (!input) return;
  let val = getDecryptShift() + delta;
  val = Math.min(25, Math.max(1, val));
  input.value = val;
  updateDecryptWheel();
  executeDecrypt(false);
}

function onDecryptShiftInputChange() {
  updateDecryptWheel();
  executeDecrypt(false);
}

function updateDecryptWheel() {
  const s = getDecryptShift();
  const preview = document.getElementById('decrypt-wheel-preview');
  if (!preview) return;

  const samples = ['D', 'E', 'F', 'A', 'B', 'C'];
  let html = '';
  samples.forEach(ch => {
    const t = caesarTransformChar(ch, s, false);
    html += `<span class="pair">${ch}→<strong class="green-txt">${t.char}</strong></span>`;
  });
  preview.innerHTML = html;
}

function handleDecryptInput() {
  const text = document.getElementById('ct-input')?.value || '';
  const countEl = document.getElementById('ct-count');
  if (countEl) countEl.textContent = `${text.length} chars`;
  executeDecrypt(false);
}

function executeDecrypt(showNotification = false) {
  const ctInput = document.getElementById('ct-input');
  const ptOutput = document.getElementById('pt-output');
  if (!ctInput || !ptOutput) return;

  const text = ctInput.value;
  const shift = getDecryptShift();

  if (!text || text.trim().length === 0) {
    ptOutput.value = '';
    renderDecryptSteps([]);
    return;
  }

  const transformed = [];
  let plainText = '';

  for (let i = 0; i < text.length; i++) {
    const t = caesarTransformChar(text[i], shift, false);
    plainText += t.char;
    transformed.push(t);
  }

  ptOutput.value = plainText;
  renderDecryptSteps(transformed, shift);

  if (showNotification) {
    showToast(`Decrypted with Shift −${shift}!`, 'success');
  }
}

function runDecrypt() {
  const ctInput = document.getElementById('ct-input');
  if (!ctInput || ctInput.value.trim().length === 0) {
    showToast('Enter ciphertext first!', 'error');
    return;
  }
  executeDecrypt(true);
}

function syncFromEncrypt() {
  const ctOutput = document.getElementById('ct-output')?.value;
  const encryptShift = getEncryptShift();

  if (ctOutput && ctOutput.trim().length > 0) {
    document.getElementById('ct-input').value = ctOutput;
    document.getElementById('decrypt-shift-input').value = encryptShift;
    document.getElementById('ct-count').textContent = `${ctOutput.length} chars`;
    updateDecryptWheel();
    executeDecrypt(false);
    showToast('Synced ciphertext & shift key from Encrypt slide!', 'success');
  } else {
    showToast('No ciphertext available in Encrypt slide yet.', 'info');
  }
}

function renderDecryptSteps(transformed, shift = 3) {
  const grid = document.getElementById('decrypt-vis-grid');
  if (!grid) return;

  if (transformed.length === 0) {
    grid.innerHTML = `<p class="vis-empty">Decryption character decoding cards will appear here.</p>`;
    return;
  }

  const max = 12;
  const items = transformed.slice(0, max);
  let html = '';

  items.forEach((item, idx) => {
    const displayOrig = item.orig === ' ' ? '␣' : item.orig;
    const displayRes = item.char === ' ' ? '␣' : item.char;

    if (item.shifted) {
      html += `
        <div class="vis-card decrypt-vis-card">
          <span class="vis-idx">#${idx + 1}</span>
          <span class="vis-orig purple-txt">${escapeHtml(displayOrig)}</span>
          <span class="vis-math teal-txt">(−${shift})</span>
          <span class="vis-arrow">↓</span>
          <span class="vis-res green-txt">${escapeHtml(displayRes)}</span>
        </div>
      `;
    } else {
      html += `
        <div class="vis-card non-alpha">
          <span class="vis-idx">#${idx + 1}</span>
          <span class="vis-orig">${escapeHtml(displayOrig)}</span>
          <span class="vis-math">same</span>
          <span class="vis-arrow">↓</span>
          <span class="vis-res">${escapeHtml(displayRes)}</span>
        </div>
      `;
    }
  });

  if (transformed.length > max) {
    html += `<div class="vis-more">+${transformed.length - max} more</div>`;
  }
  grid.innerHTML = html;
}

function clearDecrypt() {
  document.getElementById('ct-input').value = '';
  document.getElementById('pt-output').value = '';
  document.getElementById('ct-count').textContent = '0 chars';
  renderDecryptSteps([]);
  showToast('Cleared decryption workspace', 'info');
}


/* ── SLIDE 3: HOW IT WORKS INTERACTIVE ── */
function updateHowAlphabet(val) {
  const shift = parseInt(val, 10);
  const label = document.getElementById('how-shift-val');
  if (label) label.textContent = shift;

  const display = document.getElementById('alphabet-display');
  if (!display) return;

  let plainRow = '<div class="alpha-row"><span class="row-tag">P:</span>';
  let cipherRow = '<div class="alpha-row"><span class="row-tag">C:</span>';

  for (let i = 0; i < 26; i++) {
    const pChar = String.fromCharCode(65 + i);
    const cChar = String.fromCharCode(((i + shift) % 26) + 65);
    plainRow += `<span class="alpha-letter">${pChar}</span>`;
    cipherRow += `<span class="alpha-letter shift-letter">${cChar}</span>`;
  }
  plainRow += '</div>';
  cipherRow += '</div>';

  display.innerHTML = plainRow + cipherRow;
}


/* ── UTILITIES ── */
function copyText(elemId, label = 'Text') {
  const elem = document.getElementById(elemId);
  if (!elem || !elem.value) {
    showToast(`Nothing to copy from ${label}!`, 'error');
    return;
  }
  navigator.clipboard.writeText(elem.value).then(() => {
    showToast(`${label} copied to clipboard!`, 'success');
  }).catch(() => {
    showToast('Failed to copy. Please copy manually.', 'error');
  });
}

function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = 'toast';
  }, 2600);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}


/* ── APP BOOTSTRAP ── */
function resolveInitialSlide() {
  const hash = (window.location.hash || '').toLowerCase();
  if (hash === '#decrypt') return 1;
  if (hash === '#how') return 2;
  return 0;
}

window.addEventListener('hashchange', () => {
  goToSlide(resolveInitialSlide());
});

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  updateEncryptWheel();
  updateDecryptWheel();
  updateHowAlphabet(3);

  // Default sample phrase for immediate visual impact
  const ptInput = document.getElementById('pt-input');
  if (ptInput) {
    ptInput.value = 'SECURITY DEMO 2026';
    handleEncryptInput();
  }

  // Go to initial slide (supports #encrypt, #decrypt, #how)
  goToSlide(resolveInitialSlide());
});
