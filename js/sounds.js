(function () {
  const PRESSABLE = "button, .folder-item";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function silenced() {
    return reducedMotion.matches || document.body.classList.contains("is-muted");
  }

  // Shared Web Audio context for the synthesized press tick + window-open chime.
  let audioCtx = null;
  function getCtx() {
    if (audioCtx) return audioCtx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
    return audioCtx;
  }

  // —— Press: a soft, short, pitch-varied tick. Quiet enough to sit under the
  //    chime/tuck; the little downward pitch makes it feel tactile. ——
  function playTick() {
    if (silenced()) return;
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const base = 220 * (0.9 + Math.random() * 0.2);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(base * 1.7, now);
    osc.frequency.exponentialRampToValueAtTime(base, now + 0.03);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // —— Window close: a soft "whoosh" — filtered noise whose band sweeps
  //    downward as it fades, so the window feels sucked down into its icon
  //    and vanishes. ——
  function windowCloseSound() {
    if (silenced()) return;
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const dur = 0.32;

    // a short burst of white noise
    const buffer = ctx.createBuffer(
      1,
      Math.ceil(ctx.sampleRate * dur),
      ctx.sampleRate
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // band-pass sweeping high -> low = the descending "vanish"
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + dur);

    // quick swell, then fade to nothing (the disappearing tail)
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + dur + 0.02);
  }

  // —— Window open: a soft rising perfect fifth (D5 -> A5), synthesized ——
  function windowOpenChime() {
    if (silenced()) return;
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    [{ f: 587.33, t: 0 }, { f: 880.0, t: 0.07 }].forEach(({ f, t }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = f;
      const start = now + t;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.16, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.28);
    });
  }

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0) return;
      if (!event.target.closest(PRESSABLE)) return;
      playTick();
      // Tiny haptic tick on supporting devices — reinforces the "real key" feel.
      if (navigator.vibrate) navigator.vibrate(8);
    },
    { passive: true }
  );

  document.addEventListener("lemonade:windowopen", windowOpenChime);
  document.addEventListener("lemonade:windowclose", windowCloseSound);
})();
