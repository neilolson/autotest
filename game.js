const SAVE_KEY = 'rainbow_beat_ranch_save_v10';

const quests = [
  { text: 'Place 3 decorations to start your ranch show.', type: 'build', target: 3, reward: 5 },
  { text: 'Hit 8 dance notes to cheer up the crowd.', type: 'hit', target: 8, reward: 8 },
  { text: 'Play 6 synth notes in rhythm.', type: 'synth', target: 6, reward: 10 },
  { text: 'Finish 2 songs to unlock your next spotlight.', type: 'song', target: 2, reward: 12 },
];

const achievementDefs = [
  { key: 'first_build', label: 'First Decor', reward: 3 },
  { key: 'builder_10', label: 'Builder x10', reward: 6 },
  { key: 'first_song', label: 'First Show', reward: 5 },
  { key: 'combo_10', label: 'Combo 10', reward: 8 },
  { key: 'synth_20', label: 'Synth Star', reward: 8 },
];

const defaultState = {
  starNotes: 0,
  friendHearts: 0,
  rainbowKeys: 0,
  streak: 0,
  combo: 0,
  bestCombo: 0,
  songsUnlocked: 1,
  selectedItem: '🌈',
  chillMode: false,
  autoAssist: false,
  bigMode: false,
  muted: false,
  practiceLoop: false,
  timingOffset: 0,
  graphicsMode: 'storybook',
  gloom: 40,
  questIndex: 0,
  questProgress: 0,
  placedItems: [],
  stats: { totalPlaced: 0, totalSongs: 0, totalHits: 0, totalSynth: 0, totalPowerMoves: 0 },
  achievements: {},
};

const runtime = {
  running: false,
  paused: false,
  notes: [],
  rafId: null,
  hitCount: 0,
  missCount: 0,
  beatCount: 0,
  spawnAccumulator: 0,
  assistAccumulator: 0,
  song: null,
  lastTs: 0,
  activeKeys: new Set(),
};

const songs = [
  { name: 'Shine Bounce', bpm: 96, beats: 14, pattern: [0, 1, 2, 1, 0, 2, 1, 0] },
  { name: 'Neon Bunny Beat', bpm: 108, beats: 18, pattern: [2, 1, 0, 1, 2, 0, 2, 1, 0] },
  { name: 'Moonlight Remix', bpm: 122, beats: 20, pattern: [0, 2, 1, 2, 0, 1, 2, 1, 0, 1] },
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
const synthMap = { j: 'C4', k: 'E4', l: 'G4' };
const freqMap = { C4: 261.63, E4: 329.63, G4: 392.0 };

const state = loadState();
const el = {
  starNotes: document.getElementById('starNotes'),
  friendHearts: document.getElementById('friendHearts'),
  rainbowKeys: document.getElementById('rainbowKeys'),
  songsUnlocked: document.getElementById('songsUnlocked'),
  streak: document.getElementById('streak'),
  combo: document.getElementById('combo'),
  bestCombo: document.getElementById('bestCombo'),
  accuracy: document.getElementById('accuracy'),
  gloomMeter: document.getElementById('gloomMeter'),
  gloomBar: document.getElementById('gloomBar'),
  questText: document.getElementById('questText'),
  questProgress: document.getElementById('questProgress'),
  synthStatus: document.getElementById('synthStatus'),
  judgeStatus: document.getElementById('judgeStatus'),
  unicornDancer: document.getElementById('unicornDancer'),
  bunnyDancer: document.getElementById('bunnyDancer'),
  timingReadout: document.getElementById('timingReadout'),
  achievements: document.getElementById('achievements'),
  saveData: document.getElementById('saveData'),
  exportSave: document.getElementById('exportSave'),
  importSave: document.getElementById('importSave'),
  buildTab: document.getElementById('buildTab'),
  danceTab: document.getElementById('danceTab'),
  buildMode: document.getElementById('buildMode'),
  danceMode: document.getElementById('danceMode'),
  shop: document.getElementById('shop'),
  ranch: document.getElementById('ranch'),
  songSelect: document.getElementById('songSelect'),
  startSong: document.getElementById('startSong'),
  pauseSong: document.getElementById('pauseSong'),
  powerMove: document.getElementById('powerMove'),
  songStatus: document.getElementById('songStatus'),
  missStatus: document.getElementById('missStatus'),
  chillMode: document.getElementById('chillMode'),
  autoAssist: document.getElementById('autoAssist'),
  bigMode: document.getElementById('bigMode'),
  muteAudio: document.getElementById('muteAudio'),
  practiceLoop: document.getElementById('practiceLoop'),
  timingOffset: document.getElementById('timingOffset'),
  graphicsMode: document.getElementById('graphicsMode'),
  resetProgress: document.getElementById('resetProgress'),
  touchButtons: Array.from(document.querySelectorAll('.touch-controls button')),
  synthButtons: Array.from(document.querySelectorAll('.synth-pad button')),
  lanes: Array.from(document.querySelectorAll('.lane')),
};

let audioCtx;
let lastSynthAt = 0;
let toneReady = false;
let toneSynth = null;
let missUiTimer;

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      placedItems: Array.isArray(parsed.placedItems) ? parsed.placedItems : [],
      stats: { ...defaultState.stats, ...(parsed.stats || {}) },
      achievements: { ...(parsed.achievements || {}) },
    };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function burstConfetti() {
  if (typeof confetti !== 'function') return;
  confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
}

