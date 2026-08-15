/* ================================================================
   AURA FARM — LÓGICA DO JOGO
   Estrutura: estado (state) → cálculo de estatísticas (computeStats)
   → renderização (render*) → loop de auto-farm (setInterval)
   ================================================================ */

// ---------- DADOS ESTÁTICOS ----------

// Upgrades de clique: aumentam o valor base do clique (soma linear)
const CLICK_UPGRADES = [
  {id:'c1', name:'Dedo Treinado', emoji:'👆', desc:'Anos de scroll no TikTok finalmente sendo úteis pra algo.', baseCost:10, value:1},
  {id:'c2', name:'Academia do Clique', emoji:'💪', desc:'Você não vai no shape, mas o dedo tá on point.', baseCost:100, value:5},
  {id:'c3', name:'Luvas de Sigma', baseCost:1000, emoji:'🧤', desc:'Cada clique agora sai com pressão de CEO.', value:25},
  {id:'c4', name:'Prótese Baseada', emoji:'🦾', desc:'Trocaram seu dedo por engenharia de ponta. Sem anestesia.', baseCost:10000, value:150},
  {id:'c5', name:'Dedo Quântico', emoji:'🌀', desc:'Clica em múltiplas dimensões ao mesmo tempo.', baseCost:100000, value:1000},
  {id:'c6', name:'Clique Divino', emoji:'⚡', desc:'Zeus tá com inveja da sua produtividade.', baseCost:1000000, value:8000},
  {id:'c7', name:'Soco do Xablau Supremo', emoji:'👊', desc:'5x mais forte que o Clique Divino. Nem Zeus, nem o professor, ninguém segura essa mão.', baseCost:10000000, value:40000},
  {id:'c8', name:'Toque do Sky Ace', emoji:'🌠', desc:'100x mais forte que o Soco do Xablau Supremo. Um toque só e a realidade racha ao meio.', baseCost:1000000000, value:4000000},
];

// Upgrades de multiplicador: compra única, multiplicam TUDO
const MULT_UPGRADES = [
  {id:'m1', name:'Café Preto sem Açúcar', emoji:'☕', desc:'Amargo igual sua vida, mas funciona.', cost:500, mult:2},
  {id:'m2', name:'Playlist Motivacional Genérica', emoji:'🎧', desc:'"ACORDA E CONQUISTA" tocando 24h por dia.', cost:5000, mult:2},
  {id:'m3', name:'Rolex Falso (Original)', emoji:'⌚', desc:'100% original, comprei com o vendedor de confiança.', cost:50000, mult:3},
  {id:'m4', name:'Comprar Verificado no X', emoji:'✅', desc:'Agora suas opiniões valem legalmente mais.', cost:500000, mult:5},
  {id:'m5', name:'Professor Lucas Ama o Xablau', emoji:'😎', desc:'A verdade suprema do universo, revelada. Multiplica tudo por 1000x. Inquestionável.', cost:200000000000, mult:1000},
];

// Upgrades de auto-farm: geram aura por segundo (soma linear)
const AUTO_UPGRADES = [
  {id:'a1', name:'Estagiário Não Remunerado', emoji:'📋', desc:'Trabalha por "experiência" e farma aura por você.', baseCost:50, value:1},
  {id:'a2', name:'Bot do Instagram', emoji:'🤳', desc:'Curte tudo, comenta "🔥🔥🔥", gera aura sozinho.', baseCost:300, value:5},
  {id:'a3', name:'Call Center de Aura', emoji:'☎️', desc:'"Você está sendo transferido para o setor de Aura."', baseCost:2000, value:20},
  {id:'a4', name:'Fábrica de Sigma', emoji:'🏭', desc:'Produção em massa de personalidade artificial.', baseCost:15000, value:100},
  {id:'a5', name:'Servidor Discord Tóxico', emoji:'💻', desc:'1200 pessoas online, todas gerando aura negativa que vira positiva.', baseCost:100000, value:600},
  {id:'a6', name:'IA Generativa de Aura', emoji:'🤖', desc:'Treinada com todos os prints de "ratio" da internet.', baseCost:800000, value:4000},
  {id:'a7', name:'Benção do Sky Ace', emoji:'🕊️', desc:'Requer 60 bilhões de aura pra sequer olhar pra você. Depois disso, chove aura do céu.', baseCost:60000000000, value:1000000000},
  {id:'a8', name:'Trivial', emoji:'🎯', desc:'Pra você já ficou fácil demais. Aura de graça, tipo pergunta de prova de trivia nível fácil.', baseCost:120000000000, value:2000000000},
  {id:'a9', name:'Fica Nenem', emoji:'👶', desc:'Calma que a aura vem. Fica nenem que o farm é automático agora.', baseCost:220000000000, value:3000000000},
];

// Upgrades especiais / meméticos: compra única, dão bônus percentual em tudo
const SPECIAL_UPGRADES = [
  {id:'s1', name:'Comprar ChatGPT Plus', emoji:'🧠', desc:'Agora você "sabe" de tudo. +2% em toda produção.', cost:2000, bonus:0.02},
  {id:'s2', name:'Fazer Academia (De Verdade Dessa Vez)', emoji:'🏋️', desc:'Dessa vez vai. Prometo. +5% no clique.', cost:8000, bonus:0.05},
  {id:'s3', name:'Parar de Procrastinar', emoji:'⏰', desc:'Só depois desse upgrade. +5% no auto-farm.', cost:20000, bonus:0.05},
  {id:'s4', name:'Virar Sigma Male', emoji:'🐺', desc:'Acorda 4h, toma banho gelado, ainda tá triste. +10% geral.', cost:50000, bonus:0.10},
  {id:'s5', name:'Postar Foto no Story com Legenda Profunda', emoji:'📱', desc:'"Nem todo mundo vai entender minha jornada." +7% geral.', cost:100000, bonus:0.07},
  {id:'s6', name:'Comprar Curso de Empreendedorismo Digital', emoji:'💸', desc:'12x sem juros pra aprender a vender curso. +15% geral.', cost:250000, bonus:0.15},
  {id:'s7', name:'Tomar Banho Gelado às 5AM', emoji:'🥶', desc:'Postou no story, claro. +20% geral.', cost:600000, bonus:0.20},
  {id:'s8', name:'Virar Coach de Alta Performance', emoji:'📈', desc:'Vende mentoria de R$15k pra ensinar a farmar aura. +30% geral.', cost:1500000, bonus:0.30},
  {id:'s9', name:'Benção do Skyace 2', emoji:'🎰', desc:'Desbloqueia o Evento Relâmpago: um número gira rapidão na tela, para na hora certa e acerte o 6 pra faturar 1 bilhão de aura na hora.', cost:3000000000, bonus:0},
];

// Joguinhos grátis: sem custo pra jogar, só cooldown. Recompensas menores que os Desafios.
const ROULETTE_SEGMENTS = [
  {label:'Nada 😔', weight:30, reward:0},
  {label:'+10mi', weight:25, reward:10000000},
  {label:'+50mi', weight:20, reward:50000000},
  {label:'+200mi', weight:15, reward:200000000},
  {label:'+1bi', weight:8, reward:1000000000},
  {label:'JACKPOT +10bi 🎉', weight:2, reward:10000000000},
];
const SLOT_SYMBOLS = ['🍒','🍋','⭐','💎','👑'];
const SLOT_JACKPOTS = {'👑':5000000000, '💎':2000000000, '⭐':800000000, '🍋':300000000, '🍒':100000000};
const SLOT_PARTIAL_REWARD = 20000000;
const EVENODD_REWARD = 50000000;

const FREE_GAMES = [
  {id:'g1', name:'Roleta da Aura', emoji:'🎡', desc:'Gire a roleta e veja quanto sai. Pode ser nada, pode ser bilhões.', cooldown:20000},
  {id:'g2', name:'Par ou Ímpar', emoji:'🔢', desc:'Escolha par ou ímpar contra o computador. Acerte e leve uma bolada de aura.', cooldown:12000},
  {id:'g3', name:'Caça-Níquel do Sigma', emoji:'🎰', desc:'Três símbolos, gira e reza. Três iguais paga fortunas, duas paga trocado.', cooldown:20000},
  {id:'g4', name:'Xadrez vs Bot Sigma', emoji:'♟️', desc:'Xeque-mate o bot e fature uma bolada. Sem roque nem en passant, xadrez cru mesmo.', cooldown:45000},
];

// Desafios de alto risco: upgrades baratos (67 mil) que desbloqueiam minigames de sorte/reflexo
const CHALLENGE_UPGRADES = [
  {id:'ch1', name:'Desafio Relâmpago', emoji:'🎯', mode:'spin', cost:67000, reward:1000000000000,
   desc:'Super rápido: para o número certo entre 1 e 1000 e fature 1 tri de aura. Errou? Aura zerada na hora.',
   failReset:'always'},
  {id:'ch2', name:'Desafio Digitado', emoji:'⌨️', mode:'type', cost:67000, reward:2000000000000,
   desc:'Digite um número entre 1 e 1000. Acertou, fature 2 tri de aura. Errou, só tenta de novo depois.',
   failReset:'none'},
  {id:'ch3', name:'Desafio Supremo', emoji:'☠️', mode:'spin', cost:67000, reward:200000000000000,
   desc:'Acerte o número entre 1 e 1000 e fature 200 tri de aura. ATENÇÃO: no Modo Hardcore, errar zera TUDO — aura e upgrades.',
   failReset:'hardcore'},
];

