document.addEventListener('DOMContentLoaded', () => {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  const scoreEl = $('#score');
  const livesEl = $('#lives');
  const levelEl = $('#level');

  const state = { score: 0, lives: 3, levelIdx: 0, correctStreak: 0 };

  function setHUD() {
    if (scoreEl) scoreEl.textContent = String(state.score);
    if (livesEl) livesEl.textContent = String(state.lives);
    if (levelEl) levelEl.textContent = LEVELS[state.levelIdx].name;
  }
  function showSection(id) {
    $$('.section').forEach(s => s.classList.add('hidden'));
    $(id)?.classList.remove('hidden');
  }
  function gameOver() {
    alert('¡PERDISTE CADETE, 22 DE PECHO!!!!!');
    state.score = 0; state.lives = 3; state.levelIdx = 0; state.correctStreak = 0;
    setHUD(); showSection('#menu');
  }
  function onCorrect(points = 1) {
    state.score += points;
    state.correctStreak++;
    if (state.correctStreak >= 5) {
      state.correctStreak = 0;
      if (state.levelIdx < LEVELS.length - 1) {
        state.levelIdx++;
        alert(`¡Eso cadete! Subiste a ${LEVELS[state.levelIdx].name}`);
      }
    }
    setHUD();
  }
  function onWrong() {
    state.lives -= 1;
    if (state.lives <= 0) { gameOver(); return true; }
    setHUD(); return false;
  }

  // ====== Niveles ======
  const LEVELS = [
    {
      name: 'A1.0', words: [
        ['red', 'rojo'], ['blue', 'azul'], ['green', 'verde'], ['yellow', 'amarillo'],
        ['cat', 'gato'], ['dog', 'perro'], ['bird', 'pájaro'], ['fish', 'pez'],
        ['book', 'libro'], ['pen', 'bolígrafo'], ['table', 'mesa'], ['door', 'puerta']
      ]
    },
    {
      name: 'A1.1', words: [
        ['apple', 'manzana'], ['house', 'casa'], ['car', 'carro'], ['school', 'escuela'],
        ['chair', 'silla'], ['bag', 'bolso'], ['milk', 'leche'], ['water', 'agua'],
        ['sun', 'sol'], ['rain', 'lluvia'], ['wind', 'viento'], ['snow', 'nieve']
      ]
    },
    {
      name: 'A1.2', words: [
        ['family', 'familia'], ['mother', 'madre'], ['father', 'padre'], ['brother', 'hermano'],
        ['sister', 'hermana'], ['baby', 'bebé'], ['child', 'niño'], ['friend', 'amigo'],
        ['happy', 'feliz'], ['sad', 'triste'], ['big', 'grande'], ['small', 'pequeño']
      ]
    },
    {
      name: 'A1.3', words: [
        ['teacher', 'profesor'], ['student', 'estudiante'], ['classroom', 'salón'],
        ['window', 'ventana'], ['floor', 'piso'], ['ceiling', 'techo'], ['board', 'pizarra'],
        ['phone', 'teléfono'], ['music', 'música'], ['game', 'juego'], ['ball', 'pelota'], ['toy', 'juguete']
      ]
    },
    {
      name: 'A1.4', words: [
        ['shirt', 'camisa'], ['pants', 'pantalón'], ['shoe', 'zapato'], ['dress', 'vestido'],
        ['hat', 'sombrero'], ['jacket', 'chaqueta'], ['sock', 'media'], ['skirt', 'falda'],
        ['coat', 'abrigo'], ['belt', 'cinturón'], ['boots', 'botas'], ['sweater', 'suéter']
      ]
    },
    {
      name: 'A1.5', words: [
        ['head', 'cabeza'], ['hand', 'mano'], ['arm', 'brazo'], ['leg', 'pierna'],
        ['foot', 'pie'], ['eye', 'ojo'], ['nose', 'nariz'], ['mouth', 'boca'],
        ['ear', 'oreja'], ['hair', 'cabello'], ['finger', 'dedo'], ['knee', 'rodilla']
      ]
    },
    {
      name: 'A2.1', words: [
        ['market', 'mercado'], ['park', 'parque'], ['street', 'calle'], ['city', 'ciudad'],
        ['bank', 'banco'], ['library', 'biblioteca'], ['post office', 'oficina de correos'], ['store', 'tienda'],
        ['bridge', 'puente'], ['river', 'río'], ['square', 'plaza'], ['museum', 'museo']
      ]
    },
    {
      name: 'A2.2', words: [
        ['kitchen', 'cocina'], ['bedroom', 'dormitorio'], ['bathroom', 'baño'], ['living room', 'sala'],
        ['table', 'mesa'], ['chair', 'silla'], ['sofa', 'sofá'], ['bed', 'cama'],
        ['fridge', 'nevera'], ['stove', 'estufa'], ['mirror', 'espejo'], ['shower', 'ducha']
      ]
    },
    {
      name: 'A2.3', words: [
        ['train', 'tren'], ['bus', 'bus'], ['ticket', 'boleto'], ['station', 'estación'],
        ['airport', 'aeropuerto'], ['plane', 'avión'], ['taxi', 'taxi'], ['bicycle', 'bicicleta'],
        ['map', 'mapa'], ['hotel', 'hotel'], ['passport', 'pasaporte'], ['luggage', 'equipaje']
      ]
    },
    {
      name: 'A2.4', words: [
        ['doctor', 'médico'], ['nurse', 'enfermera'], ['hospital', 'hospital'], ['medicine', 'medicina'],
        ['football', 'fútbol'], ['basketball', 'baloncesto'], ['swim', 'nadar'], ['run', 'correr'],
        ['computer', 'computador'], ['keyboard', 'teclado'], ['mouse', 'ratón'], ['screen', 'pantalla']
      ]
    },
    {
      name: 'A2.5', words: [
        ['yesterday', 'ayer'], ['tomorrow', 'mañana (día)'], ['afternoon', 'tarde'], ['evening', 'tarde-noche'],
        ['weekend', 'fin de semana'], ['sometimes', 'a veces'], ['always', 'siempre'], ['never', 'nunca'],
        ['restaurant', 'restaurante'], ['menu', 'menú'], ['waiter', 'mesero'], ['bill', 'cuenta']
      ]
    },
  ];

  async function getDistractorsLike(word, n = 3) {
    try {
      const res = await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=50`, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP');
      const data = await res.json();
      const list = data
        .map(x => String(x.word).toLowerCase())
        .filter(w => /^[a-z- ]+$/.test(w) && w.length >= 3 && w.length <= 12 && w !== word);
      shuffle(list);
      const easy = list.filter(w => w.length <= 7);
      return (easy.length >= n ? easy : list).slice(0, n);
    } catch {
      const pool = LEVELS[state.levelIdx].words.map(([en]) => en).filter(w => w !== word);
      shuffle(pool); return pool.slice(0, n);
    }
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function pickFromLevel(k = 1) { const arr = LEVELS[state.levelIdx].words.slice(); shuffle(arr); return arr.slice(0, k); }

  // ====== Quiz ======
  const quiz = (() => {
    const box = $('#quizBox');
    const nextBtn = $('#quizNext');
    let current = null;

    async function next() {
      box.innerHTML = '';
      const [[en, es]] = pickFromLevel(1);
      let options = [en, ...(await getDistractorsLike(en, 3))];
      options = Array.from(new Set(options));
      while (options.length < 4) {
        const extra = pickFromLevel(1)[0][0];
        if (!options.includes(extra) && extra !== en) options.push(extra);
      }
      shuffle(options);
      current = { es, en, options };

      const h = document.createElement('h3'); h.textContent = `¿Cómo se dice “${es}” en inglés?`;
      const opts = document.createElement('div'); opts.className = 'quizOptions';

      options.forEach(opt => {
        const b = document.createElement('button');
        b.className = 'quizOpt'; b.textContent = opt;
        b.addEventListener('click', () => {
          $$('#quizBox .quizOpt').forEach(x => x.disabled = true);
          if (opt === current.en) { b.classList.add('ok'); onCorrect(2); }
          else {
            b.classList.add('bad');
            $$('#quizBox .quizOpt').forEach(x => { if (x.textContent === current.en) x.classList.add('ok'); });
            if (onWrong()) return;
          }
          nextBtn.disabled = false;
        });
        opts.appendChild(b);
      });

      box.appendChild(h); box.appendChild(opts);
      nextBtn.disabled = true;
    }

    nextBtn?.addEventListener('click', next);
    async function start() { await next(); }
    return { start };
  })();

  // ====== Memoria ======
  const memory = (() => {
    const board = document.getElementById('memoryBoard');
    const restartBtn = document.getElementById('memoryRestart');
    let first = null, lock = false, pairsLeft = 0, previewTimer = null;

    function render(deck) {
      board.innerHTML = '';
      deck.forEach((c, i) => {
        const btn = document.createElement('button');
        btn.className = 'memory-card';
        btn.dataset.key = c.key;
        btn.dataset.idx = String(i);
        btn.dataset.label = c.label;
        btn.textContent = '???';
        btn.addEventListener('click', () => flip(btn));
        board.appendChild(btn);
      });
    }

    function showPreview(ms = 2000) {
      const cards = Array.from(board.querySelectorAll('.memory-card'));
      cards.forEach(b => { b.classList.add('flipped'); b.textContent = b.dataset.label; });
      clearTimeout(previewTimer);
      previewTimer = setTimeout(() => {
        cards.forEach(b => { b.classList.remove('flipped'); b.textContent = '???'; });
      }, ms);
    }

    function flip(btn) {
      if (lock || btn.classList.contains('matched') || btn.classList.contains('flipped')) return;

      btn.classList.add('flipped');
      btn.textContent = btn.dataset.label;

      if (!first) { first = btn; return; }

      lock = true;
      const isMatch = first.dataset.key === btn.dataset.key && first !== btn;

      setTimeout(() => {
        if (isMatch) {
          first.classList.add('matched'); btn.classList.add('matched');
          first.disabled = true; btn.disabled = true;
          pairsLeft--; onCorrect(1);
          if (pairsLeft === 0) {
            alert('¡Excelente cadete! Completaste todas las parejas, ahora a darle 10 vueltas a la cancha.');
            showSection('#menu');
          }
        } else {
          first.classList.remove('flipped'); btn.classList.remove('flipped');
          first.textContent = '???'; btn.textContent = '???';
          if (onWrong()) { first = null; lock = false; return; }
        }
        first = null; lock = false;
      }, 450);
    }

    function isSmallPhone() {
      return Math.min(window.innerWidth, window.innerHeight) <= 420;
    }

    async function start() {
      const PAIRS = isSmallPhone() ? 4 : 6;
      const pairs = pickFromLevel(PAIRS);
      const chosen = pairs.length >= PAIRS ? pairs.slice(0, PAIRS) : pairs;
      pairsLeft = chosen.length;

      const deck = [];
      chosen.forEach(([en, es]) => {
        deck.push({ key: en, label: en });
        deck.push({ key: en, label: es });
      });
      shuffle(deck);

      first = null; lock = false;
      render(deck);
      showPreview(isSmallPhone() ? 2500 : 1800);
      setHUD();
    }

    restartBtn?.addEventListener('click', start);
    return { start };
  })();

  // ====== Ahorcado ======
  const hangman = (() => {
    const wordEl = $('#hangmanWord');
    const triesEl = $('#tries');
    const inputEl = $('#guessInput');
    const btnEl = $('#guessBtn');
    const restart = $('#hangmanRestart');

    let hintEl = $('#hangmanHint');
    if (!hintEl) {
      hintEl = document.createElement('div');
      hintEl.id = 'hangmanHint';
      hintEl.style.margin = '8px 0';
      $('#hangman')?.insertBefore(hintEl, wordEl);
    }

    let secret = '', shown = [], tries = 6;

    function draw() { wordEl.textContent = shown.join(' '); triesEl.textContent = String(tries); }
    function chooseFromLevel() { const [[en, es]] = pickFromLevel(1); return { en, es }; }

    async function start() {
      const { en, es } = chooseFromLevel();
      secret = en.toLowerCase();
      shown = secret.split('').map(() => '_');
      tries = 6;
      hintEl.textContent = `Pista: ${es}`;
      draw();
    }

    function guess() {
      const c = (inputEl.value || '').toLowerCase();
      inputEl.value = '';
      if (!c || c.length !== 1 || !/^[a-z]$/.test(c)) return;

      let ok = false;
      for (let i = 0; i < secret.length; i++) {
        if (secret[i] === c) { shown[i] = c; ok = true; }
      }

      if (!ok) {
        tries--;
        if (tries <= 0) {
          if (onWrong()) return;
          return start();
        }
      } else if (shown.join('') === secret) {
        onCorrect(2);
        alert('¡Muy bien Cadete! Palabra completada.');
        return showSection('#menu');
      }
      draw();
    }

    btnEl?.addEventListener('click', guess);
    inputEl?.addEventListener('keyup', e => { if (e.key === 'Enter') guess(); });
    restart?.addEventListener('click', start);

    return { start };
  })();

  // ====== Completar ======
  const fillin = (() => {
    const box = $('#fillinBox');
    const checkBtn = $('#fillinCheck');
    const nextBtn = $('#fillinNext');
    let current = null;
    let answered = false;

    function templatesFor(en) {
      const colors = ['red', 'blue', 'green', 'yellow'];
      if (colors.includes(en)) {
        return [`The ball is ___ .`, `The door is ___ .`, `This apple is ___ .`];
      }
      return [`This is my ___ .`, `I have a ___ .`, `Open the ___ .`];
    }

    async function next() {
      answered = false;
      box.innerHTML = '';
      const [[en]] = pickFromLevel(1);
      const tpls = templatesFor(en);
      const tpl = tpls[Math.floor(Math.random() * tpls.length)];
      const sentenceMasked = tpl.replace('___', '_____');

      let options = [en, ...(await getDistractorsLike(en, 3))];
      options = Array.from(new Set(options)).slice(0, 4);
      while (options.length < 4) {
        const extra = pickFromLevel(1)[0][0];
        if (!options.includes(extra) && extra !== en) options.push(extra);
      }
      shuffle(options);

      current = { sentenceMasked, answer: en, options };

      const s = document.createElement('div'); s.className = 'fillin-quote'; s.textContent = sentenceMasked;
      const opts = document.createElement('div'); opts.className = 'fillin-options';
      options.forEach(opt => {
        const b = document.createElement('button');
        b.className = 'fillinOpt'; b.textContent = opt;
        b.addEventListener('click', () => {
          $$('.fillinOpt').forEach(x => x.classList.remove('selected'));
          b.classList.add('selected');
          checkBtn.disabled = false;
        });
        opts.appendChild(b);
      });

      box.appendChild(s); box.appendChild(opts);
      checkBtn.disabled = true; nextBtn.disabled = true;
    }

    function check() {
      if (answered) return;
      const sel = box.querySelector('.fillinOpt.selected');
      if (!sel) return;
      answered = true;

      const chosen = sel.textContent;
      $$('.fillinOpt').forEach(b => b.disabled = true);
      if (chosen === current.answer) { sel.classList.add('ok'); onCorrect(2); }
      else { sel.classList.add('bad'); if (onWrong()) return; }
      nextBtn.disabled = false;
    }

    checkBtn?.addEventListener('click', check);
    nextBtn?.addEventListener('click', next);

    async function start() { await next(); }
    return { start };
  })();

  // ====== Videos por juego ======
  function showGameVideo(which) {
    document.querySelectorAll('.game-video').forEach(v => {
      v.classList.add('hidden');
      try { v.pause(); } catch {}
    });
    const vid = document.getElementById(which + 'Video');
    if (vid) {
      vid.classList.remove('hidden');
      try { vid.currentTime = 0; vid.play(); } catch {}
    } else {
      console.warn('No se encontró el video para:', which);
    }
  }

  // ====== Navegación principal ======
  $$('#menu [data-start]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const which = e.currentTarget.getAttribute('data-start');

      // Mostrar video correspondiente al juego seleccionado
      showGameVideo(which);

      if (which === 'quiz')   { showSection('#quiz');   await quiz.start(); }
      if (which === 'memory') { showSection('#memory'); await memory.start(); }
      if (which === 'hangman'){ showSection('#hangman');await hangman.start(); }
      if (which === 'fillin') { showSection('#fillin'); await fillin.start(); }
    });
  });

  $$('.section [data-back]').forEach(btn => btn.addEventListener('click', () => showSection('#menu')));

  $('#resetAll')?.addEventListener('click', () => {
    state.score = 0; state.lives = 3; state.levelIdx = 0; state.correctStreak = 0;
    setHUD(); showSection('#menu');
  });

  // Inicial
  setHUD();
  showSection('#menu');
});