async function ensureToneReady() {
  if (!window.Tone || toneReady) return;
  await window.Tone.start();
  const reverb = new Tone.Reverb(1.2).toDestination();
  toneSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.2, release: 0.8 },
  }).connect(reverb);
  toneReady = true;
}

function activeQuest() { return quests[state.questIndex % quests.length]; }
function changeGloom(delta) { state.gloom = clamp(state.gloom + delta, 0, 100); }

function currentAccuracy() {
  const total = runtime.hitCount + runtime.missCount;
  return total ? Math.round((runtime.hitCount / total) * 100) : 0;
}

function styleEmojiForMode(emoji) {
  if (state.graphicsMode === 'voxel') {
    const voxelMap = {
      '🌈': '▦', '🌸': '▣', '🥕': '▤', '🔊': '▥',
      '🎀': '▧', '✨': '▨', '🐇': '▩', '🦄': '▣',
    };
    return voxelMap[emoji] || '■';
  }
  return emoji;
}

function renderAchievements() {
  el.achievements.innerHTML = '';
  for (const a of achievementDefs) {
    const unlocked = Boolean(state.achievements[a.key]);
    const chip = document.createElement('div');
    chip.className = `achievement${unlocked ? ' unlocked' : ''}`;
    chip.textContent = unlocked ? `✅ ${a.label} (+${a.reward}⭐)` : `⬜ ${a.label}`;
    el.achievements.appendChild(chip);
  }
}

function unlockAchievement(key) {
  if (state.achievements[key]) return;
  const def = achievementDefs.find((a) => a.key === key);
  if (!def) return;
  state.achievements[key] = true;
  state.starNotes += def.reward;
  el.songStatus.textContent = `🏅 Achievement unlocked: ${def.label} (+${def.reward}⭐)`;
  burstConfetti();
  renderShop();
  renderAchievements();
}

function checkAchievements() {
  if (state.stats.totalPlaced >= 1) unlockAchievement('first_build');
  if (state.stats.totalPlaced >= 10) unlockAchievement('builder_10');
  if (state.stats.totalSongs >= 1) unlockAchievement('first_song');
  if (state.bestCombo >= 10) unlockAchievement('combo_10');
  if (state.stats.totalSynth >= 20) unlockAchievement('synth_20');
}

function renderRanchFromState() {
  el.ranch.innerHTML = '';
  state.placedItems.forEach((item) => {
    const placed = document.createElement('div');
    placed.className = 'placed';
    placed.textContent = styleEmojiForMode(item.emoji);
    placed.style.left = `${item.x}px`;
    placed.style.top = `${item.y}px`;
    el.ranch.appendChild(placed);
  });
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
    burstConfetti();
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
  el.combo.textContent = state.combo;
  el.bestCombo.textContent = state.bestCombo;
  el.accuracy.textContent = currentAccuracy();
  el.gloomMeter.textContent = state.gloom;
  el.gloomBar.style.width = `${state.gloom}%`;
  el.questText.textContent = quest.text;
  el.questProgress.textContent = `${state.questProgress} / ${quest.target}`;

  el.chillMode.checked = state.chillMode;
  el.autoAssist.checked = state.autoAssist;
  el.bigMode.checked = state.bigMode;
  el.muteAudio.checked = state.muted;
  el.practiceLoop.checked = state.practiceLoop;
  el.timingOffset.value = String(state.timingOffset);
  el.timingReadout.textContent = state.timingOffset;
  el.graphicsMode.value = state.graphicsMode;

  document.body.classList.toggle('big-mode', state.bigMode);
  document.body.classList.toggle('graphics-storybook', state.graphicsMode === 'storybook');
  document.body.classList.toggle('graphics-sticker', state.graphicsMode === 'sticker');
  document.body.classList.toggle('graphics-voxel', state.graphicsMode === 'voxel');
  document.body.style.setProperty('--timing-offset', `${state.timingOffset}px`);

  el.pauseSong.disabled = !runtime.running;
  el.pauseSong.textContent = runtime.paused ? 'Resume' : 'Pause';
  updateActionButtons();
  renderAchievements();
}

