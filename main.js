// main.js - lista, busca, filtros e squad (localStorage)
let PLAYERS = [];
let state = { players: [], squad: [] };

async function init(){
  try{
    const res = await fetch('data/players.json');
    PLAYERS = await res.json();
  }catch(e){
    console.error('Erro ao carregar players.json', e);
    PLAYERS = [];
  }

  // fill position select
  const posSet = new Set(PLAYERS.map(p=>p.position).filter(Boolean));
  const sel = document.getElementById('filterPos');
  posSet.forEach(pos=>{
    const o = document.createElement('option'); o.value = pos; o.textContent = pos; sel.appendChild(o);
  });

  state.players = PLAYERS.slice();
  state.squad = loadSquad();
  bind();
  renderPlayers();
  renderSquad();
}

function bind(){
  document.getElementById('search').addEventListener('input', onSearch);
  document.getElementById('filterPos').addEventListener('change', onSearch);
  document.getElementById('reset').addEventListener('click', ()=>{
    document.getElementById('search').value='';
    document.getElementById('filterPos').value='';
    onSearch();
  });
  document.getElementById('autoBuild').addEventListener('click', autoBuild);
  document.getElementById('exportSquad').addEventListener('click', exportSquad);
  document.getElementById('clearSquad').addEventListener('click', ()=>{ state.squad=[]; saveSquad(); renderSquad(); });
}

function onSearch(){
  const q = document.getElementById('search').value.trim().toLowerCase();
  const pos = document.getElementById('filterPos').value;
  state.players = PLAYERS.filter(p=>{
    const text = (p.name + ' ' + p.position + ' ' + p.ovr).toLowerCase();
    if(q && !text.includes(q)) return false;
    if(pos && p.position !== pos) return false;
    return true;
  });
  renderPlayers();
}

function renderPlayers(){
  const wrap = document.getElementById('players'); wrap.innerHTML='';
  state.players.forEach(p=>{
    const div = document.createElement('div'); div.className='player';
    div.innerHTML = `<h3>${p.name} <small style="float:right">${p.position}</small></h3>
      <div class="meta">OVR ${p.ovr} • Custo ${p.cost}</div>`;
    div.addEventListener('click', ()=> {
      // preview detail on right panel + navigate to player page
      showDetailPanel(p);
      // open full page:
      window.location.href = `player.html?id=${encodeURIComponent(p.id)}`;
    });
    wrap.appendChild(div);
  });
}

function showDetailPanel(p){
  const container = document.getElementById('playerDetail');
  container.className = '';
  container.innerHTML = `<h4>${p.name} (${p.position})</h4>
    <div class="meta">OVR ${p.ovr} • Contrato ${p.contract_weeks} semanas • Custo ${p.cost}</div>
    <ul class="meta">
      <li>Pace: ${p.attributes.pace}</li>
      <li>Shooting: ${p.attributes.shooting}</li>
      <li>Passing: ${p.attributes.passing}</li>
      <li>Dribbling: ${p.attributes.dribbling}</li>
      <li>Defense: ${p.attributes.defense}</li>
      <li>Physical: ${p.attributes.physical}</li>
    </ul>
    <div style="margin-top:8px"><button id="panelAdd">Adicionar ao Squad</button></div>`;
  document.getElementById('panelAdd').addEventListener('click', ()=> addToSquad(p));
}

function addToSquad(p){
  if(state.squad.find(s=>s.id===p.id)){ alert('Já no squad'); return; }
  state.squad.push(p); saveSquad(); renderSquad();
}

function renderSquad(){
  const wrap = document.getElementById('squadList'); wrap.innerHTML='';
  if(state.squad.length===0){ wrap.innerHTML='<div class="empty">Squad vazio</div>'; updateSummary(); return; }
  state.squad.forEach((s,idx)=>{
    const el = document.createElement('div'); el.className='squad-item';
    el.innerHTML = `<div><strong>${s.name}</strong><div class="meta">${s.position} • OVR ${s.ovr}</div></div><div><button data-idx="${idx}" class="remove">Remover</button></div>`;
    wrap.appendChild(el);
  });
  wrap.querySelectorAll('.remove').forEach(btn=>btn.addEventListener('click', e=>{ const idx=+e.target.dataset.idx; state.squad.splice(idx,1); saveSquad(); renderSquad(); }));
  updateSummary();
}

function updateSummary(){
  const totalOvr = state.squad.reduce((s,p)=>s+p.ovr,0);
  const totalCost = state.squad.reduce((s,p)=>s+p.cost,0);
  document.getElementById('totalOvr').textContent = totalOvr;
  document.getElementById('totalCost').textContent = totalCost;
}

function saveSquad(){ localStorage.setItem('bug_efootball_squad', JSON.stringify(state.squad)); updateSummary(); }
function loadSquad(){ try{ return JSON.parse(localStorage.getItem('bug_efootball_squad')) || [] }catch(e){return []} }

function exportSquad(){
  const dataStr = JSON.stringify({players: state.squad, exported_at: new Date().toISOString()}, null, 2);
  const blob = new Blob([dataStr], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'squad-bug-personagem.json'; a.click(); URL.revokeObjectURL(url);
}

function autoBuild(){
  // greedy: pick highest OVR distinct players until 11 or available
  const need = 11;
  const sorted = PLAYERS.slice().sort((a,b)=>b.ovr - a.ovr);
  const pick = [];
  for(let p of sorted){
    if(pick.length>=need) break;
    if(!pick.find(x=>x.id===p.id)) pick.push(p);
  }
  state.squad = pick.slice(0,need);
  saveSquad(); renderSquad();
}

init();
