(() => {
  'use strict';

  const CFG = Object.assign({ timePerQuestion: 10, autoStartTimer: false }, window.GAME_CONFIG || {});
  const QS = (window.QUESTIONS || []).slice(0, 10);
  const TOTAL = QS.length;
  const LEVELS = 10;
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  const $ = (s) => document.querySelector(s);
  const el = {
    intro: $('#intro'), game: $('#game'), end: $('#end'),
    name: $('#playerName'), startBtn: $('#startBtn'), replayBtn: $('#replayBtn'),
    avatarFile: $('#avatarFile'), avatarPreview: $('#avatarPreview'), avatarImg: $('#avatarImg'), endAvatar: $('#endAvatar'),
    playerLabel: $('#playerLabel'), dots: $('#dots'),
    tower: $('#tower'), tube: $('#tube'), avatar: $('#avatar'),
    subtitle: $('#subtitle'), options: $('#options'),
    qbar: $('#qbar'), qNum: $('#qNum'), qTotal: $('#qTotal'), qText: $('#qText'), qImg: $('#qImg'),
    answer: $('#answer'), aText: $('#aText'),
    timer: $('#timer'), timeText: $('#timeText'),
    stamp: $('#stamp'), flash: $('#flash'), controls: $('#controls'),
    timerBtn: $('#timerBtn'), revealBtn: $('#revealBtn'), correctBtn: $('#correctBtn'),
    wrongBtn: $('#wrongBtn'), undoBtn: $('#undoBtn'), nextBtn: $('#nextBtn'),
    endName: $('#endName'), endLevel: $('#endLevel'), endMsg: $('#endMsg'),
  };

  const state = {
    screen: 'intro', idx: 0, level: 0, results: [], judged: false,
    msLeft: 0, timerId: null, lastSec: 0, name: '', avatar: null,
    picked: null, pickTimer: null,
  };
  el.subtitle.textContent = CFG.subtitle || '';

  /* ================= AVATAR NGƯỜI CHƠI ================= */
  function fillAvatar(box) {
    box.innerHTML = '';
    if (state.avatar) {
      const img = document.createElement('img');
      img.src = state.avatar;
      img.alt = '';
      box.appendChild(img);
    } else {
      box.appendChild($('#boltTpl').content.cloneNode(true));
    }
  }
  function refreshAvatars() {
    [el.avatarPreview, el.avatarImg, el.endAvatar].forEach(fillAvatar);
  }
  el.avatarFile.addEventListener('change', () => {
    const f = el.avatarFile.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { state.avatar = r.result; refreshAvatars(); };
    r.readAsDataURL(f);
  });
  refreshAvatars();

  /* ================= ÂM THANH (tự tổng hợp, không cần file) ================= */
  const audio = {
    ctx: null,
    unlock() {
      if (!this.ctx) {
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* không có âm thanh */ }
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
  };
  function tone(freq, at, dur, type = 'square', vol = 0.12, toFreq) {
    const c = audio.ctx;
    if (!c) return;
    const t = c.currentTime + at;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (toFreq) o.frequency.exponentialRampToValueAtTime(toFreq, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  function noise(at, dur, vol = 0.2) {
    const c = audio.ctx;
    if (!c) return;
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = c.createBufferSource();
    const g = c.createGain();
    src.buffer = buf;
    g.gain.value = vol;
    src.connect(g).connect(c.destination);
    src.start(c.currentTime + at);
  }
  const sfx = {
    whoosh() { tone(250, 0, 0.3, 'sine', 0.1, 1400); },
    thunder() { noise(0, 0.6, 0.18); tone(70, 0, 0.6, 'sawtooth', 0.08, 40); },
    tick() { tone(1400, 0, 0.06, 'square', 0.07); },
    tickUrgent() { tone(1800, 0, 0.08, 'square', 0.1); tone(1800, 0.12, 0.08, 'square', 0.1); },
    timeout() { tone(120, 0, 1, 'sawtooth', 0.2); tone(124, 0, 1, 'square', 0.1); },
    correct() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.07, 0.3, 'square', 0.09)); },
    rise() { tone(180, 0.25, 1.3, 'triangle', 0.14, 1100); tone(360, 0.25, 1.3, 'sine', 0.06, 2200); },
    wrong() { tone(220, 0, 0.35, 'sawtooth', 0.16, 150); tone(160, 0.3, 0.6, 'sawtooth', 0.16, 80); },
    win() {
      const m = [523, 523, 523, 659, 784, 659, 784, 1047];
      const d = [0.12, 0.12, 0.12, 0.3, 0.12, 0.12, 0.12, 0.8];
      let t = 0;
      m.forEach((f, i) => { tone(f, t, d[i] + 0.1, 'square', 0.1); tone(f / 2, t, d[i] + 0.1, 'triangle', 0.08); t += d[i]; });
    },
    pop() { tone(600, 0, 0.12, 'sine', 0.1, 1200); },
    drumroll() {
      for (let i = 0; i < 16; i++) tone(95 + i * 4, i * 0.09, 0.08, 'triangle', 0.12 + i * 0.006);
      noise(0, 1.5, 0.05);
    },
  };

  /* ================= HIỆU ỨNG CANVAS ================= */
  const cv = $('#fx');
  const ctx = cv.getContext('2d');
  const COLORS = ['#39ff14', '#b6ff00', '#00ff88', '#ffe600', '#00e5ff', '#ff2bd6', '#ffffff'];
  let W = 0, H = 0;
  let parts = [];
  let bolts = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener('resize', resize);
  resize();

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  // Tia sáng li ti bay lên nền
  for (let i = 0; i < 70; i++) {
    parts.push({ kind: 'spark', x: rand(0, W), y: rand(0, H), vy: rand(-0.2, -1), r: rand(0.6, 2.4), tw: rand(0, 6), c: Math.random() < 0.8 ? '#39ff14' : pick(COLORS) });
  }

  function confetti(n, x, y, spreadUp = true) {
    for (let i = 0; i < n; i++) {
      const dir = x < W / 2 ? 1 : -1;
      parts.push({
        kind: 'conf', x, y,
        vx: spreadUp ? dir * rand(3, 15) : rand(-6, 6),
        vy: spreadUp ? rand(-12, -26) : rand(-4, 2),
        w: rand(6, 14), h: rand(10, 20), rot: rand(0, 6), vr: rand(-0.3, 0.3),
        c: pick(COLORS), life: rand(3, 5), age: 0,
      });
    }
  }
  function burst(x, y, n = 90, colors = COLORS) {
    const c0 = pick(colors);
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(1.5, 8);
      parts.push({ kind: 'fw', x, y, px: x, py: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, c: Math.random() < 0.6 ? c0 : pick(colors), life: rand(1, 1.8), age: 0 });
    }
  }
  function boltPath(x1, y1, x2, y2, disp) {
    if (disp < 3) return [[x1, y1], [x2, y2]];
    const mx = (x1 + x2) / 2 + rand(-disp, disp);
    const my = (y1 + y2) / 2 + rand(-disp, disp) * 0.3;
    const a = boltPath(x1, y1, mx, my, disp / 2);
    const b = boltPath(mx, my, x2, y2, disp / 2);
    return a.concat(b.slice(1));
  }
  function lightning(x, yEnd) {
    x = x ?? rand(W * 0.05, W * 0.95);
    yEnd = yEnd ?? rand(H * 0.4, H * 0.8);
    const main = boltPath(x, -10, x + rand(-150, 150), yEnd, 160);
    const list = [main];
    for (let i = 0; i < 3; i++) {
      const p = main[(rand(0.2, 0.7) * main.length) | 0];
      list.push(boltPath(p[0], p[1], p[0] + rand(-200, 200), p[1] + rand(80, 220), 60));
    }
    bolts.push({ paths: list, life: 0.35, age: 0 });
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    const keep = [];
    for (const p of parts) {
      if (p.kind === 'spark') {
        p.y += p.vy; p.tw += dt * 4;
        if (p.y < -10) { p.y = H + 10; p.x = rand(0, W); }
        ctx.globalAlpha = 0.35 + 0.35 * Math.sin(p.tw);
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
        keep.push(p);
      } else if (p.kind === 'conf') {
        p.age += dt;
        p.vy += 0.45; p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.age < p.life && p.y < H + 40) {
          ctx.globalAlpha = Math.min(1, (p.life - p.age) * 2);
          ctx.save();
          ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.scale(1, Math.cos(p.age * 9 + p.rot));
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
          keep.push(p);
        }
      } else if (p.kind === 'fw') {
        p.age += dt;
        p.px = p.x; p.py = p.y;
        p.vy += 0.06; p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        if (p.age < p.life) {
          ctx.globalAlpha = 1 - p.age / p.life;
          ctx.strokeStyle = p.c; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(p.px - p.vx * 2, p.py - p.vy * 2); ctx.lineTo(p.x, p.y); ctx.stroke();
          keep.push(p);
        }
      }
    }
    parts = keep;

    bolts = bolts.filter((b) => (b.age += dt) < b.life);
    for (const b of bolts) {
      const a = 1 - b.age / b.life;
      b.paths.forEach((path, i) => {
        ctx.globalAlpha = a * (Math.random() < 0.2 ? 0.3 : 1);
        ctx.shadowColor = '#b6ff00';
        ctx.shadowBlur = 25;
        ctx.strokeStyle = i === 0 ? '#d8ffb0' : '#7dff4a';
        ctx.lineWidth = i === 0 ? 4 : 2;
        ctx.beginPath();
        path.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = i === 0 ? 1.5 : 0.8;
        ctx.stroke();
      });
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Thỉnh thoảng có tia chớp ngẫu nhiên
  (function ambientBolt() {
    if (state.screen !== 'game' || Math.random() < 0.5) lightning();
    setTimeout(ambientBolt, rand(3500, 8000));
  })();

  function flash(kind) {
    el.flash.className = '';
    void el.flash.offsetWidth;
    el.flash.className = kind;
  }
  function stamp(text, kind) {
    el.stamp.className = 'stamp';
    el.stamp.textContent = text;
    void el.stamp.offsetWidth;
    el.stamp.className = 'stamp ' + kind;
  }
  function shake(node) {
    node.classList.remove('shake');
    void node.offsetWidth;
    node.classList.add('shake');
  }

  /* ================= CỘT SỐ ================= */
  function buildTower() {
    el.tube.innerHTML = '';
    const start = document.createElement('div');   // ô xuất phát (bậc 0)
    start.className = 'cell start';
    el.tube.appendChild(start);
    for (let i = 1; i <= LEVELS; i++) {
      const c = document.createElement('div');
      c.className = 'cell' + (i === LEVELS ? ' top' : '');
      c.textContent = i;
      el.tube.appendChild(c);
    }
  }
  function setLevel(lv, animate) {
    const prev = state.level;
    state.level = lv;
    el.tower.style.setProperty('--lvl', lv);
    el.tower.style.setProperty('--pos', lv + 0.5);
    [...el.tube.querySelectorAll('.cell:not(.start)')].forEach((c, i) => {
      c.classList.toggle('on', i < lv);
      if (animate && lv > prev && i === lv - 1) {
        c.classList.remove('just');
        void c.offsetWidth;
        c.classList.add('just');
      }
    });
  }
  function boostAvatar() {
    el.avatar.classList.add('boost');
    setTimeout(() => {
      el.avatar.classList.remove('boost');
      const r = el.avatar.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 120);
      sfx.pop();
    }, 1300);
  }

  /* Thu nhỏ chữ câu hỏi cho vừa thanh */
  function fitText() {
    const t = el.qText;
    let size = Math.min(56, el.qbar.clientHeight * 0.42);
    t.style.fontSize = size + 'px';
    while (size > 14 && (t.scrollHeight > t.clientHeight || t.scrollWidth > t.clientWidth)) {
      size -= 1;
      t.style.fontSize = size + 'px';
    }
  }
  addEventListener('resize', () => { if (state.screen === 'game') fitText(); });

  /* ================= TIẾN TRÌNH (CHẤM TRÒN) ================= */
  function buildDots() {
    el.dots.innerHTML = '';
    for (let i = 0; i < TOTAL; i++) {
      const d = document.createElement('div');
      d.className = 'dot';
      d.textContent = i + 1;
      el.dots.appendChild(d);
    }
  }
  function updateDots() {
    [...el.dots.children].forEach((d, i) => {
      const r = state.results[i];
      d.className = 'dot' + (r === true ? ' ok' : r === false ? ' no' : i === state.idx ? ' cur' : '');
      d.textContent = i + 1;
    });
  }

  /* ================= ĐỒNG HỒ ================= */
  function renderTimer() {
    const sec = Math.ceil(state.msLeft / 1000);
    el.timeText.textContent = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
    el.timer.classList.toggle('warn', state.msLeft > 0 && sec <= 3);
    el.timer.classList.toggle('running', !!state.timerId);
    el.timerBtn.textContent = state.timerId ? 'Dừng giờ' : 'Chạy giờ';
  }
  function startTimer() {
    if (state.judged || state.timerId || state.msLeft <= 0) return;
    let prev = performance.now();
    state.timerId = setInterval(() => {
      const now = performance.now();
      state.msLeft = Math.max(0, state.msLeft - (now - prev));
      prev = now;
      const sec = Math.ceil(state.msLeft / 1000);
      if (sec !== state.lastSec) {
        state.lastSec = sec;
        if (sec > 0 && sec <= 3) sfx.tickUrgent();
        else if (sec > 0) sfx.tick();
      }
      if (state.msLeft <= 0) timeUp();
      renderTimer();
    }, 50);
    renderTimer();
    updateButtons();
  }
  function stopTimer() {
    clearInterval(state.timerId);
    state.timerId = null;
    renderTimer();
  }
  function toggleTimer() {
    if (state.timerId) stopTimer(); else startTimer();
    updateButtons();
  }
  function timeUp() {
    stopTimer();
    el.timer.classList.remove('out');
    void el.timer.offsetWidth;
    el.timer.classList.add('out');
    sfx.timeout();
    flash('red');
    stamp('HẾT GIỜ!', 'time');
    updateButtons();
  }

  /* ================= LUỒNG GAME ================= */
  function showScreen(name) {
    state.screen = name;
    [el.intro, el.game, el.end].forEach((s) => s.classList.toggle('active', s.id === name));
  }

  function startGame() {
    audio.unlock();
    if (!TOTAL) { alert('Chưa có câu hỏi nào trong questions.js'); return; }
    state.name = el.name.value.trim() || 'Người chơi';
    state.idx = 0;
    state.results = [];
    el.playerLabel.textContent = state.name;
    el.qTotal.textContent = TOTAL;
    refreshAvatars();
    buildTower();
    buildDots();
    setLevel(0);
    showScreen('game');
    sfx.thunder();
    lightning(W * 0.3); lightning(W * 0.7);
    flash('white');
    loadQuestion();
  }

  function loadQuestion() {
    const q = QS[state.idx];
    state.judged = false;
    stopTimer();
    state.msLeft = CFG.timePerQuestion * 1000;
    state.lastSec = CFG.timePerQuestion;
    el.timer.classList.remove('out');

    el.qNum.textContent = state.idx + 1;
    el.qText.textContent = q.question;
    if (q.image) { el.qImg.src = q.image; el.qImg.hidden = false; } else { el.qImg.hidden = true; el.qImg.removeAttribute('src'); }
    el.aText.textContent = q.options ? LETTERS[q.correct] : q.answer;
    el.answer.classList.remove('show');


    clearTimeout(state.pickTimer);
    state.picked = null;
    el.options.innerHTML = '';
    (q.options || []).forEach((text, i) => {
      const o = document.createElement('div');
      o.className = 'opt';
      o.innerHTML = `<span class="key">${LETTERS[i]}</span><span class="otext"></span>`;
      o.querySelector('.otext').textContent = text;
      o.addEventListener('click', () => choose(i));
      el.options.appendChild(o);
    });

    el.qbar.classList.remove('enter');
    void el.qbar.offsetWidth;
    el.qbar.classList.add('enter');
    fitText();
    sfx.whoosh();
    lightning();

    renderTimer();
    updateDots();
    updateButtons();
    if (CFG.autoStartTimer) setTimeout(startTimer, 700);
  }

  /* Người chơi chốt đáp án → hồi hộp → công bố đúng/sai */
  function choose(i) {
    const q = QS[state.idx];
    if (state.screen !== 'game' || state.judged || state.picked !== null || !q.options || i >= q.options.length) return;
    state.picked = i;
    stopTimer();
    el.options.children[i].classList.add('picked');
    sfx.drumroll();
    updateButtons();
    state.pickTimer = setTimeout(() => judge(i === q.correct), 1600);
  }

  function markOptions() {
    const q = QS[state.idx];
    if (!q.options) return;
    [...el.options.children].forEach((o, i) => {
      o.classList.remove('picked');
      o.classList.toggle('right', i === q.correct);
      o.classList.toggle('wrong', i === state.picked && i !== q.correct);
      o.classList.toggle('dim', i !== q.correct && i !== state.picked);
    });
  }

  function revealAnswer() {
    markOptions();
    if (el.answer.classList.contains('show')) return;
    el.answer.classList.add('show');
    sfx.pop();
    const r = el.answer.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 60, ['#ffe600', '#b6ff00', '#ffffff']);
  }

  function judge(ok) {
    if (state.screen !== 'game' || state.judged) return;
    state.judged = true;
    clearTimeout(state.pickTimer);
    stopTimer();
    state.results[state.idx] = ok;
    revealAnswer();

    if (ok) {
      sfx.correct();
      sfx.rise();
      flash('green');
      stamp('CHÍNH XÁC!', 'ok');
      lightning(W * 0.15); lightning(W * 0.85);
      confetti(110, 0, H);
      confetti(110, W, H);
      setLevel(state.level + 1, true);
      boostAvatar();
    } else {
      sfx.wrong();
      flash('red');
      stamp('SAI RỒI!', 'no');
      shake(el.game);
      el.avatar.classList.remove('sad');
      void el.avatar.offsetWidth;
      el.avatar.classList.add('sad');
    }
    updateDots();
    updateButtons();
  }

  function undo() {
    if (state.screen !== 'game' || !(state.judged || state.picked !== null)) return;
    clearTimeout(state.pickTimer);
    if (state.judged && state.results[state.idx] === true) setLevel(state.level - 1, true);
    state.results[state.idx] = undefined;
    state.judged = false;
    state.picked = null;
    el.answer.classList.remove('show');
    [...el.options.children].forEach((o) => o.classList.remove('picked', 'right', 'wrong', 'dim'));
    updateDots();
    updateButtons();
  }

  function next() {
    if (state.screen !== 'game' || !state.judged) return;
    if (state.idx < TOTAL - 1) {
      state.idx++;
      loadQuestion();
    } else {
      endGame();
    }
  }

  function endGame() {
    stopTimer();
    showScreen('end');
    const lv = state.level;
    el.endName.textContent = state.name;
    el.endLevel.textContent = lv;
    el.endMsg.textContent =
      lv === LEVELS ? 'Hoàn hảo! Đã chạm đỉnh cột!' :
      lv >= 8 ? 'Xuất sắc! Nhanh như chớp thật sự!' :
      lv >= 5 ? 'Rất tốt! Đã leo khá cao!' :
      lv >= 1 ? 'Cố gắng lên, lần sau sẽ cao hơn!' :
      'Vẫn chưa leo được bậc nào, thử lại nhé!';
    sfx.win();
    flash('white');
    confetti(150, 0, H);
    confetti(150, W, H);
    let n = 0;
    const fw = setInterval(() => {
      burst(rand(W * 0.1, W * 0.9), rand(H * 0.1, H * 0.5), 100);
      if (n % 2 === 0) lightning();
      if (++n >= (lv >= 5 ? 14 : 6) || state.screen !== 'end') clearInterval(fw);
    }, 450);
  }

  function updateButtons() {
    const j = state.judged;
    el.timerBtn.disabled = j || state.msLeft <= 0;
    el.revealBtn.disabled = el.answer.classList.contains('show');
    el.correctBtn.disabled = j;
    el.wrongBtn.disabled = j;
    el.undoBtn.disabled = !j && state.picked === null;
    el.nextBtn.disabled = !j;
    el.nextBtn.textContent = state.idx === TOTAL - 1 ? 'Kết thúc' : 'Câu tiếp';
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  }

  /* ================= SỰ KIỆN ================= */
  el.startBtn.addEventListener('click', startGame);
  el.replayBtn.addEventListener('click', () => { audio.unlock(); showScreen('intro'); el.name.focus(); });
  el.timerBtn.addEventListener('click', toggleTimer);
  el.revealBtn.addEventListener('click', () => { revealAnswer(); updateButtons(); });
  el.correctBtn.addEventListener('click', () => judge(true));
  el.wrongBtn.addEventListener('click', () => judge(false));
  el.undoBtn.addEventListener('click', undo);
  el.nextBtn.addEventListener('click', next);
  el.controls.addEventListener('click', (e) => e.target.closest('button')?.blur());

  document.addEventListener('keydown', (e) => {
    audio.unlock();
    if (e.target === el.name) {
      if (e.key === 'Enter') startGame();
      return;
    }
    const k = e.key.toLowerCase();
    if (k === 'f') return toggleFullscreen();
    if (state.screen === 'intro' && e.key === 'Enter') return startGame();
    if (state.screen === 'end' && e.key === 'Enter') return showScreen('intro');
    if (state.screen !== 'game') return;
    if (e.code === 'Space') { e.preventDefault(); toggleTimer(); }
    else if (/^[1-4]$/.test(e.key)) choose(Number(e.key) - 1);
    else if (k === 'a') { revealAnswer(); updateButtons(); }
    else if (k === 'd') judge(true);
    else if (k === 's') judge(false);
    else if (k === 'z') undo();
    else if (k === 'n' || e.key === 'ArrowRight') next();
    else if (k === 'h') el.controls.classList.toggle('hidden');
  });

  el.name.focus();
})();