// Títulos por aura total farmada (progressão de status)
const TITLES = [
  {min:0,          name:'Sem Aura (Reprovado em Ed. Física)', sound:'audio/soundEffects/voce-nao-tem-aura.mp3'},
  {min:50,         name:'Estagiário de Aura',                 sound:'audio/soundEffects/tiki-tiki-tiki.mp3'},
  {min:67,         name:'Pequeno Gafanhoto',                  sound:'audio/soundEffects/67.mp3'},
  {min:200,        name:'Quase Chad',                         sound:'audio/soundEffects/tiki-tiki-tiki.mp3'},
  {min:1000,       name:'Sigma em Formação',                  sound:'audio/soundEffects/tiki-tiki-tiki.mp3'},
  {min:5000,       name:'Sigma Roxo',                         sound:'audio/soundEffects/tiki-tiki-tiki.mp3'},
  {min:20000,      name:'Baseado Confirmado',                 sound:'audio/soundEffects/tiki-tiki-tiki.mp3'},
  {min:100000,     name:'Rei do Rolê',                        sound:'audio/soundEffects/tiki-tiki-tiki.mp3'},
  {min:500000,     name:'Aura Cósmica',                       sound:'audio/soundEffects/tiki-tiki-tiki.mp3'},
  {min:2000000,    name:'O Próprio',                          sound:'audio/soundEffects/tiki-tiki-tiki.mp3'},
  {min:10000000,   name:'Deus da Aura',                       sound:'audio/soundEffects/tiki-tiki-tiki.mp3'},
  {min:50000000,   name:'Entidade Memética',                  sound:'audio/soundEffects/tiki-tiki-tiki.mp3'},
  {min:1000000000, name:'Aura Infinita (Bugou o Sistema)',    sound:'audio/soundEffects/tiki-tiki-tiki.mp3'},
];

// Conquistas
const ACHIEVEMENTS = [
  {id:'ach1', name:'Primeiro Clique', desc:'Você clicou. Parabéns, eu acho.', icon:'👆', cond:s=>s.clicks>=1},
  {id:'ach2', name:'Cem Cliques Later', desc:'Seu dedo já dói um pouco.', icon:'💢', cond:s=>s.clicks>=100},
  {id:'ach3', name:'Mil Cliques de Sofrimento', desc:'Isso já é RSI, não é aura.', icon:'🩹', cond:s=>s.clicks>=1000},
  {id:'ach4', name:'Primeiro Upgrade', desc:'Investiu na sua própria melhoria. Que raro.', icon:'🛒', cond:s=>totalUpgradesBought()>=1},
  {id:'ach5', name:'Sigma em Construção', desc:'1.000 aura total farmada.', icon:'🧱', cond:s=>s.totalEarned>=1000},
  {id:'ach6', name:'Baseado Oficial', desc:'100.000 aura total farmada.', icon:'🗿', cond:s=>s.totalEarned>=100000},
  {id:'ach7', name:'Aura Infinita', desc:'1 bilhão de aura. Você quebrou a economia.', icon:'♾️', cond:s=>s.totalEarned>=1000000000},
  {id:'ach8', name:'Ascendeu', desc:'Renasceu como uma versão melhor (na teoria).', icon:'🌌', cond:s=>s.prestigeCount>=1},
  {id:'ach9', name:'Viciado em Aura', desc:'5.000 cliques. Procure ajuda. Ou não, farma mais.', icon:'🎰', cond:s=>s.clicks>=5000},
  {id:'ach10', name:'Comprador Compulsivo', desc:'Comprou todos os upgrades especiais.', icon:'🛍️', cond:s=>s.specialBought.length>=SPECIAL_UPGRADES.length},
  {id:'ach11', name:'Coragem Duvidosa', desc:'Ativou o Modo Hardcore.', icon:'💀', cond:s=>s.hardcore===true},
  {id:'ach12', name:'Multi-Ascendido', desc:'Ascendeu 5 vezes. Já perdeu a conta de quantas vidas teve.', icon:'🔁', cond:s=>s.prestigeCount>=5},
  {id:'ach13', name:'Sobreviveu ao Desafio Supremo', desc:'Acertou o número do Desafio Supremo e faturou 200 tri sem perder tudo.', icon:'☠️', cond:s=>s.challengeSupremeWins>=1},
  {id:'ach14', name:'Xeque-Mate Sigma', desc:'Deu xeque-mate no Bot Sigma no xadrez. Respeitável.', icon:'♟️', cond:s=>s.chessWins>=1},
];

// Mensagens aleatórias ao clicar (easter eggs, chance baixa)
const CLICK_MSGS = [
  'Você é praticamente um humano funcional agora.',
  'A aura te chama.',
  'Isso é literalmente tudo que você tem.',
  'Seu terapeuta ficaria orgulhoso (ou preocupado).',
  'Mais um clique, menos uma personalidade.',
  '+1 no clique, -1 na vida social.',
  'A internet nunca vai saber disso e tudo bem.',
  'Isso conta como exercício físico? Não. Mas continue.',
];

// Mensagens ao comprar upgrade
const BUY_MSGS = [
  'Comprou "{name}". Que coragem.',
  'Investimento em "{name}" concluído. Sua mãe estaria orgulhosa. Talvez...',
  '"{name}" adquirido. Aura +. Personalidade real ainda em -.',
  'Você trocou aura por "{name}". Negócio duvidoso, mas ok.',
];

// Nomes dos bots do ranking (fixos, com aura pré-gerada e persistida)
const BOT_NAMES = ['xXx_SigmaGrind_xXx','ceo.mentoria','rapaz_do_rolex','baseado_supremo','usuário_verificado_de_verdade','coach.alta.performance','banho_gelado_5am','sem_personalidade_23','aura_farmer_pro','deus_do_grindset','anon_baseado','sigma_da_quebrada','o_tal_do_zé_aura','print_de_ratio','ex_estagiário_agora_ceo'];

// Lendas absolutas do servidor — valores fixos, sempre no topo do ranking
const LEGEND_BOTS = [
  { name: 'Sky Ace', aura: 999999000000000000 },
  { name: 'Professor Edson', aura: 6000000000000000 },
  { name: 'Lucas Pereira Mantena', aura: 67000000000000 },
];

// ---------- ESTADO ----------
const DEFAULT_STATE = {
  aura:0, totalEarned:0, lifetimeAura:0, clicks:0,
  clickLevels:{}, autoLevels:{}, multBought:[], specialBought:[],
  achievementsUnlocked:[], prestigeCount:0, hardcore:false,
  sound:true, theme:'default', playerName:'Você', lastSeen:Date.now(),
  cooldownUntil:0, lightningCooldownUntil:0,
  challengeBought:[], challengeCooldowns:{}, challengeSupremeWins:0,
  freeGameCooldowns:{}, chessWins:0,
};
let state = loadState();
let stats = {perClick:1, perSecond:0};

function loadState(){
  try{
    const raw = localStorage.getItem('auraFarmSave');
    if(raw){ return Object.assign({}, DEFAULT_STATE, JSON.parse(raw)); }
  }catch(e){}
  return Object.assign({}, DEFAULT_STATE);
}
function saveState(){
  localStorage.setItem('auraFarmSave', JSON.stringify(state));
}

// ---------- CÁLCULO DE ESTATÍSTICAS ----------
function totalUpgradesBought(){
  let n = state.multBought.length + state.specialBought.length;
  for(const k in state.clickLevels) n += state.clickLevels[k];
  for(const k in state.autoLevels) n += state.autoLevels[k];
  return n;
}

function computeStats(){
  let clickBase = 1;
  CLICK_UPGRADES.forEach(u=>{ clickBase += (state.clickLevels[u.id]||0) * u.value; });

  let autoBase = 0;
  AUTO_UPGRADES.forEach(u=>{ autoBase += (state.autoLevels[u.id]||0) * u.value; });

  let mult = 1;
  MULT_UPGRADES.forEach(u=>{ if(state.multBought.includes(u.id)) mult *= u.mult; });

  let specialMult = 1;
  SPECIAL_UPGRADES.forEach(u=>{ if(state.specialBought.includes(u.id)) specialMult *= (1+u.bonus); });

  const prestigeMult = 1 + state.prestigeCount * 0.15;
  const hardcoreMult = state.hardcore ? 0.5 : 1;

  const totalMult = mult * specialMult * prestigeMult * hardcoreMult;
  stats.perClick = clickBase * totalMult;
  stats.perSecond = autoBase * totalMult;
  stats.prestigeMult = prestigeMult;
  stats.mult = mult; // multiplicador acumulado só dos upgrades de "Multiplicadores" (escala entre si)
}

function getUpgradeCost(baseCost, level){
  return Math.round(baseCost * Math.pow(1.15, level));
}

function getTitle(amount){
  let t = TITLES[0];
  for(const item of TITLES){ if(amount >= item.min) t = item; }
  return t.name;
}

