import { playBeep } from './assets.js';

let toastTimer = null;
export function showToast(text, timeout=2000){
  const t = document.getElementById('toast'); if(!t) return;
  t.textContent = text;
  t.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('visible'), timeout);
}

export function bindToolbar(callback){
  document.querySelectorAll('.bottom-toolbar .tool').forEach(btn => {
    btn.addEventListener('click', ()=>{ playBeep('click'); callback(btn.dataset.tool); });
  });
}

export function showPanel(id, html){
  const p = document.getElementById(id); if(!p) return;
  p.innerHTML = html;
  p.classList.toggle('hidden', !html);
}

export function closeAllPanels(){
  document.querySelectorAll('.panel.popup').forEach(p => p.classList.add('hidden'));
}

export function setTopbar(coins, level, xpPct){
  const c = document.getElementById('coins-count'); if(c) c.textContent = coins;
  const lv = document.getElementById('player-level'); if(lv) lv.textContent = `Lv ${level}`;
  const xp = document.getElementById('xp-fill'); if(xp) xp.style.width = (Math.max(0, Math.min(100,xpPct*100))) + '%';
}

export function hideLoading(){ document.getElementById('loading-screen').classList.remove('active'); document.getElementById('loading-screen').classList.add('hidden'); }

export function bindSettingsButton(openSettings){
  const btn = document.getElementById('btn-settings'); if(!btn) return;
  btn.addEventListener('click', ()=> openSettings());
}

export function animateCoin() {
  const coinIcon = document.querySelector('.stat .icon');
  if (coinIcon) { coinIcon.classList.add('coin-bounce'); setTimeout(() => coinIcon.classList.remove('coin-bounce'), 400); }
  const coinText = document.getElementById('coins-count');
  if (coinText) { coinText.classList.add('coin-bounce'); setTimeout(() => coinText.classList.remove('coin-bounce'), 400); }
}

export function spawnConfetti(count = 30) {
  const container = document.createElement('div');
  container.className = 'confetti';
  container.style.left = '50%';
  container.style.top = '40%';
  const colors = ['#f2b134','#ff6b6b','#48c774','#3b82f6','#a855f7','#ec4899'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = Math.random() * 360;
    const dist = 60 + Math.random() * 140;
    const tx = Math.cos(angle * Math.PI / 180) * dist;
    const ty = Math.sin(angle * Math.PI / 180) * dist;
    piece.style.cssText = `background:${color};left:${50 + tx * 0.3}px;top:${ty * 0.3}px;animation-delay:${Math.random() * 0.3}s;transform:rotate(${Math.random() * 360}deg);`;
    container.appendChild(piece);
  }
  document.body.appendChild(container);
  setTimeout(() => container.remove(), 2000);
}
