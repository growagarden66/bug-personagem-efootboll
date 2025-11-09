// player.js - carrega player.html?id=...
async function initPlayer(){
  const qs = new URLSearchParams(window.location.search);
  const id = qs.get('id');
  if(!id){ document.getElementById('playerName').textContent = 'Jogador não encontrado'; return; }

  let players = [];
  try{
    const res = await fetch('data/players.json'); players = await res.json();
  }catch(e){ console.error('Erro ao carregar players.json', e); players = []; }

  const p = players.find(x=>x.id === id);
  if(!p){ document.getElementById('playerName').textContent = 'Jogador não encontrado'; return; }

  document.getElementById('playerName').textContent = p.name;
  document.getElementById('playerSub').textContent = `${p.position} • ${p.club} • #${p.number || ''}`;
  document.getElementById('playerImage').src = p.image_url || '';
  document.getElementById('statOvr').textContent = p.ovr;
  document.getElementById('statPos').textContent = p.position;
  document.getElementById('statClub').textContent = p.club;

  const grid = document.getElementById('statsGrid'); grid.innerHTML = '';
  const attrs = p.attributes || {};
  const order = ['pace','shooting','passing','dribbling','defense','physical'];
  order.forEach(k=>{
    const val = attrs[k] !== undefined ? attrs[k] : '-';
    const label = k.charAt(0).toUpperCase() + k.slice(1);
    const box = document.createElement('div'); box.className='stat-box';
    box.innerHTML = `<label>${label}</label><div class="val">${val}</div>`;
    grid.appendChild(box);
  });

  document.getElementById('addToSquadBtn').addEventListener('click', ()=> {
    // add to localStorage squad
    try{
      const key = 'bug_efootball_squad';
      const s = JSON.parse(localStorage.getItem(key) || '[]');
      if(s.find(x=>x.id===p.id)){ alert('Já no squad'); return; }
      s.push(p);
      localStorage.setItem(key, JSON.stringify(s));
      alert('Adicionado ao squad!');
    }catch(e){ alert('Erro ao salvar'); }
  });
}

initPlayer();