// ---------- FORMATAÇÃO DE NÚMEROS (padrão PT-BR abreviado) ----------
function fmt(n){
  n = Math.floor(n);
  if(n < 1000) return n.toString();
  const units = [
   {v:1e33, s:'dec'}, {v:1e30, s:'non'}, {v:1e27, s:'oct'}, {v:1e24, s:'hep'}, {v:1e21, s:'sex'}, {v:1e18, s:'qui'}, {v:1e15, s:'qua'}, {v:1e12, s:'tri'}, {v:1e9, s:'bi'}, {v:1e6, s:'mi'}, {v:1e3, s:'mil'}
  ];
  for(const u of units){
    if(n >= u.v){
      const val = n / u.v;
      return (val >= 100 ? val.toFixed(0) : val.toFixed(val>=10?1:2)) + u.s;
    }
  }
  return n.toString();
}
function fmtFull(n){ return Math.floor(n).toLocaleString('pt-BR'); }

// ---------- SOM (WebAudio simples) ----------
let audioCtx;
function beep(freq=440, dur=0.06, vol=0.05){
  if(!state.sound) return;
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type='sine'; osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.stop(audioCtx.currentTime + dur);
  }catch(e){}
}

// ---------- SOM DE TÍTULO ----------
let lastTitleName = null;

function playTitleSound(url){
  if(!state.sound || !url) return;
  try{
    const audio = new Audio(url);
    audio.play().catch(e=>{});
  }catch(e){}
}

// ---------- TOASTS ----------
function toast(msg){
  const wrap = document.getElementById('toastWrap');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(()=> el.remove(), 3000);
}

// ---------- JOGUINHOS GRÁTIS ----------
function freeGameOnCooldown(id){
  const t = state.freeGameCooldowns[id];
  return t && Date.now() < t;
}
function setFreeGameCooldown(id, ms){
  state.freeGameCooldowns[id] = Date.now() + ms;
  saveState();
}
function weightedPick(segments){
  const total = segments.reduce((sum,s)=> sum + s.weight, 0);
  let r = Math.random() * total;
  for(const s of segments){
    if(r < s.weight) return s;
    r -= s.weight;
  }
  return segments[segments.length-1];
}
function payoutFreeGame(amount, gameName){
  if(amount <= 0) return;
  state.aura += amount;
  state.totalEarned += amount;
  state.lifetimeAura += amount;
  saveState();
  renderTopStats();
  checkAchievements();
}

function renderFreeGames(){
  const grid = document.getElementById('grid-freegames');
  grid.innerHTML = '';

  FREE_GAMES.forEach(def=>{
    const onCooldown = freeGameOnCooldown(def.id);
    const card = document.createElement('div');
    card.className = 'upgrade-card';
    card.id = 'freegame-' + def.id;

    let controlsHtml = '';
    let stageHtml = '';

    if(def.id === 'g1'){
      stageHtml = `<div class="game-stage" id="stage-${def.id}">🎡 Pronto pra girar?</div>`;
      controlsHtml = `<button class="buy-btn ${onCooldown?'':'affordable'}" id="play-${def.id}" ${onCooldown?'disabled':''}>${onCooldown ? cdText(def.id) : '🎡 Girar!'}</button>`;
    }else if(def.id === 'g3'){
      stageHtml = `<div class="game-stage slots" id="stage-${def.id}"><span>❔</span><span>❔</span><span>❔</span></div>`;
      controlsHtml = `<button class="buy-btn ${onCooldown?'':'affordable'}" id="play-${def.id}" ${onCooldown?'disabled':''}>${onCooldown ? cdText(def.id) : '🎰 Girar!'}</button>`;
    }else if(def.id === 'g2'){
      stageHtml = `<div class="game-stage" id="stage-${def.id}">🔢 Escolha seu lado</div>`;
      controlsHtml = `
        <button class="buy-btn ${onCooldown?'':'affordable'}" id="play-${def.id}-par" ${onCooldown?'disabled':''}>Par</button>
        <button class="buy-btn ${onCooldown?'':'affordable'}" id="play-${def.id}-impar" ${onCooldown?'disabled':''}>Ímpar</button>
      `;
    }else if(def.id === 'g4'){
      stageHtml = `<div class="game-stage" id="stage-${def.id}">♟️ Bot Sigma te aguarda</div>`;
      controlsHtml = `<button class="buy-btn ${onCooldown?'':'affordable'}" id="play-${def.id}" ${onCooldown?'disabled':''}>${onCooldown ? cdText(def.id) : '♟️ Jogar Xadrez'}</button>`;
    }

    card.innerHTML = `
      <div class="uc-top">
        <div class="uc-emoji">${def.emoji}</div>
        <div>
          <div class="uc-name">${def.name}</div>
          <div class="uc-lvl">Grátis · cooldown ${def.cooldown/1000}s</div>
        </div>
      </div>
      <div class="uc-desc">${def.desc}</div>
      ${stageHtml}
      <div class="game-controls">${controlsHtml}</div>
    `;
    grid.appendChild(card);
  });

  document.getElementById('play-g1')?.addEventListener('click', ()=> playRoulette());
  document.getElementById('play-g3')?.addEventListener('click', ()=> playSlots());
  document.getElementById('play-g2-par')?.addEventListener('click', ()=> playEvenOdd('par'));
  document.getElementById('play-g2-impar')?.addEventListener('click', ()=> playEvenOdd('impar'));
  document.getElementById('play-g4')?.addEventListener('click', ()=> openChessModal());
}
function cdText(id){
  const remaining = Math.max(0, state.freeGameCooldowns[id] - Date.now());
  return `⏳ ${Math.ceil(remaining/1000)}s`;
}

function playRoulette(){
  if(isCoolingDown()){ toast('🥶 Cooldown de aura ativo — jogos bloqueados.'); return; }
  if(freeGameOnCooldown('g1')) return;
  const btn = document.getElementById('play-g1');
  const stage = document.getElementById('stage-g1');
  if(btn) btn.disabled = true;
  const result = weightedPick(ROULETTE_SEGMENTS);
  let ticks = 0;
  const maxTicks = 18;
  const spin = setInterval(()=>{
    stage.textContent = weightedPick(ROULETTE_SEGMENTS).label;
    ticks++;
    if(ticks >= maxTicks){
      clearInterval(spin);
      stage.textContent = '🎡 ' + result.label;
      payoutFreeGame(result.reward, 'Roleta da Aura');
      if(result.reward > 0){
        toast(`🎡 Roleta: ${result.label} — +${fmt(result.reward)} de aura!`);
      }else{
        toast('🎡 Roleta: deu nada. Sorte na próxima.');
      }
      setFreeGameCooldown('g1', 20000);
      renderFreeGames();
    }
  }, 70);
}

function playSlots(){
  if(isCoolingDown()){ toast('🥶 Cooldown de aura ativo — jogos bloqueados.'); return; }
  if(freeGameOnCooldown('g3')) return;
  const btn = document.getElementById('play-g3');
  if(btn) btn.disabled = true;
  const stage = document.getElementById('stage-g3');
  const reels = stage.querySelectorAll('span');
  const finals = [
    SLOT_SYMBOLS[Math.floor(Math.random()*SLOT_SYMBOLS.length)],
    SLOT_SYMBOLS[Math.floor(Math.random()*SLOT_SYMBOLS.length)],
    SLOT_SYMBOLS[Math.floor(Math.random()*SLOT_SYMBOLS.length)],
  ];
  const spins = [null,null,null];
  reels.forEach((reel,i)=>{
    spins[i] = setInterval(()=>{
      reel.textContent = SLOT_SYMBOLS[Math.floor(Math.random()*SLOT_SYMBOLS.length)];
    }, 60);
  });
  const stopDelays = [500, 850, 1250];
  stopDelays.forEach((delay,i)=>{
    setTimeout(()=>{
      clearInterval(spins[i]);
      reels[i].textContent = finals[i];
      if(i === 2){
        resolveSlots(finals);
      }
    }, delay);
  });
}
function resolveSlots(finals){
  let reward = 0;
  let msg = '';
  if(finals[0]===finals[1] && finals[1]===finals[2]){
    reward = SLOT_JACKPOTS[finals[0]] || 0;
    msg = `🎰 TRINCA DE ${finals[0]}! +${fmt(reward)} de aura!`;
  }else if(finals[0]===finals[1] || finals[1]===finals[2] || finals[0]===finals[2]){
    reward = SLOT_PARTIAL_REWARD;
    msg = `🎰 Duas iguais! +${fmt(reward)} de aura.`;
  }else{
    msg = '🎰 Nada combinou. Sorte na próxima.';
  }
  payoutFreeGame(reward, 'Caça-Níquel do Sigma');
  toast(msg);
  setFreeGameCooldown('g3', 20000);
  renderFreeGames();
}

function playEvenOdd(choice){
  if(isCoolingDown()){ toast('🥶 Cooldown de aura ativo — jogos bloqueados.'); return; }
  if(freeGameOnCooldown('g2')) return;
  const stage = document.getElementById('stage-g2');
  const num = Math.floor(Math.random()*10);
  const isEven = num % 2 === 0;
  const won = (choice==='par' && isEven) || (choice==='impar' && !isEven);
  stage.textContent = `🔢 Deu ${num} (${isEven?'par':'ímpar'})`;
  if(won){
    payoutFreeGame(EVENODD_REWARD, 'Par ou Ímpar');
    toast(`🔢 Acertou! Era ${num}. +${fmt(EVENODD_REWARD)} de aura!`);
  }else{
    toast(`🔢 Errou! Era ${num}. Tenta de novo depois.`);
  }
  setFreeGameCooldown('g2', 12000);
  renderFreeGames();
}