function updateActionButtons() {
  el.powerMove.disabled = !runtime.running || runtime.paused || state.rainbowKeys < 1 || runtime.notes.length === 0;
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
  state.placedItems.push({ x, y, emoji: state.selectedItem });
  state.stats.totalPlaced += 1;
  checkAchievements();
  renderRanchFromState();
}

function getAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playFallbackSynth(freq, duration = 0.18) {
  if (state.muted) return;
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
  el.bunnyDancer.classList.add('dance');
  el.synthStatus.textContent = label;
  setTimeout(() => {
    el.unicornDancer.classList.remove('dance');
    el.bunnyDancer.classList.remove('dance');
  }, 130);
}

function updateJudgeStatus(label, delta) {
  const sign = delta > 0 ? '+' : '';
  el.judgeStatus.textContent = `${label} (${sign}${Math.round(delta)}px)`;
}

async function handleSynthInput(key) {
  const note = synthMap[key];
  if (!note) return;

  await ensureToneReady();
  if (!state.muted && toneReady && toneSynth) toneSynth.triggerAttackRelease(note, '8n');
  else playFallbackSynth(freqMap[note] || 300);

  const now = performance.now();
  const rhythmGap = now - lastSynthAt;
  lastSynthAt = now;

  if (rhythmGap > 170 && rhythmGap < 540) {
    triggerUnicornDance('Nice rhythm! Unicorn groove +1');
    changeGloom(1);
    progressQuest('synth', 1);
  } else {
    triggerUnicornDance('Freestyle sparkle!');
  }
  state.friendHearts += 1;
  state.stats.totalSynth += 1;
  checkAchievements();
  updateHUD();
  saveState();
}

function spawnNote(laneIdx = null) {
  const lane = laneIdx ?? Math.floor(Math.random() * 3);
  const note = document.createElement('div');
  note.className = 'note';
  note.style.top = '0px';
  note.dataset.lane = String(lane);
  el.lanes[lane].appendChild(note);
  runtime.notes.push(note);
}

function clearSongObjects() {
  runtime.notes.forEach((n) => n.remove());
  runtime.notes = [];
}

function onMiss() {
  runtime.missCount += 1;
  state.combo = 0;
  state.streak = 0;
  changeGloom(-1);
  el.missStatus.textContent = `Misses: ${runtime.missCount} — You can do it!`;
  el.missStatus.classList.add('warn');
  clearTimeout(missUiTimer);
  missUiTimer = setTimeout(() => el.missStatus.classList.remove('warn'), 260);
}

function hitLane(laneIdx) {
  if (!runtime.running || runtime.paused) return;
  const hitLineY = 275 + state.timingOffset;
  const missWindow = state.chillMode ? 85 : 66;
  const laneNotes = runtime.notes
    .filter((n) => Number(n.dataset.lane) === laneIdx)
    .map((n) => ({ n, delta: parseFloat(n.style.top) - hitLineY }));
  const best = laneNotes
    .filter((entry) => Math.abs(entry.delta) <= missWindow)
    .sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta))[0];
  const target = best?.n;
  if (!target) return;
  const timingDelta = best.delta;

  const absDelta = Math.abs(timingDelta);
  const perfectWindow = state.chillMode ? 18 : 12;
  const goodWindow = state.chillMode ? 36 : 24;
  const rating = absDelta <= perfectWindow ? 'Perfect' : absDelta <= goodWindow ? 'Great' : 'Good';

  target.classList.add('hit');
  setTimeout(() => target.remove(), 140);
  runtime.notes = runtime.notes.filter((n) => n !== target);

  runtime.hitCount += 1;
  state.stats.totalHits += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.friendHearts += 1;
  if (state.friendHearts % 8 === 0) state.rainbowKeys += 1;
  if (rating === 'Perfect') state.starNotes += 1;

  changeGloom(2);
  progressQuest('hit', 1);
  checkAchievements();
  triggerUnicornDance(`${rating} hit! Combo ${state.combo}`);
  updateJudgeStatus(rating, timingDelta);
  updateHUD();
  saveState();
}

