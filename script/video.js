document.addEventListener('DOMContentLoaded', () => {
  const v = document.getElementById('bgVideo');
  if (!v) return;

  // 1) Asegurar muted como propiedad y atributo (iOS es quisquilloso)
  v.muted = true;
  v.setAttribute('muted', '');

  // 2) Intentar reproducir
  const tryPlay = () => v.play().catch(() => {});

  // 3) Autoplay inicial
  tryPlay();

  // 4) Fallback: si el autoplay no arranca, primer tap/click lo inicia
  const kickstart = () => { v.muted = true; tryPlay(); cleanup(); };
  const cleanup = () => {
    window.removeEventListener('touchstart', kickstart);
    window.removeEventListener('click', kickstart);
  };
  window.addEventListener('touchstart', kickstart, { once: true });
  window.addEventListener('click', kickstart, { once: true });

  // 5) Loop robusto (algunos iOS ignoran loop una vez)
  v.addEventListener('ended', () => {
    try {
      v.currentTime = 0;
      tryPlay();
    } catch (_) {}
  });

  // 6) Si vuelves a la pestaña, reintenta play
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && v.paused) tryPlay();
  });

  // 7) Respeta “reducir movimiento”
  const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const handleMotion = () => {
    if (!mq) return;
    if (mq.matches) { v.pause(); }
    else { tryPlay(); }
  };
  if (mq) {
    mq.addEventListener?.('change', handleMotion);
    handleMotion();
  }
});