// ---------- XADREZ vs BOT SIGMA ----------
const CHESS_WIN_REWARD = 5000000000; // 5 bi de aura por xeque-mate
const PIECE_UNICODE = {
  wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙',
  bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟',
};
const PIECE_VALUE = {P:1,N:3,B:3,R:5,Q:9,K:1000};

let chessBoard = null;
let chessTurn = 'w';
let chessSelected = null;
let chessLegalForSelected = [];
let chessGameOver = false;
let chessMoveLog = [];
let chessCaptured = {w:[], b:[]}; // peças capturadas DE cada cor (w: peças brancas capturadas, etc)

const CHESS_FILES = ['a','b','c','d','e','f','g','h'];
function chessSquareName(r,c){ return CHESS_FILES[c] + (8-r); }

function chessInitBoard(){
  const b = Array.from({length:8}, ()=> Array(8).fill(null));
  const backRank = ['R','N','B','Q','K','B','N','R'];
  for(let c=0;c<8;c++){
    b[0][c] = 'b'+backRank[c];
    b[1][c] = 'bP';
    b[6][c] = 'wP';
    b[7][c] = 'w'+backRank[c];
  }
  return b;
}
function chessClone(b){ return b.map(row=>row.slice()); }
function chessInBounds(r,c){ return r>=0 && r<8 && c>=0 && c<8; }
function chessColor(p){ return p ? p[0] : null; }
function chessType(p){ return p ? p[1] : null; }
function chessFindKing(b,color){
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(b[r][c]===color+'K') return {r,c};
  return null;
}

// A peça em (fr,fc) ataca (tr,tc)? Considera bloqueios pra peças de longo alcance.
function chessAttacks(b, fr, fc, tr, tc){
  const p = b[fr][fc];
  if(!p) return false;
  const color = chessColor(p), type = chessType(p);
  const dr = tr-fr, dc = tc-fc;
  if(type==='P'){
    const dir = color==='w' ? -1 : 1;
    return dr===dir && Math.abs(dc)===1;
  }
  if(type==='N'){
    const combos = [[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]];
    return combos.some(([a,bb])=> dr===a && dc===bb);
  }
  if(type==='K'){
    return Math.abs(dr)<=1 && Math.abs(dc)<=1 && (dr!==0 || dc!==0);
  }
  if(type==='B' || type==='R' || type==='Q'){
    const straight = dr===0 || dc===0;
    const diag = Math.abs(dr)===Math.abs(dc);
    if(type==='B' && !diag) return false;
    if(type==='R' && !straight) return false;
    if(type==='Q' && !straight && !diag) return false;
    const stepR = dr===0?0:dr/Math.abs(dr);
    const stepC = dc===0?0:dc/Math.abs(dc);
    let r=fr+stepR, c=fc+stepC;
    while(r!==tr || c!==tc){
      if(b[r][c]) return false;
      r+=stepR; c+=stepC;
    }
    return true;
  }
  return false;
}
function chessIsSquareAttacked(b, tr, tc, byColor){
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p = b[r][c];
    if(p && chessColor(p)===byColor && chessAttacks(b,r,c,tr,tc)) return true;
  }
  return false;
}
function chessInCheck(b, color){
  const k = chessFindKing(b,color);
  if(!k) return false;
  return chessIsSquareAttacked(b, k.r, k.c, color==='w'?'b':'w');
}
function chessPseudoMoves(b, r, c){
  const p = b[r][c];
  if(!p) return [];
  const color = chessColor(p), type = chessType(p);
  const enemy = color==='w'?'b':'w';
  const moves = [];
  if(type==='P'){
    const dir = color==='w'?-1:1;
    const startRow = color==='w'?6:1;
    if(chessInBounds(r+dir,c) && !b[r+dir][c]){
      moves.push({r:r+dir,c});
      if(r===startRow && !b[r+2*dir][c]) moves.push({r:r+2*dir,c});
    }
    for(const dc of [-1,1]){
      const nr=r+dir, nc=c+dc;
      if(chessInBounds(nr,nc) && b[nr][nc] && chessColor(b[nr][nc])===enemy) moves.push({r:nr,c:nc});
    }
  }else if(type==='N'){
    [[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]].forEach(([dr,dc])=>{
      const nr=r+dr, nc=c+dc;
      if(chessInBounds(nr,nc) && (!b[nr][nc] || chessColor(b[nr][nc])===enemy)) moves.push({r:nr,c:nc});
    });
  }else if(type==='K'){
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      if(dr===0&&dc===0) continue;
      const nr=r+dr,nc=c+dc;
      if(chessInBounds(nr,nc) && (!b[nr][nc] || chessColor(b[nr][nc])===enemy)) moves.push({r:nr,c:nc});
    }
  }else{
    const dirs = type==='B' ? [[1,1],[1,-1],[-1,1],[-1,-1]]
      : type==='R' ? [[1,0],[-1,0],[0,1],[0,-1]]
      : [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
    dirs.forEach(([dr,dc])=>{
      let nr=r+dr, nc=c+dc;
      while(chessInBounds(nr,nc)){
        if(!b[nr][nc]){ moves.push({r:nr,c:nc}); }
        else{ if(chessColor(b[nr][nc])===enemy) moves.push({r:nr,c:nc}); break; }
        nr+=dr; nc+=dc;
      }
    });
  }
  return moves;
}
function chessLegalMoves(b, r, c){
  const p = b[r][c];
  if(!p) return [];
  const color = chessColor(p);
  return chessPseudoMoves(b,r,c).filter(m=>{
    const clone = chessClone(b);
    clone[m.r][m.c] = clone[r][c];
    clone[r][c] = null;
    if(chessType(clone[m.r][m.c])==='P' && (m.r===0||m.r===7)) clone[m.r][m.c] = color+'Q';
    return !chessInCheck(clone, color);
  });
}
function chessAllLegalMoves(b, color){
  const all = [];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p=b[r][c];
    if(p && chessColor(p)===color){
      chessLegalMoves(b,r,c).forEach(m=> all.push({from:{r,c}, to:m}));
    }
  }
  return all;
}
function chessMakeMove(b, from, to){
  const clone = chessClone(b);
  const moving = clone[from.r][from.c];
  clone[to.r][to.c] = moving;
  clone[from.r][from.c] = null;
  if(chessType(moving)==='P' && (to.r===0||to.r===7)) clone[to.r][to.c] = chessColor(moving)+'Q';
  return clone;
}

// ---------- IA: minimax com poda alfa-beta ----------
const CHESS_AI_DEPTH = 2; // profundidade extra além do lance do bot (total ~3 jogadas de busca)
const CHESS_CENTER = {r:3.5, c:3.5};

function chessEvaluate(board){
  let score = 0;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p = board[r][c];
    if(!p) continue;
    const type = chessType(p);
    if(type==='K') continue; // rei não entra na soma material (mate é tratado como terminal)
    let val = PIECE_VALUE[type];
    const centrality = 4 - (Math.abs(r-CHESS_CENTER.r) + Math.abs(c-CHESS_CENTER.c));
    val += centrality * 0.06; // leve incentivo a ocupar o centro
    score += chessColor(p)==='w' ? val : -val;
  }
  return score;
}

// ordena lances colocando capturas de maior valor primeiro (melhora a poda alfa-beta)
function chessOrderMoves(board, moves){
  return moves.slice().sort((a,b)=>{
    const capA = board[a.to.r][a.to.c];
    const capB = board[b.to.r][b.to.c];
    const valA = capA ? (PIECE_VALUE[chessType(capA)]||0) : 0;
    const valB = capB ? (PIECE_VALUE[chessType(capB)]||0) : 0;
    return valB - valA;
  });
}

function chessMinimax(board, depth, isMaxWhite, alpha, beta){
  const color = isMaxWhite ? 'w' : 'b';
  const moves = chessAllLegalMoves(board, color);
  if(moves.length === 0){
    if(chessInCheck(board, color)){
      return isMaxWhite ? (-99000 - depth) : (99000 + depth); // xeque-mate: péssimo pra quem não tem lance
    }
    return 0; // afogamento
  }
  if(depth === 0) return chessEvaluate(board);

  const ordered = chessOrderMoves(board, moves);
  if(isMaxWhite){
    let best = -Infinity;
    for(const m of ordered){
      const nb = chessMakeMove(board, m.from, m.to);
      best = Math.max(best, chessMinimax(nb, depth-1, false, alpha, beta));
      alpha = Math.max(alpha, best);
      if(beta <= alpha) break;
    }
    return best;
  }else{
    let best = Infinity;
    for(const m of ordered){
      const nb = chessMakeMove(board, m.from, m.to);
      best = Math.min(best, chessMinimax(nb, depth-1, true, alpha, beta));
      beta = Math.min(beta, best);
      if(beta <= alpha) break;
    }
    return best;
  }
}

// escolhe o melhor lance do bot (pretas) buscando alguns lances à frente
function chessChooseBotMove(board){
  const moves = chessAllLegalMoves(board, 'b');
  if(moves.length === 0) return null;
  const ordered = chessOrderMoves(board, moves);
  let bestMove = ordered[0], bestScore = Infinity;
  for(const m of ordered){
    const nb = chessMakeMove(board, m.from, m.to);
    const score = chessMinimax(nb, CHESS_AI_DEPTH, true, -Infinity, Infinity);
    if(score < bestScore){ bestScore = score; bestMove = m; }
  }
  return bestMove;
}

