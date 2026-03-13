const SAVE_KEY = 'rainbow_beat_ranch_save_v4';

const quests = [
  { text: 'Place 3 decorations to start your ranch show.', type: 'build', target: 3, reward: 5 },
  { text: 'Hit 8 dance notes to cheer up the crowd.', type: 'hit', target: 8, reward: 8 },
  { text: 'Finish 2 songs to unlock your next spotlight.', type: 'song', target: 2, reward: 10 },
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
  timers: [],
  hitCount: 0,
  beatCount: 0,
  songLen: 0,
};

const state = loadState();

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

const songs = [
  { name: 'Shine Bounce', tempo: 620, len: 14 },
  { name: 'Neon Bunny Beat', tempo: 520, len: 18 },
  { name: 'Moonlight Remix', tempo: 460, len: 20 },
];

const keyMap = { a: 0, s: 1, d: 2 };
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
  lanes: Array.from(document.querySelectorAll('.lane')),
};

let audioCtx;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
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
    el.songStatus.textContent = `✨ Quest complete! +${quest.reward} Star Notes`;
    state.questIndex += 1;
    state.questProgress = 0;
  }
  updateHUD();
  saveState();
  renderShop();
}

function changeGloom(delta) {
  state.gloom = clamp(state.gloom + delta, 0, 100);
  updateHUD();
}

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

function itemByEmoji(emoji) {
  return shopItems.find((item) => item.emoji === emoji) || shopItems[0];
}

function renderShop() {
  el.shop.innerHTML = '';
  for (const item of shopItems) {
    const btn = document.createElement('button');
    const locked = state.starNotes < item.cost;
    btn.textContent = `${item.emoji} ${item.name} ${item.cost ? `(${item.cost}⭐)` : '(free)'}`;
    btn.disabled = locked;
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
      const option = document.createElement('option');
      option.value = String(idx);
      option.textContent = song.name;
      el.songSelect.appendChild(option);
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

function playBeep(freq = 440, duration = 0.08) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  gain.gain.value = 0.02;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function spawnNote() {
  const laneIdx = Math.floor(Math.random() * 3);
  const lane = el.lanes[laneIdx];
  const note = document.createElement('div');
  note.className = 'note';
  note.style.top = '0px';
  note.dataset.lane = String(laneIdx);
  lane.appendChild(note);
  runtime.notes.push(note);
}

function clearRuntimeTimers() {
  runtime.timers.forEach(clearInterval);
  runtime.timers = [];
}

function clearNotes() {
  runtime.notes.forEach((n) => n.remove());
  runtime.notes = [];
}

function hitLane(laneIdx) {
  if (!runtime.running) return;
  const laneNotes = runtime.notes.filter((n) => Number(n.dataset.lane) === laneIdx);
  const windowMin = state.chillMode ? 210 : 230;
  const windowMax = state.chillMode ? 315 : 295;
  const target = laneNotes.find((n) => {
    const y = Number.parseFloat(n.style.top);
    return y >= windowMin && y <= windowMax;
  });

  if (!target) return;
  target.classList.add('hit');
  target.remove();
  runtime.notes = runtime.notes.filter((n) => n !== target);
  runtime.hitCount += 1;
  state.friendHearts += 1;
  if (state.friendHearts % 8 === 0) state.rainbowKeys += 1;
  changeGloom(2);
  progressQuest('hit', 1);
  playBeep(520, 0.05);
  saveState();
  el.songStatus.textContent = `Great move! Hits: ${runtime.hitCount}`;
}

function endSong() {
  runtime.running = false;
  clearRuntimeTimers();

  const ratio = runtime.songLen ? runtime.hitCount / runtime.songLen : 0;
  const stars = Math.floor(ratio * 10) + 3;
  state.starNotes += stars;
  state.streak = ratio > (state.chillMode ? 0.35 : 0.5) ? state.streak + 1 : 0;

  if (state.streak >= 2 && state.songsUnlocked < songs.length) {
    state.songsUnlocked += 1;
  }

  if (ratio >= 0.6) {
    changeGloom(8);
  }

  progressQuest('song', 1);
  saveState();
  renderShop();
  setupSongs();
  clearNotes();

  if (state.gloom >= 100) {
    el.songStatus.textContent = '🎉 You cleared the gloom and saved the ranch concert!';
    state.gloom = 35;
    state.starNotes += 15;
    saveState();
  } else {
    el.songStatus.textContent = `Song complete! You earned ${stars} Star Notes.`;
  }
  updateHUD();
}

function runSong(song) {
  if (runtime.running) return;
  runtime.running = true;
  runtime.hitCount = 0;
  runtime.beatCount = 0;
  runtime.songLen = song.len;
  clearNotes();

  changeGloom(-6);
  saveState();

  el.songStatus.textContent = `Playing ${song.name}...`;
  const fallStep = state.chillMode ? 22 : 28;
  const tempo = state.chillMode ? Math.round(song.tempo * 1.15) : song.tempo;

  const moveTimer = setInterval(() => {
    runtime.notes = runtime.notes.filter((note) => {
      const y = Number.parseFloat(note.style.top);
      const nextY = y + fallStep;
      note.style.top = `${nextY}px`;
      if (nextY > 320) {
        note.remove();
        return false;
      }
      return true;
    });
  }, 80);

  const spawnTimer = setInterval(() => {
    runtime.beatCount += 1;
    spawnNote();
    if (runtime.beatCount >= song.len) {
      clearInterval(spawnTimer);
      const finishTimer = setInterval(() => {
        if (!runtime.notes.length) {
          clearInterval(finishTimer);
          endSong();
        }
      }, 120);
      runtime.timers.push(finishTimer);
    }
  }, tempo);

  runtime.timers.push(moveTimer, spawnTimer);
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
  state.friendHearts += 1;
  if (state.friendHearts % 8 === 0) state.rainbowKeys += 1;
  changeGloom(itemByEmoji(state.selectedItem).gloomBoost);
  progressQuest('build', 1);
  saveState();
});

window.addEventListener('keydown', (e) => {
  const laneIdx = keyMap[e.key.toLowerCase()];
  if (laneIdx !== undefined) hitLane(laneIdx);
});

el.touchButtons.forEach((btn) => {
  btn.addEventListener('click', () => hitLane(Number(btn.dataset.lane)));
});

el.startSong.addEventListener('click', () => {
  const idx = Number(el.songSelect.value || 0);
  runSong(songs[idx]);
});

el.buildTab.addEventListener('click', () => setTab('build'));
el.danceTab.addEventListener('click', () => setTab('dance'));

el.chillMode.addEventListener('change', () => {
  state.chillMode = el.chillMode.checked;
  saveState();
});

el.resetProgress.addEventListener('click', () => {
  Object.assign(state, { ...defaultState });
  clearNotes();
  clearRuntimeTimers();
  runtime.running = false;
  el.ranch.innerHTML = '';
  renderShop();
  setupSongs();
  saveState();
  updateHUD();
  el.songStatus.textContent = 'Progress reset. Ready for a fresh magical start!';
});

updateHUD();
renderShop();
setupSongs();
setTab('build');
