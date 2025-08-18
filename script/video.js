document.addEventListener('DOMContentLoaded', () => {
  const v = document.getElementById('bgVideo');
  if (!v) return;
  v.muted = true;
  v.setAttribute('muted', '');
  const tryPlay = () => v.play().catch(() => {});
  tryPlay();
  const kickstart = () => { v.muted = true; tryPlay(); cleanup(); };
  const cleanup = () => {
    window.removeEventListener('touchstart', kickstart);
    window.removeEventListener('click', kickstart);
  };
  window.addEventListener('touchstart', kickstart, { once: true });
  window.addEventListener('click', kickstart, { once: true });
  v.addEventListener('ended', () => {
    try {
      v.currentTime = 0;
      tryPlay();
    } catch (_) {}
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && v.paused) tryPlay();
  });
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