function chessNewGame(){
  chessBoard = chessInitBoard();
  chessTurn = 'w';
  chessSelected = null;
  chessLegalForSelected = [];
  chessGameOver = false;
  chessMoveLog = [];
  chessCaptured = {w:[], b:[]};
  document.getElementById('chessStatus').textContent = 'Sua vez (brancas). Capture o rei preto!';
  const resultEl = document.getElementById('chessResult');
  resultEl.textContent = '';
  resultEl.className = 'lightning-result';
  chessRenderBoard();
  chessRenderMoveLog();
  chessRenderCaptured();
}
function chessRenderBoard(){
  const boardEl = document.getElementById('chessBoard');
  boardEl.innerHTML = '';
  const checkColor = chessInCheck(chessBoard, chessTurn) ? chessTurn : null;
  const kingSq = checkColor ? chessFindKing(chessBoard, checkColor) : null;
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      const sq = document.createElement('div');
      const isLight = (r+c)%2===0;
      sq.className = 'chess-sq ' + (isLight?'light':'dark');
      const p = chessBoard[r][c];
      if(p) sq.textContent = PIECE_UNICODE[p];
      if(chessSelected && chessSelected.r===r && chessSelected.c===c) sq.classList.add('selected');
      if(chessLegalForSelected.some(m=>m.r===r && m.c===c)) sq.classList.add('legal');
      if(kingSq && kingSq.r===r && kingSq.c===c) sq.classList.add('in-check');
      sq.addEventListener('click', ()=> chessSquareClick(r,c));
      boardEl.appendChild(sq);
    }
  }
}
function chessRenderMoveLog(){
  const el = document.getElementById('chessMoveLog');
  if(!el) return;
  let html = '';
  for(let i=0;i<chessMoveLog.length;i+=2){
    const num = i/2 + 1;
    html += `<span>${num}. ${chessMoveLog[i]||''} ${chessMoveLog[i+1]||''}</span>`;
  }
  el.innerHTML = html || '<span class="chess-movelog-empty">Nenhum lance ainda.</span>';
  el.scrollTop = el.scrollHeight;
}
function chessRenderCaptured(){
  const wEl = document.getElementById('chessCapturedByWhite');
  const bEl = document.getElementById('chessCapturedByBlack');
  if(wEl) wEl.textContent = chessCaptured.b.map(p=>PIECE_UNICODE[p]).join(' ') || '—';
  if(bEl) bEl.textContent = chessCaptured.w.map(p=>PIECE_UNICODE[p]).join(' ') || '—';
}
function chessSquareClick(r,c){
  if(chessGameOver || chessTurn!=='w') return;
  const p = chessBoard[r][c];
  if(chessSelected){
    const legalMove = chessLegalForSelected.find(m=>m.r===r && m.c===c);
    if(legalMove){
      chessRecordMove(chessSelected, {r,c});
      chessBoard = chessMakeMove(chessBoard, chessSelected, {r,c});
      chessSelected = null; chessLegalForSelected = [];
      chessTurn = 'b';
      chessRenderBoard();
      chessRenderMoveLog();
      chessRenderCaptured();
      chessCheckGameEnd();
      if(!chessGameOver){
        document.getElementById('chessStatus').textContent = 'Bot Sigma pensando...';
        setTimeout(chessBotMove, 250);
      }
      return;
    }
  }
  if(p && chessColor(p)==='w'){
    chessSelected = {r,c};
    chessLegalForSelected = chessLegalMoves(chessBoard,r,c);
  }else{
    chessSelected = null; chessLegalForSelected = [];
  }
  chessRenderBoard();
}

// registra a notação e a peça capturada de um lance ANTES de aplicá-lo ao tabuleiro
function chessRecordMove(from, to){
  const moving = chessBoard[from.r][from.c];
  const captured = chessBoard[to.r][to.c];
  if(captured) chessCaptured[chessColor(captured)].push(captured);
  const type = chessType(moving);
  const letterMap = {N:'N',B:'B',R:'R',Q:'Q',K:'K'};
  let s = type!=='P' ? letterMap[type] : '';
  if(captured){ if(type==='P') s += CHESS_FILES[from.c]; s += 'x'; }
  s += chessSquareName(to.r, to.c);
  chessMoveLog.push(s);
}
function chessBotMove(){
  if(chessGameOver) return;
  const chosen = chessChooseBotMove(chessBoard);
  if(!chosen) return;
  chessRecordMove(chosen.from, chosen.to);
  chessBoard = chessMakeMove(chessBoard, chosen.from, chosen.to);
  chessTurn = 'w';
  chessRenderBoard();
  chessRenderMoveLog();
  chessRenderCaptured();
  chessCheckGameEnd();
  if(!chessGameOver){
    document.getElementById('chessStatus').textContent = chessInCheck(chessBoard,'w') ? 'Xeque! Sua vez (brancas).' : 'Sua vez (brancas).';
  }
}
function chessAnnotateLastMove(suffix){
  if(chessMoveLog.length){
    chessMoveLog[chessMoveLog.length-1] += suffix;
    chessRenderMoveLog();
  }
}
function chessCheckGameEnd(){
  const moves = chessAllLegalMoves(chessBoard, chessTurn);
  const inCheck = chessInCheck(chessBoard, chessTurn);
  if(moves.length>0){
    if(inCheck) chessAnnotateLastMove('+');
    return;
  }
  chessGameOver = true;
  const resultEl = document.getElementById('chessResult');
  if(inCheck){
    chessAnnotateLastMove('#');
    if(chessTurn==='b'){
      resultEl.textContent = `♟️ XEQUE-MATE! Você venceu o Bot Sigma! +${fmt(CHESS_WIN_REWARD)} de aura!`;
      resultEl.classList.add('win');
      payoutFreeGame(CHESS_WIN_REWARD, 'Xadrez');
      state.chessWins = (state.chessWins||0) + 1;
      checkAchievements();
      beep(880, 0.2, 0.06);
    }else{
      resultEl.textContent = '♟️ Xeque-mate... o Bot Sigma te derrotou. Sem aura hoje.';
      resultEl.classList.add('lose');
      beep(140, 0.2, 0.05);
    }
  }else{
    resultEl.textContent = '♟️ Empate por afogamento. Ninguém ganha, ninguém perde.';
  }
  document.getElementById('chessStatus').textContent = 'Partida encerrada.';
  setFreeGameCooldown('g4', 45000);
  saveState();
  setTimeout(()=> renderFreeGames(), 300);
}
function openChessModal(){
  if(isCoolingDown()){ toast('🥶 Cooldown de aura ativo — jogos bloqueados.'); return; }
  if(freeGameOnCooldown('g4')){ toast('♟️ Ainda em cooldown, espera um pouco.'); return; }
  if(!chessBoard || chessGameOver){
    chessNewGame();
  }else{
    chessRenderBoard();
    chessRenderMoveLog();
    chessRenderCaptured();
  }
  document.getElementById('chessModal').classList.add('active');
}
document.getElementById('chessResignBtn').addEventListener('click', ()=>{
  if(chessGameOver){
    document.getElementById('chessModal').classList.remove('active');
    return;
  }
  chessGameOver = true;
  const resultEl = document.getElementById('chessResult');
  resultEl.textContent = '🏳️ Você desistiu. O Bot Sigma vence por W.O.';
  resultEl.classList.add('lose');
  document.getElementById('chessStatus').textContent = 'Partida encerrada.';
  setFreeGameCooldown('g4', 45000);
  saveState();
  renderFreeGames();
  setTimeout(()=> document.getElementById('chessModal').classList.remove('active'), 1200);
});
document.getElementById('chessCloseBtn').addEventListener('click', ()=>{
  document.getElementById('chessModal').classList.remove('active');
});

// ---------- DESAFIOS DE ALTO RISCO ----------
const CHALLENGE_SPIN_MS = 35; // giro super rápido
const CHALLENGE_COOLDOWN_MS = 25 * 1000; // 25s entre tentativas
let challengeSpinInterval = null;
let challengeActiveDef = null;
let challengeTarget = 1;
let challengeCurrentDisplay = 1;

function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

