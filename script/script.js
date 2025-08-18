
document.addEventListener('DOMContentLoaded', () => {
  const $  = s => document.querySelector(s);
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
    alert('¡PERDISTE CADETE VUELVE A INTERNARLO, 22 DE PECHO');
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
        alert(`¡Súper! Subiste a ${LEVELS[state.levelIdx].name}`);
      }
    }
    setHUD();
  }
  function onWrong() {
    state.lives -= 1;
    if (state.lives <= 0) { gameOver(); return true; }
    setHUD(); return false;
  }


  $$('#menu [data-start]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const which = e.currentTarget.getAttribute('data-start');
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