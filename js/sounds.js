(function () {
  const SOUND_URL = "assets/sounds/key-press.mp3";
  const VOLUME = 0.45;
  // .folder-item already matches the Not Work <a> links (they carry both classes).
  const PRESSABLE = "button, .folder-item";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function playKeyPress() {
    if (reducedMotion.matches) return;
    if (document.body.classList.contains("is-muted")) return;

    const audio = new Audio(SOUND_URL);
    // Detune each press a touch so a run of clicks never sounds mechanical/looped.
    audio.preservesPitch = false;
    audio.mozPreservesPitch = false;
    audio.webkitPreservesPitch = false;
    audio.playbackRate = 0.92 + Math.random() * 0.16;
    audio.volume = VOLUME * (0.85 + Math.random() * 0.15);
    audio.play().catch(() => {});
  }

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0) return;
      if (!event.target.closest(PRESSABLE)) return;
      playKeyPress();
      // Tiny haptic tick on supporting devices — reinforces the "real key" feel.
      if (navigator.vibrate) navigator.vibrate(8);
    },
    { passive: true }
  );
})();