function renderChallenges(){
  const grid = document.getElementById('grid-challenges');
  grid.innerHTML = '';
  CHALLENGE_UPGRADES.forEach(def=>{
    const bought = state.challengeBought.includes(def.id);
    const card = document.createElement('div');
    card.className = 'upgrade-card' + (bought ? '' : (state.aura>=def.cost ? ' affordable' : ''));
    const onCooldown = challengeOnCooldown(def.id);
    let bottomHtml;
    if(!bought){
      bottomHtml = `
        <div class="uc-bottom">
          <div class="uc-cost">✨ ${fmt(def.cost)}</div>
          <button class="buy-btn" id="buy-${def.id}">Comprar</button>
        </div>`;
    }else{
      const cdRemaining = onCooldown ? Math.ceil((state.challengeCooldowns[def.id]-Date.now())/1000) : 0;
      bottomHtml = `
        <div class="uc-bottom">
          <div class="uc-cost">Recompensa: ${fmt(def.reward)}</div>
          <button class="buy-btn ${onCooldown?'':'affordable-btn'}" id="play-${def.id}" ${onCooldown?'disabled':''}>${onCooldown ? `⏳ ${cdRemaining}s` : '▶️ Jogar'}</button>
        </div>`;
    }
    card.innerHTML = `
      <div class="uc-top">
        <div class="uc-emoji">${def.emoji}</div>
        <div>
          <div class="uc-name">${def.name}</div>
          <div class="uc-lvl">${bought ? 'Desbloqueado' : 'Bloqueado'}</div>
        </div>
      </div>
      <div class="uc-desc">${def.desc}</div>
      ${bottomHtml}
    `;
    grid.appendChild(card);

    if(!bought){
      card.querySelector('.buy-btn').addEventListener('click', ()=>{
        if(isCoolingDown()){ toast('🥶 Cooldown ativo — compras bloqueadas.'); return; }
        if(state.aura < def.cost) return;
        state.aura -= def.cost;
        state.challengeBought.push(def.id);
        saveState();
        renderChallenges();
        renderTopStats();
        toast(`Desbloqueou "${def.name}". Que coragem (ou burrice).`);
      });
    }else{
      const playBtn = card.querySelector('.buy-btn');
      if(playBtn && !onCooldown){
        playBtn.addEventListener('click', ()=> openChallenge(def));
      }
    }
  });

  // botão de affordable style pro botão "Jogar" também pegar o gradiente do buy-btn
  document.querySelectorAll('#grid-challenges .affordable-btn').forEach(b=>{
    b.closest('.upgrade-card').classList.add('affordable');
  });
}

function challengeOnCooldown(id){
  const t = state.challengeCooldowns[id];
  return t && Date.now() < t;
}

function openChallenge(def){
  if(isCoolingDown()){ toast('🥶 Cooldown ativo — desafios bloqueados.'); return; }
  challengeActiveDef = def;
  challengeTarget = randInt(1, 1000);

  document.getElementById('challengeTitle').textContent = def.emoji + ' ' + def.name;
  document.getElementById('challengeSub').textContent = def.desc;
  document.getElementById('challengeResult').textContent = '';
  document.getElementById('challengeResult').className = 'lightning-result';

  const spinWrap = document.getElementById('challengeSpinWrap');
  const typeWrap = document.getElementById('challengeTypeWrap');

  if(def.mode === 'spin'){
    spinWrap.style.display = 'block';
    typeWrap.style.display = 'none';
    challengeCurrentDisplay = randInt(1,1000);
    document.getElementById('challengeNumber').textContent = challengeCurrentDisplay;
    challengeSpinInterval = setInterval(()=>{
      challengeCurrentDisplay = randInt(1,1000);
      document.getElementById('challengeNumber').textContent = challengeCurrentDisplay;
    }, CHALLENGE_SPIN_MS);
  }else{
    spinWrap.style.display = 'none';
    typeWrap.style.display = 'block';
    document.getElementById('challengeTypeInput').value = '';
  }

  document.getElementById('challengeModal').classList.add('active');
}

document.getElementById('challengeStopBtn').addEventListener('click', ()=>{
  if(!challengeSpinInterval || !challengeActiveDef) return;
  clearInterval(challengeSpinInterval);
  challengeSpinInterval = null;
  resolveChallenge(challengeCurrentDisplay);
});

document.getElementById('challengeSubmitBtn').addEventListener('click', ()=>{
  if(!challengeActiveDef) return;
  const val = parseInt(document.getElementById('challengeTypeInput').value, 10);
  resolveChallenge(val);
});

function resolveChallenge(guess){
  const def = challengeActiveDef;
  if(!def) return;
  const resultEl = document.getElementById('challengeResult');
  const won = guess === challengeTarget;

  if(won){
    state.aura += def.reward;
    state.totalEarned += def.reward;
    state.lifetimeAura += def.reward;
    resultEl.textContent = `🎉 ACERTOU! Era o ${challengeTarget}! +${fmt(def.reward)} de aura!`;
    resultEl.classList.add('win');
    beep(880, 0.18, 0.06);
    if(def.id === 'ch3'){
      state.challengeSupremeWins = (state.challengeSupremeWins||0) + 1;
    }
  }else{
    if(def.failReset === 'always'){
      state.aura = 0;
      resultEl.textContent = `❌ Era o ${challengeTarget}, você errou. Aura ZERADA na hora.`;
    }else if(def.failReset === 'hardcore' && state.hardcore){
      state.aura = 0;
      state.clickLevels = {};
      state.autoLevels = {};
      state.multBought = [];
      state.specialBought = [];
      state.challengeBought = [];
      resultEl.textContent = `☠️ Era o ${challengeTarget}. HARDCORE NÃO PERDOA: você perdeu TUDO — aura e upgrades.`;
    }else{
      resultEl.textContent = `❌ Era o ${challengeTarget}, não foi dessa vez. Tenta de novo depois.`;
    }
    resultEl.classList.add('lose');
    beep(160, 0.18, 0.05);
  }

  state.challengeCooldowns[def.id] = Date.now() + CHALLENGE_COOLDOWN_MS;
  saveState();
  renderTopStats();
  renderUpgrades();
  checkAchievements();
  challengeActiveDef = null;

  setTimeout(()=>{
    document.getElementById('challengeModal').classList.remove('active');
    renderChallenges();
  }, 1800);
}

// ---------- EVENTO RELÂMPAGO (minigame do "Benção do Skyace 2") ----------
const LIGHTNING_REWARD = 1000000000; // 1 bi de aura
const LIGHTNING_COOLDOWN_MS = 45 * 1000; // 45s entre tentativas
const LIGHTNING_SPIN_MS = 90; // velocidade do número girando (rapidão)
let lightningSpinInterval = null;
let lightningCurrentNumber = 0;

function hasLightningEvent(){ return state.specialBought.includes('s9'); }
function lightningOnCooldown(){ return state.lightningCooldownUntil && Date.now() < state.lightningCooldownUntil; }

function renderLightningButton(){
  const btn = document.getElementById('lightningBtn');
  if(!hasLightningEvent()){ btn.style.display = 'none'; return; }
  btn.style.display = 'inline-block';
  if(lightningOnCooldown()){
    btn.disabled = true;
    const remaining = Math.max(0, state.lightningCooldownUntil - Date.now());
    btn.textContent = `⏳ Evento Relâmpago em ${Math.ceil(remaining/1000)}s`;
  }else{
    btn.disabled = false;
    btn.textContent = '⚡ Evento Relâmpago — acerte o 6!';
  }
}

document.getElementById('lightningBtn').addEventListener('click', ()=>{
  if(!hasLightningEvent() || lightningOnCooldown() || isCoolingDown()) return;
  openLightningModal();
});

function openLightningModal(){
  const modal = document.getElementById('lightningModal');
  const numEl = document.getElementById('lightningNumber');
  const resultEl = document.getElementById('lightningResult');
  resultEl.textContent = '';
  resultEl.className = 'lightning-result';
  modal.classList.add('active');
  lightningCurrentNumber = Math.floor(Math.random()*10);
  numEl.textContent = lightningCurrentNumber;
  lightningSpinInterval = setInterval(()=>{
    lightningCurrentNumber = Math.floor(Math.random()*10);
    numEl.textContent = lightningCurrentNumber;
  }, LIGHTNING_SPIN_MS);
}

document.getElementById('lightningStopBtn').addEventListener('click', ()=>{
  if(!lightningSpinInterval) return;
  clearInterval(lightningSpinInterval);
  lightningSpinInterval = null;
  const resultEl = document.getElementById('lightningResult');
  const won = lightningCurrentNumber === 6;
  if(won){
    state.aura += LIGHTNING_REWARD;
    state.totalEarned += LIGHTNING_REWARD;
    state.lifetimeAura += LIGHTNING_REWARD;
    resultEl.textContent = '🎉 ACERTOU O 6! +1.000.000.000 de aura!';
    resultEl.classList.add('win');
    beep(880, 0.15, 0.06);
    checkAchievements();
  }else{
    resultEl.textContent = `❌ Deu ${lightningCurrentNumber}, não foi dessa vez.`;
    resultEl.classList.add('lose');
    beep(160, 0.15, 0.05);
  }
  state.lightningCooldownUntil = Date.now() + LIGHTNING_COOLDOWN_MS;
  saveState();
  renderTopStats();
  setTimeout(()=>{
    document.getElementById('lightningModal').classList.remove('active');
  }, 1400);
});

// ---------- COOLDOWN DE AURA NEGATIVA ----------
const COOLDOWN_THRESHOLD = -100000;
const COOLDOWN_MS = 3 * 60 * 1000; // 3 minutos
const COOLDOWN_SECRET_MS = 3 * 1000; // 3 segundos
const SECRET_CODE = 'edielson';

function isCoolingDown(){
  return state.cooldownUntil && Date.now() < state.cooldownUntil;
}

// Chamada sempre que a aura muda: se cair demais no vermelho, ativa o cooldown
function checkAuraCooldown(){
  if(state.aura <= COOLDOWN_THRESHOLD && !isCoolingDown()){
    state.cooldownUntil = Date.now() + COOLDOWN_MS;
    saveState();
    toast('🥶 Aura negativa demais! Cooldown de 3 minutos ativado.');
    playTitleSound(titleObj?.sound);
  }
}

