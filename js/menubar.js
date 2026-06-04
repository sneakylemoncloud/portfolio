(function () {
  // —— Clock, always shown in IST so the OS has a consistent "home" timezone ——
  const clock = document.getElementById("menubar-clock");

  function tick() {
    if (!clock) return;
    const now = new Date();
    // Shift to IST (UTC+5:30) regardless of the viewer's local zone.
    const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
    let h = ist.getHours();
    const m = ist.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    clock.textContent = `${h}:${String(m).padStart(2, "0")} ${ampm} IST`;
  }

  tick();
  setInterval(tick, 15000);

  // —— Sound toggle — mutes the whole OS via a body class sounds.js reads ——
  const soundBtn = document.querySelector("[data-sound-toggle]");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      const muted = document.body.classList.toggle("is-muted");
      soundBtn.setAttribute("aria-pressed", String(!muted));
      const icon = soundBtn.querySelector(".menubar__sound-icon");
      if (icon) icon.textContent = muted ? "·" : "♪";
    });
  }
})();
