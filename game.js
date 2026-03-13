const SAVE_KEY = 'rainbow_beat_ranch_save_v5';

const quests = [
  { text: 'Place 3 decorations to start your ranch show.', type: 'build', target: 3, reward: 5 },
  { text: 'Hit 8 dance notes to cheer up the crowd.', type: 'hit', target: 8, reward: 8 },
  { text: 'Play 6 synth notes in rhythm.', type: 'synth', target: 6, reward: 10 },
  { text: 'Finish 2 songs to unlock your next spotlight.', type: 'song', target: 2, reward: 12 },
];

const defaultState = {
  starNotes: 0,
  friendHearts: 0,
  rainbowKeys: 0,
  streak: 0,
  songsUnlocked: 1,
  selectedItem: '🌈',
  chillMode: false,
  gloom: 40,
  questIndex: 0,
  questProgress: 0,
};

const runtime = {
  running: false,
  notes: [],
  rafId: null,
  hitCount: 0,
  beatCount: 0,
  spawnAccumulator: 0,
  moveAccumulator: 0,
  song: null,
  activeKeys: new Set(),
};

const songs = [
  { name: 'Shine Bounce', bpm: 96, beats: 14 },
  { name: 'Neon Bunny Beat', bpm: 108, beats: 18 },
  { name: 'Moonlight Remix', bpm: 122, beats: 20 },
];

const shopItems = [
  { emoji: '🌈', cost: 0, name: 'Rainbow Arch', gloomBoost: 1 },
  { emoji: '🌸', cost: 0, name: 'Flower', gloomBoost: 1 },
  { emoji: '🥕', cost: 5, name: 'Carrot Light', gloomBoost: 2 },
  { emoji: '🔊', cost: 7, name: 'Speaker', gloomBoost: 2 },
  { emoji: '🎀', cost: 9, name: 'Stage Bow', gloomBoost: 2 },
  { emoji: '✨', cost: 10, name: 'Sparkle Fountain', gloomBoost: 3 },
  { emoji: '🐇', cost: 12, name: 'Bunny Buddy', gloomBoost: 3 },
  { emoji: '🦄', cost: 15, name: 'Unicorn Statue', gloomBoost: 4 },
];

const keyMap = { a: 0, s: 1, d: 2 };
const synthMap = { j: 261.63, k: 329.63, l: 392.0 };

const state = loadState();
const el = {
  starNotes: document.getElementById('starNotes'),
  friendHearts: document.getElementById('friendHearts'),
  rainbowKeys: document.getElementById('rainbowKeys'),
  songsUnlocked: document.getElementById('songsUnlocked'),
  streak: document.getElementById('streak'),
  gloomMeter: document.getElementById('gloomMeter'),
  gloomBar: document.getElementById('gloomBar'),
  questText: document.getElementById('questText'),
  questProgress: document.getElementById('questProgress'),
  synthStatus: document.getElementById('synthStatus'),
  unicornDancer: document.getElementById('unicornDancer'),
  buildTab: document.getElementById('buildTab'),
  danceTab: document.getElementById('danceTab'),
  buildMode: document.getElementById('buildMode'),
  danceMode: document.getElementById('danceMode'),
  shop: document.getElementById('shop'),
  ranch: document.getElementById('ranch'),
  songSelect: document.getElementById('songSelect'),
  startSong: document.getElementById('startSong'),
  songStatus: document.getElementById('songStatus'),
  chillMode: document.getElementById('chillMode'),
  resetProgress: document.getElementById('resetProgress'),
  touchButtons: Array.from(document.querySelectorAll('.touch-controls button')),
  synthButtons: Array.from(document.querySelectorAll('.synth-pad button')),
  lanes: Array.from(document.querySelectorAll('.lane')),
};

let audioCtx;
let lastSynthAt = 0;

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...defaultState };
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function changeGloom(delta) {
  state.gloom = clamp(state.gloom + delta, 0, 100);
}

function activeQuest() {
  return quests[state.questIndex % quests.length];
}

function progressQuest(type, amount = 1) {
  const quest = activeQuest();
  if (quest.type !== type) return;
  state.questProgress += amount;
  if (state.questProgress >= quest.target) {
    state.starNotes += quest.reward;
    state.questIndex += 1;
    state.questProgress = 0;
    el.songStatus.textContent = `✨ Quest complete! +${quest.reward} Star Notes`;
  }
  renderShop();
  updateHUD();
  saveState();
}