function renderCooldown(){
  const overlay = document.getElementById('cooldownOverlay');
  const orb = document.getElementById('orbBtn');
  if(isCoolingDown()){
    overlay.classList.add('active');
    orb.classList.add('locked');
    const remaining = Math.max(0, state.cooldownUntil - Date.now());
    const hh = Math.floor(remaining / 3600000);
    const mm = Math.floor((remaining % 3600000) / 60000);
    const ss = Math.floor((remaining % 60000) / 1000);
    document.getElementById('cooldownTimer').textContent = hh > 0
      ? String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0') + ':' + String(ss).padStart(2,'0')
      : String(mm).padStart(2,'0') + ':' + String(ss).padStart(2,'0');
  }else{
    overlay.classList.remove('active');
    orb.classList.remove('locked');
  }
}

document.getElementById('cooldownCodeBtn').addEventListener('click', applyCooldownCode);
document.getElementById('cooldownCodeInput').addEventListener('keydown', (e)=>{
  if(e.key === 'Enter') applyCooldownCode();
});
const COOLDOWN_WRONG_PENALTY_MS = 3 * 60 * 60 * 1000; // 3 horas de penalidade

function applyCooldownCode(){
  const input = document.getElementById('cooldownCodeInput');
  const val = (input.value || '').trim().toLowerCase();
  if(val === SECRET_CODE){
    state.aura = 0;
    state.cooldownUntil = Date.now() + COOLDOWN_SECRET_MS;
    saveState();
    renderTopStats();
    toast('🔓 Código aceito! Aura resetada pra 0 e cooldown reduzido pra 3 segundos.');
    input.value = '';
  }else{
    state.cooldownUntil = (state.cooldownUntil || Date.now()) + COOLDOWN_WRONG_PENALTY_MS;
    saveState();
    toast('❌ Código errado! +3 horas de cooldown como penalidade.');
    input.value = '';
  }
}

// ---------- CLIQUE ----------
const orbBtn = document.getElementById('orbBtn');
const orbZone = document.getElementById('orbZone');

orbBtn.addEventListener('click', (e)=>{
  if(isCoolingDown()) return;
  computeStats();
  const gain = stats.perClick;
  state.aura += gain;
  state.totalEarned += gain;
  state.lifetimeAura += gain;
  state.clicks += 1;

  spawnFloatNumber(e, gain);
  spawnParticles(e);
  beep(520 + Math.random()*80, 0.05, 0.04);

  if(Math.random() < 0.03){
    toast(CLICK_MSGS[Math.floor(Math.random()*CLICK_MSGS.length)]);
  }

  checkAchievements();
  checkAuraCooldown();
  renderTopStats();
});

function spawnFloatNumber(e, amount){
  const rect = orbZone.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  const el = document.createElement('div');
  el.className = 'float-num';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.textContent = '+' + fmt(amount);
  orbZone.appendChild(el);
  setTimeout(()=> el.remove(), 900);
}
function spawnParticles(e){
  const rect = orbZone.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  for(let i=0;i<6;i++){
    const p = document.createElement('div');
    p.className = 'particle';
    const angle = Math.random()*Math.PI*2;
    const dist = 30 + Math.random()*40;
    p.style.setProperty('--tx', `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`);
    p.style.left = x+'px'; p.style.top = y+'px';
    orbZone.appendChild(p);
    setTimeout(()=> p.remove(), 600);
  }
}

// ---------- RENDER: TOPO / HERO ----------
function renderTopStats(){
  computeStats();
  document.getElementById('auraBig').innerHTML = fmt(state.aura) + '<span class="unit">aura</span>';
  document.getElementById('headerAura').textContent = fmt(state.aura);
  document.getElementById('perClickDisplay').textContent = fmt(stats.perClick);
  document.getElementById('perSecDisplay').textContent = fmt(stats.perSecond);
  const title = getTitle(state.totalEarned);
  document.getElementById('headerTitle').textContent = title;

  if(lastTitleName === null){
    // primeira renderização — só registra, não toca som
    lastTitleName = title;
  }else if(title !== lastTitleName){
    lastTitleName = title;
    const titleObj = TITLES.find(t => t.name === title);
    playTitleSound(titleObj?.sound);
    toast(`🎖️ Novo título desbloqueado: ${title}!`);
  }

  // multiplicador acumulado (escala entre os upgrades de multiplicador, ex: 5x * 1000x = 5000x)
  const multClickTag = document.getElementById('multClickTag');
  const multSecTag = document.getElementById('multSecTag');
  if(stats.mult > 1){
    multClickTag.style.display = 'inline';
    multSecTag.style.display = 'inline';
    document.getElementById('multClickVal').textContent = fmt(stats.mult);
    document.getElementById('multSecVal').textContent = fmt(stats.mult);
  }else{
    multClickTag.style.display = 'none';
    multSecTag.style.display = 'none';
  }

  if(state.prestigeCount > 0){
    document.getElementById('prestigeBadge').style.display = 'inline-block';
    document.getElementById('prestigeMultDisplay').textContent = stats.prestigeMult.toFixed(2);
  }
}

// ---------- RENDER: UPGRADES ----------
function renderUpgrades(){
  computeStats();
  const gridClick = document.getElementById('grid-click');
  const gridMult = document.getElementById('grid-mult');
  const gridAuto = document.getElementById('grid-auto');
  const gridSpecial = document.getElementById('grid-special');
  gridClick.innerHTML=''; gridMult.innerHTML=''; gridAuto.innerHTML=''; gridSpecial.innerHTML='';

  CLICK_UPGRADES.forEach(u=>{
    const lvl = state.clickLevels[u.id]||0;
    const cost = getUpgradeCost(u.baseCost, lvl);
    gridClick.appendChild(makeCard({
      emoji:u.emoji, name:u.name, desc:u.desc, lvlText:`Nível ${lvl} ` + `| +${lvl * u.value} por click`,
      cost, affordable: state.aura>=cost,
      onBuy:()=>{ state.clickLevels[u.id]=lvl+1; state.aura-=cost; afterBuy(u.name); }
    }));
  });

  MULT_UPGRADES.forEach(u=>{
    const bought = state.multBought.includes(u.id);
    gridMult.appendChild(makeCard({
      emoji:u.emoji, name:u.name, desc:u.desc, lvlText: bought? 'Comprado' : `Multiplica tudo por x${u.mult}`,
      cost:u.cost, affordable: !bought && state.aura>=u.cost, maxed:bought,
      onBuy:()=>{ if(bought) return; state.multBought.push(u.id); state.aura-=u.cost; afterBuy(u.name); }
    }));
  });

  AUTO_UPGRADES.forEach(u=>{
    const lvl = state.autoLevels[u.id]||0;
    const cost = getUpgradeCost(u.baseCost, lvl);
    gridAuto.appendChild(makeCard({
      emoji:u.emoji, name:u.name, desc:u.desc, lvlText:`Nível ${lvl} ` + `| ${lvl * u.value} de geração passiva`,
      cost, affordable: state.aura>=cost,
      onBuy:()=>{ state.autoLevels[u.id]=lvl+1; state.aura-=cost; afterBuy(u.name); }
    }));
  });

  SPECIAL_UPGRADES.forEach(u=>{
    const bought = state.specialBought.includes(u.id);
    gridSpecial.appendChild(makeCard({
      emoji:u.emoji, name:u.name, desc:u.desc, lvlText: bought? 'Comprado' : `+${Math.round(u.bonus*100)}% produção geral`,
      cost:u.cost, affordable: !bought && state.aura>=u.cost, maxed:bought,
      onBuy:()=>{ if(bought) return; state.specialBought.push(u.id); state.aura-=u.cost; afterBuy(u.name); }
    }));
  });
}

function makeCard({emoji,name,desc,lvlText,cost,affordable,maxed,onBuy}){
  const card = document.createElement('div');
  card.className = 'upgrade-card' + (maxed?' maxed':(affordable?' affordable':''));
  card.innerHTML = `
    <div class="uc-top">
      <div class="uc-emoji">${emoji}</div>
      <div>
        <div class="uc-name">${name}</div>
        <div class="uc-lvl">${lvlText}</div>
      </div>
    </div>
    <div class="uc-desc">${desc}</div>
    <div class="uc-bottom">
      <div class="uc-cost">${maxed?'✓':'✨ '+fmt(cost)}</div>
      <button class="buy-btn" ${maxed?'disabled':''}>${maxed?'Máximo':'Comprar'}</button>
    </div>
  `;
  if(!maxed){
    card.querySelector('.buy-btn').addEventListener('click', ()=>{
      if(isCoolingDown()){ toast('🥶 Cooldown ativo — compras bloqueadas.'); return; }
      onBuy();
    });
  }
  return card;
}

function afterBuy(name){
  saveState();
  renderUpgrades();
  renderTopStats();
  checkAchievements();
  renderLightningButton();
  beep(300, 0.08, 0.05);
  if(Math.random() < 0.5){
    const msg = BUY_MSGS[Math.floor(Math.random()*BUY_MSGS.length)].replace('{name}', name);
    toast(msg);
  }
}

