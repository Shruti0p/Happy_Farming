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