function updateHUD() {
  const quest = activeQuest();
  el.starNotes.textContent = state.starNotes;
  el.friendHearts.textContent = state.friendHearts;
  el.rainbowKeys.textContent = state.rainbowKeys;
  el.songsUnlocked.textContent = state.songsUnlocked;
  el.streak.textContent = state.streak;
  el.gloomMeter.textContent = state.gloom;
  el.gloomBar.style.width = `${state.gloom}%`;
  el.questText.textContent = quest.text;
  el.questProgress.textContent = `${state.questProgress} / ${quest.target}`;
  el.chillMode.checked = state.chillMode;
}

function renderShop() {
  el.shop.innerHTML = '';
  for (const item of shopItems) {
    const btn = document.createElement('button');
    btn.textContent = `${item.emoji} ${item.name} ${item.cost ? `(${item.cost}⭐)` : '(free)'}`;
    btn.disabled = state.starNotes < item.cost;
    if (state.selectedItem === item.emoji) btn.classList.add('selected');
    btn.addEventListener('click', () => {
      state.selectedItem = item.emoji;
      saveState();
      renderShop();
    });
    el.shop.appendChild(btn);
  }
}

function setupSongs() {
  el.songSelect.innerHTML = '';
  songs.forEach((song, idx) => {
    if (idx < state.songsUnlocked) {
      const opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = song.name;
      el.songSelect.appendChild(opt);
    }
  });
}

function placeItem(x, y) {
  const placed = document.createElement('div');
  placed.className = 'placed';
  placed.textContent = state.selectedItem;
  placed.style.left = `${x}px`;
  placed.style.top = `${y}px`;
  el.ranch.appendChild(placed);
}

function getAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playSynthNote(freq, duration = 0.18) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function triggerUnicornDance(label) {
  el.unicornDancer.classList.add('dance');
  el.synthStatus.textContent = label;
  setTimeout(() => el.unicornDancer.classList.remove('dance'), 130);
}

function handleSynthInput(key) {
  const freq = synthMap[key];
  if (!freq) return;
  playSynthNote(freq);
  const now = performance.now();
  const rhythmGap = now - lastSynthAt;
  lastSynthAt = now;

  if (rhythmGap > 180 && rhythmGap < 520) {
    triggerUnicornDance('Nice rhythm! Unicorn groove +1');
    changeGloom(1);
    progressQuest('synth', 1);
  } else {
    triggerUnicornDance('Freestyle sparkle!');
  }
  state.friendHearts += 1;
  updateHUD();
  saveState();
}

function spawnNote() {
  const laneIdx = Math.floor(Math.random() * 3);
  const note = document.createElement('div');
  note.className = 'note';
  note.style.top = '0px';
  note.dataset.lane = String(laneIdx);
  el.lanes[laneIdx].appendChild(note);
  runtime.notes.push(note);
}

function clearSongObjects() {
  runtime.notes.forEach((n) => n.remove());
  runtime.notes = [];
}

function hitLane(laneIdx) {
  if (!runtime.running) return;
  const min = state.chillMode ? 210 : 230;
  const max = state.chillMode ? 315 : 295;
  const target = runtime.notes.find((n) => Number(n.dataset.lane) === laneIdx && parseFloat(n.style.top) >= min && parseFloat(n.style.top) <= max);
  if (!target) return;

  target.remove();
  runtime.notes = runtime.notes.filter((n) => n !== target);
  runtime.hitCount += 1;
  state.friendHearts += 1;
  if (state.friendHearts % 8 === 0) state.rainbowKeys += 1;
  changeGloom(2);
  progressQuest('hit', 1);
  triggerUnicornDance('Great hit!');
  updateHUD();
  saveState();
}

function endSong() {
  runtime.running = false;
  if (runtime.rafId) cancelAnimationFrame(runtime.rafId);

  const ratio = runtime.song ? runtime.hitCount / runtime.song.beats : 0;
  const stars = Math.floor(ratio * 10) + 3;
  state.starNotes += stars;
  state.streak = ratio > (state.chillMode ? 0.35 : 0.5) ? state.streak + 1 : 0;
  if (state.streak >= 2 && state.songsUnlocked < songs.length) state.songsUnlocked += 1;
  if (ratio >= 0.6) changeGloom(8);

  progressQuest('song', 1);
  if (state.gloom >= 100) {
    el.songStatus.textContent = '🎉 You cleared the gloom and saved the ranch concert! +15⭐';
    state.gloom = 35;
    state.starNotes += 15;
  } else {
    el.songStatus.textContent = `Song complete! You earned ${stars} Star Notes.`;
  }

  clearSongObjects();
  renderShop();
  setupSongs();
  updateHUD();
  saveState();
}