// ---------- RENDER: RANKING ----------
function getBots(){
  let bots = JSON.parse(localStorage.getItem('auraFarmBots') || 'null');
  if(!bots){
    bots = BOT_NAMES.map((name, i)=>{
      // valores espalhados em escala logarítmica pra parecer orgânico
      const magnitude = Math.pow(10, 2 + (i % 8) * 0.9 + Math.random()*0.7);
      return { name, aura: Math.round(magnitude * (0.6+Math.random()*0.8)) };
    });
    localStorage.setItem('auraFarmBots', JSON.stringify(bots));
  }
  return bots;
}

function renderRanking(){
  const bots = getBots();
  const all = bots.map(b=>({name:b.name, aura:b.aura, isMe:false}));
  LEGEND_BOTS.forEach(b=> all.push({name:b.name, aura:b.aura, isMe:false, legend:true}));
  all.push({name: state.playerName || 'Você', aura: state.totalEarned, isMe:true});
  all.sort((a,b)=> b.aura - a.aura);
  const top = all.slice(0, 20);

  const list = document.getElementById('rankList');
  list.innerHTML = '';
  top.forEach((row, i)=>{
    const el = document.createElement('div');
    el.className = 'tiki-tiki-tikirow' + (row.isMe ? ' me' : '');
    el.innerHTML = `
      <div class="tiki-tiki-tikipos">${i+1===1?'🥇':i+1===2?'🥈':i+1===3?'🥉':'#'+(i+1)}</div>
      <div class="tiki-tiki-tikiname">${escapeHtml(row.name)}${row.isMe?' (você)':''}<span class="tiki-tiki-tikititle">${getTitle(row.aura)}</span></div>
      <div class="tiki-tiki-tikiaura">${fmt(row.aura)}</div>
    `;
    list.appendChild(el);
  });
}
function escapeHtml(str){
  const d = document.createElement('div'); d.textContent = str; return d.innerHTML;
}

// ---------- RENDER: ACHIEVEMENTS ----------
function checkAchievements(){
  let newly = [];
  ACHIEVEMENTS.forEach(a=>{
    if(!state.achievementsUnlocked.includes(a.id) && a.cond(state)){
      state.achievementsUnlocked.push(a.id);
      newly.push(a);
    }
  });
  if(newly.length){
    saveState();
    renderAchievements();
    newly.forEach(a=> toast(`🏆 Conquista desbloqueada: ${a.name}`));
  }
}
function renderAchievements(){
  const grid = document.getElementById('achGrid');
  grid.innerHTML = '';
  ACHIEVEMENTS.forEach(a=>{
    const unlocked = state.achievementsUnlocked.includes(a.id);
    const el = document.createElement('div');
    el.className = 'ach-card ' + (unlocked ? 'unlocked' : 'locked');
    el.innerHTML = `
      <div class="ach-icon">${unlocked ? a.icon : '🔒'}</div>
      <div>
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${unlocked ? a.desc : '???'}</div>
      </div>
    `;
    grid.appendChild(el);
  });
}

// ---------- PRESTÍGIO ----------
function prestigeGainAmount(){
  if(state.totalEarned < 1000000) return 0;
  return Math.max(1, Math.floor(Math.sqrt(state.totalEarned / 1000000)));
}
function renderPrestige(){
  const gain = prestigeGainAmount();
  document.getElementById('prestigeGainPreview').textContent = '+' + gain;
  document.getElementById('prestigeCountDisplay').textContent = state.prestigeCount;
  document.getElementById('prestigeCurrentMult').textContent = 'x' + (1+state.prestigeCount*0.15).toFixed(2);
  document.getElementById('lifetimeAuraDisplay').textContent = fmt(state.lifetimeAura);

  const btn = document.getElementById('ascendBtn');
  if(state.totalEarned >= 1000000){
    btn.disabled = false;
    btn.textContent = `🌌 Ascender agora (+${gain} Aura Divina)`;
  }else{
    btn.disabled = true;
    btn.textContent = `🔒 Farme 1.000.000 de aura para desbloquear (${fmt(state.totalEarned)}/1.000.000)`;
  }
}
document.getElementById('ascendBtn').addEventListener('click', ()=>{
  const gain = prestigeGainAmount();
  if(gain <= 0) return;
  if(!confirm(`Ascender vai resetar sua aura e upgrades atuais em troca de +${gain} de multiplicador permanente. Tem certeza que quer virar uma pessoa nova (de novo)?`)) return;

  state.prestigeCount += gain;
  state.aura = 0;
  state.totalEarned = 0;
  state.clickLevels = {};
  state.autoLevels = {};
  state.multBought = [];
  state.specialBought = [];
  saveState();
  renderAll();
  toast(`🌌 Você ascendeu! +${gain} de multiplicador permanente. Renascimento da aura concluído.`);
  updateThemeLocks();
});

// ---------- SETTINGS ----------
document.getElementById('soundToggle').addEventListener('click', function(){
  state.sound = !state.sound;
  this.classList.toggle('on', state.sound);
  saveState();
});
document.getElementById('hardcoreToggle').addEventListener('click', function(){
  state.hardcore = !state.hardcore;
  this.classList.toggle('on', state.hardcore);
  saveState();
  renderAll();
  updateThemeLocks();
  checkAchievements();
  toast(state.hardcore ? '💀 Modo Hardcore ativado. Boa sorte, produção pela metade.' : '✅ Modo Hardcore desativado. Covarde. (Tudo bem, respeitamos.)');
});
document.getElementById('resetBtn').addEventListener('click', ()=>{
  if(!confirm('Isso vai apagar TODO o seu progresso permanentemente. Certeza absoluta?')) return;
  localStorage.removeItem('auraFarmSave');
  state = Object.assign({}, DEFAULT_STATE);
  saveState();
  renderAll();
  toast('Tudo resetado. Bem-vindo de volta ao zero, campeão.');
});
document.getElementById('renameBtn').addEventListener('click', ()=>{
  const name = prompt('Como você quer aparecer no ranking?', state.playerName || 'Você');
  if(name && name.trim()){
    state.playerName = name.trim().slice(0,24);
    saveState();
    renderRanking();
  }
});
document.getElementById('shareBtn').addEventListener('click', ()=>{
  const title = getTitle(state.totalEarned);
  const text = `Já farmei ${fmtFull(state.totalEarned)} de Aura no Aura Farm e virei "${title}". Supera se conseguir. 🔮✨`;
  if(navigator.clipboard){
    navigator.clipboard.writeText(text).then(()=> toast('📋 Copiado! Vai lá postar e flexar.'))
      .catch(()=> alert(text));
  }else{
    alert(text);
  }
});

// tema
function updateThemeLocks(){
  const goldDot = document.querySelector('.theme-dot.gold');
  const crimsonDot = document.querySelector('.theme-dot.crimson');
  goldDot.classList.toggle('locked', state.prestigeCount < 1);
  crimsonDot.classList.toggle('locked', !state.hardcore);
}
document.querySelectorAll('.theme-dot').forEach(dot=>{
  dot.addEventListener('click', function(){
    if(this.classList.contains('locked')) return;
    const theme = this.dataset.theme;
    state.theme = theme;
    applyTheme();
    document.querySelectorAll('.theme-dot').forEach(d=>d.classList.remove('active'));
    this.classList.add('active');
    saveState();
  });
});
function applyTheme(){
  document.body.classList.remove('theme-gold','theme-crimson');
  if(state.theme === 'theme-gold') document.body.classList.add('theme-gold');
  if(state.theme === 'theme-crimson') document.body.classList.add('theme-crimson');
  document.querySelectorAll('.theme-dot').forEach(d=>{
    d.classList.toggle('active', d.dataset.theme === state.theme || (state.theme==='default' && d.dataset.theme==='default'));
  });
}

// ---------- TABS ----------
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
    if(btn.dataset.tab === 'ranking') renderRanking();
    if(btn.dataset.tab === 'challenges'){ renderChallenges(); renderFreeGames(); }
    if(btn.dataset.tab === 'prestige') renderPrestige();
    if(btn.dataset.tab === 'achievements') renderAchievements();
  });
});

// ---------- LOOP PRINCIPAL (auto-farm) ----------
setInterval(()=>{
  computeStats();
  if(stats.perSecond > 0){
    const gain = stats.perSecond / 10; // tick de 100ms
    state.aura += gain;
    state.totalEarned += gain;
    state.lifetimeAura += gain;
    renderTopStats();
  }
  checkAuraCooldown();
  renderCooldown();
  renderLightningButton();
}, 100);

// autosave + checagens periódicas
setInterval(()=>{
  saveState();
  checkAchievements();
  if(!document.getElementById('tab-prestige').classList.contains('active')){} else { renderPrestige(); }
  if(document.getElementById('tab-upgrades').classList.contains('active')) renderUpgrades();
  if(document.getElementById('tab-challenges').classList.contains('active')){ renderChallenges(); renderFreeGames(); }
}, 3000);

// ---------- INIT ----------
function renderAll(){
  renderTopStats();
  renderUpgrades();
  renderRanking();
  renderFreeGames();
  renderChallenges();
  renderAchievements();
  renderPrestige();
  document.getElementById('soundToggle').classList.toggle('on', state.sound);
  document.getElementById('hardcoreToggle').classList.toggle('on', state.hardcore);
  applyTheme();
  updateThemeLocks();
  renderCooldown();
  renderLightningButton();
}
renderAll();

// aviso ao sair sem salvar recente
window.addEventListener('beforeunload', saveState);