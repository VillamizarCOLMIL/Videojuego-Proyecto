document.addEventListener('DOMContentLoaded', () => {
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const state = { score: 0, lives: 3, level: 1 };
  const scoreEl = $('#score');
  const livesEl = $('#lives');
  const levelEl = $('#level');
  const setHUD = () => {
    if (scoreEl) scoreEl.textContent = String(state.score);
    if (livesEl) livesEl.textContent = String(state.lives);
    if (levelEl) levelEl.textContent = String(state.level);
  };
  const showSection = (id) => {
    $$('.section').forEach(s => s.classList.add('hidden'));
    $(id)?.classList.remove('hidden');
  };


  async function getJSON(url, retries = 2) {
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (e) {
        if (i === retries) throw e;
        await new Promise(r => setTimeout(r, 400 * (i + 1)));
      }
    }
  }
  const getUsedSet = (key) => new Set(JSON.parse(localStorage.getItem(key) || '[]'));
  const saveUsedSet = (key, set) => localStorage.setItem(key, JSON.stringify(Array.from(set)));

  // ----- Navegación del menú -----
  $$('#menu [data-start]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const which = e.currentTarget.getAttribute('data-start');
      if (which === 'hangman') {
        showSection('#hangman');
        await hangman.start();
      } else if (which === 'quiz') {
        showSection('#quiz');
        await quiz.start();
      } else if (which === 'memory') {
        showSection('#memory');
        await memory.start();
      } else if (which === 'fillin') {
        showSection('#fillin');
        await fillin.start();
      }
    });
  });

  $$('.section [data-back]').forEach(btn => {
    btn.addEventListener('click', () => showSection('#menu'));
  });

  $('#resetAll')?.addEventListener('click', () => {
    state.score = 0; state.lives = 3; state.level = 1;
    setHUD(); showSection('#menu');

  });


  const decodeHTML = (str) => {
    const t = document.createElement('textarea');
    t.innerHTML = str;
    return t.value;
  };


  const WORD_POOL = (function () {
    const API = 'https://random-word-api.herokuapp.com/word';
    const USED_KEY = 'rw_used_v1';
    const BATCH_SIZE = 100, WORD_MIN = 3, WORD_MAX = 12, MAX_USED = 5000;
    let cola = [];
    let usadas = new Set(JSON.parse(localStorage.getItem(USED_KEY) || '[]'));

    function persist() {
      if (usadas.size > MAX_USED) {
        usadas = new Set(Array.from(usadas).slice(Math.floor(usadas.size * 0.3)));
      }
      localStorage.setItem(USED_KEY, JSON.stringify(Array.from(usadas)));
    }

    async function fetchLote(opts = {}) {
      const params = new URLSearchParams();
      params.set('number', opts.number || BATCH_SIZE);
      if (opts.length) params.set('length', String(opts.length));
      let words = [];
      try {
        words = await getJSON(`${API}?${params.toString()}`);
      } catch {
        words = ['alpha','bravo','charlie','delta','echo','foxtrot','golf','hotel','india'];
      }
      words = words
        .map(w => String(w).toLowerCase())
        .filter(w => /^[a-z]+$/.test(w) && w.length >= WORD_MIN && w.length <= WORD_MAX)
        .filter(w => !usadas.has(w));
      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
      }
      cola.push(...words);
    }

    async function next(opts = {}) {
      while (cola.length === 0) {
        await fetchLote(opts);
        if (cola.length === 0) { usadas = new Set(); persist(); }
      }
      const w = cola.pop();
      usadas.add(w); persist();
      return w;
    }

    function resetHistory() { usadas = new Set(); persist(); cola = []; }

    return { next, resetHistory };
  })();

  const hangman = (function () {
    let secret = '', shown = [], tries = 6;
    const wordEl = $('#hangmanWord');
    const triesEl = $('#tries');
    const inputEl = $('#guessInput');
    const guessBtn = $('#guessBtn');
    const restartBtn = $('#hangmanRestart');

    const draw = () => {
      if (wordEl) wordEl.textContent = shown.join(' ');
      if (triesEl) triesEl.textContent = String(tries);
    };

    async function start() {
      secret = await WORD_POOL.next(); // puedes usar { length: 5 } para dificultad
      shown = secret.split('').map(() => '_');
      tries = 6;
      draw();
    }

    function guess() {
      const c = (inputEl?.value || '').toLowerCase();
      if (inputEl) inputEl.value = '';
      if (!c || c.length !== 1 || !/^[a-z]$/.test(c)) return;

      let ok = false;
      for (let i = 0; i < secret.length; i++) {
        if (secret[i] === c) { shown[i] = c; ok = true; }
      }

      if (!ok) {
        tries--;
        if (tries <= 0) {
          state.lives -= 1; setHUD();
          if (state.lives <= 0) { alert('Game Over'); showSection('#menu'); return; }
          start(); return;
        }
      } else if (shown.join('') === secret) {
        state.score += 5; state.level += 1; setHUD(); showSection('#menu'); return;
      }
      draw();
    }

    guessBtn?.addEventListener('click', guess);
    inputEl?.addEventListener('keyup', e => { if (e.key === 'Enter') guess(); });
    restartBtn?.addEventListener('click', start);

    return { start, resetHistory: WORD_POOL.resetHistory };
  })();