function usePowerMove() {
  if (!runtime.running || runtime.paused || state.rainbowKeys < 1 || runtime.notes.length === 0) return;

  state.rainbowKeys -= 1;
  state.stats.totalPowerMoves += 1;
  const hitLineY = 275 + state.timingOffset;

  const targets = [...runtime.notes]
    .map((note) => ({ note, delta: Math.abs(parseFloat(note.style.top) - hitLineY) }))
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 5)
    .map((entry) => entry.note);

  let cleared = 0;
  for (const target of targets) {
    if (!runtime.notes.includes(target)) continue;
    target.classList.add('hit');
    setTimeout(() => target.remove(), 120);
    runtime.notes = runtime.notes.filter((n) => n !== target);
    runtime.hitCount += 1;
    state.stats.totalHits += 1;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.friendHearts += 1;
    cleared += 1;
    progressQuest('hit', 1);
  }

  if (cleared > 0) {
    changeGloom(4 + cleared);
    checkAchievements();
    burstConfetti();
    triggerUnicornDance(`Power Move! Cleared ${cleared} notes`);
    updateJudgeStatus('Power', 0);
    el.songStatus.textContent = `🌈 Power Move! ${cleared} notes cleared.`;
    updateHUD();
    saveState();
  }
}

function maybeAssist(dt) {
  if (!state.autoAssist || !runtime.running || runtime.paused) return;
  runtime.assistAccumulator += dt;
  if (runtime.assistAccumulator < 260) return;
  runtime.assistAccumulator = 0;

  const target = runtime.notes.find((n) => {
    const y = parseFloat(n.style.top);
    return y > 225 && y < 300;
  });
  if (target) hitLane(Number(target.dataset.lane));
}

function endSong() {
  runtime.running = false;
  runtime.paused = false;
  if (runtime.rafId) cancelAnimationFrame(runtime.rafId);

  const ratio = runtime.song ? runtime.hitCount / runtime.song.beats : 0;
  const comboBonus = Math.floor(state.bestCombo / 3);
  const stars = Math.floor(ratio * 10) + 3 + comboBonus;

  state.starNotes += stars;
  state.streak = ratio > (state.chillMode ? 0.35 : 0.5) ? state.streak + 1 : 0;
  if (state.streak >= 2 && state.songsUnlocked < songs.length) state.songsUnlocked += 1;
  if (ratio >= 0.6) changeGloom(8);

  progressQuest('song', 1);
  state.stats.totalSongs += 1;
  checkAchievements();

  if (state.gloom >= 100) {
    el.songStatus.textContent = '🎉 You cleared the gloom and saved the ranch concert! +15⭐';
    state.gloom = 35;
    state.starNotes += 15;
    burstConfetti();
  } else {
    el.songStatus.textContent = `Song complete! ${stars}⭐ • Acc ${currentAccuracy()}% • Combo bonus ${comboBonus}`;
  }

  clearSongObjects();
  renderShop();
  setupSongs();
  state.combo = 0;
  state.bestCombo = 0;
  updateHUD();
  saveState();

  if (state.practiceLoop && runtime.song) {
    const nextSong = runtime.song;
    setTimeout(() => runSong(nextSong), 850);
  }
}

function songLoop(timestamp) {
  if (!runtime.running) return;
  if (!runtime.lastTs) runtime.lastTs = timestamp;
  const dt = timestamp - runtime.lastTs;
  runtime.lastTs = timestamp;

  if (!runtime.paused) {
    const beatMs = (60000 / runtime.song.bpm) * (state.chillMode ? 1.15 : 1);
    const fallSpeed = state.chillMode ? 145 : 185;

    runtime.spawnAccumulator += dt;
    while (runtime.spawnAccumulator >= beatMs && runtime.beatCount < runtime.song.beats) {
      runtime.spawnAccumulator -= beatMs;
      const lane = runtime.song.pattern[runtime.beatCount % runtime.song.pattern.length];
      runtime.beatCount += 1;
      spawnNote(lane);
    }

    runtime.notes = runtime.notes.filter((note) => {
      const nextY = parseFloat(note.style.top) + ((fallSpeed * dt) / 1000);
      note.style.top = `${nextY}px`;
      if (nextY > 332) {
        note.remove();
        onMiss();
        return false;
      }
      return true;
    });

    maybeAssist(dt);
    updateActionButtons();

    if (runtime.beatCount >= runtime.song.beats && runtime.notes.length === 0) {
      endSong();
      return;
    }
  }

  runtime.rafId = requestAnimationFrame(songLoop);
}