function songLoop(timestamp) {
  if (!runtime.running) return;
  if (!runtime.lastTs) runtime.lastTs = timestamp;
  const dt = timestamp - runtime.lastTs;
  runtime.lastTs = timestamp;

  const beatMs = 60000 / runtime.song.bpm * (state.chillMode ? 1.15 : 1);
  const fallSpeed = state.chillMode ? 145 : 185;

  runtime.spawnAccumulator += dt;
  while (runtime.spawnAccumulator >= beatMs && runtime.beatCount < runtime.song.beats) {
    runtime.spawnAccumulator -= beatMs;
    runtime.beatCount += 1;
    spawnNote();
  }

  runtime.notes = runtime.notes.filter((note) => {
    const nextY = parseFloat(note.style.top) + (fallSpeed * dt / 1000);
    note.style.top = `${nextY}px`;
    if (nextY > 332) {
      note.remove();
      return false;
    }
    return true;
  });

  if (runtime.beatCount >= runtime.song.beats && runtime.notes.length === 0) {
    endSong();
    return;
  }

  runtime.rafId = requestAnimationFrame(songLoop);
}

function runSong(song) {
  if (runtime.running) return;
  runtime.running = true;
  runtime.song = song;
  runtime.lastTs = 0;
  runtime.hitCount = 0;
  runtime.beatCount = 0;
  runtime.spawnAccumulator = 0;
  clearSongObjects();

  changeGloom(-6);
  updateHUD();
  saveState();
  el.songStatus.textContent = `Playing ${song.name}...`;
  runtime.rafId = requestAnimationFrame(songLoop);
}

function setTab(tab) {
  const build = tab === 'build';
  el.buildTab.classList.toggle('active', build);
  el.danceTab.classList.toggle('active', !build);
  el.buildMode.classList.toggle('active', build);
  el.danceMode.classList.toggle('active', !build);
}

el.ranch.addEventListener('click', (e) => {
  const rect = el.ranch.getBoundingClientRect();
  placeItem(e.clientX - rect.left, e.clientY - rect.top);
  const item = shopItems.find((s) => s.emoji === state.selectedItem) || shopItems[0];
  state.friendHearts += 1;
  changeGloom(item.gloomBoost);
  progressQuest('build', 1);
  updateHUD();
  saveState();
});

window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (runtime.activeKeys.has(key)) return;
  runtime.activeKeys.add(key);

  const laneIdx = keyMap[key];
  if (laneIdx !== undefined) hitLane(laneIdx);
  if (synthMap[key]) handleSynthInput(key);
});
window.addEventListener('keyup', (e) => runtime.activeKeys.delete(e.key.toLowerCase()));

el.touchButtons.forEach((btn) => btn.addEventListener('click', () => hitLane(Number(btn.dataset.lane))));
el.synthButtons.forEach((btn) => btn.addEventListener('click', () => handleSynthInput(btn.dataset.synth)));

el.startSong.addEventListener('click', () => runSong(songs[Number(el.songSelect.value || 0)]));
el.buildTab.addEventListener('click', () => setTab('build'));
el.danceTab.addEventListener('click', () => setTab('dance'));

el.chillMode.addEventListener('change', () => {
  state.chillMode = el.chillMode.checked;
  updateHUD();
  saveState();
});

el.resetProgress.addEventListener('click', () => {
  Object.assign(state, { ...defaultState });
  runtime.running = false;
  if (runtime.rafId) cancelAnimationFrame(runtime.rafId);
  clearSongObjects();
  el.ranch.innerHTML = '';
  renderShop();
  setupSongs();
  updateHUD();
  saveState();
  el.songStatus.textContent = 'Progress reset. Ready for a fresh magical start!';
  el.synthStatus.textContent = 'Synth Jam: Play J / K / L to make beats!';
});

updateHUD();
renderShop();
setupSongs();
setTab('build');