function togglePause() {
  if (!runtime.running) return;
  runtime.paused = !runtime.paused;
  el.songStatus.textContent = runtime.paused ? '⏸️ Paused' : '▶️ Resumed';
  updateHUD();
}

function runSong(song) {
  if (runtime.running) return;
  runtime.running = true;
  runtime.paused = false;
  runtime.song = song;
  runtime.lastTs = 0;
  runtime.hitCount = 0;
  runtime.missCount = 0;
  runtime.beatCount = 0;
  runtime.spawnAccumulator = 0;
  runtime.assistAccumulator = 0;
  state.combo = 0;
  state.bestCombo = 0;
  clearSongObjects();

  changeGloom(-6);
  el.judgeStatus.textContent = 'Song started! Hit close to the line for Perfect.';
  el.missStatus.textContent = 'No misses yet — keep dancing!';
  el.missStatus.classList.remove('warn');
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

function exportSave() {
  const data = JSON.stringify(state);
  el.saveData.value = data;
  el.songStatus.textContent = '✅ Save exported. Copy the text.';
}

function importSave() {
  const raw = el.saveData.value.trim();
  if (!raw) {
    el.songStatus.textContent = '⚠️ Paste save data first.';
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    Object.assign(state, {
      ...defaultState,
      ...parsed,
      placedItems: Array.isArray(parsed.placedItems) ? parsed.placedItems : [],
      stats: { ...defaultState.stats, ...(parsed.stats || {}) },
      achievements: { ...(parsed.achievements || {}) },
    });
    renderShop();
    setupSongs();
    renderRanchFromState();
    updateHUD();
    saveState();
    el.songStatus.textContent = '✅ Save imported!';
  } catch {
    el.songStatus.textContent = '❌ Invalid save data.';
  }
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
  if (key === ' ' && runtime.running) {
    e.preventDefault();
    togglePause();
    return;
  }
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
el.pauseSong.addEventListener('click', togglePause);
el.powerMove.addEventListener('click', usePowerMove);
el.buildTab.addEventListener('click', () => setTab('build'));
el.danceTab.addEventListener('click', () => setTab('dance'));

el.chillMode.addEventListener('change', () => { state.chillMode = el.chillMode.checked; updateHUD(); saveState(); });
el.autoAssist.addEventListener('change', () => { state.autoAssist = el.autoAssist.checked; updateHUD(); saveState(); });
el.bigMode.addEventListener('change', () => { state.bigMode = el.bigMode.checked; updateHUD(); saveState(); });
el.muteAudio.addEventListener('change', () => { state.muted = el.muteAudio.checked; updateHUD(); saveState(); });
el.practiceLoop.addEventListener('change', () => { state.practiceLoop = el.practiceLoop.checked; updateHUD(); saveState(); });
el.timingOffset.addEventListener('input', () => {
  state.timingOffset = Number(el.timingOffset.value);
  updateHUD();
  saveState();
});
el.graphicsMode.addEventListener('change', () => {
  state.graphicsMode = el.graphicsMode.value;
  renderRanchFromState();
  updateHUD();
  saveState();
});
el.exportSave.addEventListener('click', exportSave);
el.importSave.addEventListener('click', importSave);

el.resetProgress.addEventListener('click', () => {
  Object.assign(state, { ...defaultState, placedItems: [], stats: { ...defaultState.stats }, achievements: {} });
  runtime.running = false;
  runtime.paused = false;
  if (runtime.rafId) cancelAnimationFrame(runtime.rafId);
  clearSongObjects();
  renderShop();
  setupSongs();
  renderRanchFromState();
  updateHUD();
  saveState();
  el.songStatus.textContent = 'Progress reset. Ready for a fresh magical start!';
  el.synthStatus.textContent = 'Synth Jam: Play J / K / L to make beats!';
  el.saveData.value = '';
});

updateHUD();
renderShop();
setupSongs();
renderRanchFromState();
renderAchievements();
setTab('build');
