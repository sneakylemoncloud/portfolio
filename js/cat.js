(function () {
  const walker = document.querySelector(".cat-walker");
  const stage = document.querySelector(".cat-stage");

  if (!walker || !stage) return;

  const moods = {
    walk: { row: 38, frames: 4, interval: 230 },
    run: { row: 47, frames: 8, interval: 78 },
    pause: { row: 0, frames: 8, interval: 260 },
    sit: { row: 14, frames: 4, interval: 240 },
    loaf: { row: 10, frames: 8, interval: 260 },
    sniff: { row: 24, frames: 4, interval: 190 },
    stretch: { row: 21, frames: 4, interval: 210 },
  };

  let x = 0;
  let frame = 0;
  let mood = "pause";
  let facing = 1;
  let targetX = 0;
  let lastFrameTime = 0;
  let nextLoiterAt = 0;
  let loiterQueue = [];
  let introActive = true;
  let rafId = 0;

  function stageWidth() {
    return Math.max(stage.clientWidth - walker.clientWidth, 1);
  }

  function randomStop() {
    const width = stageWidth();
    const rightSide = 0.76 + Math.random() * 0.17;
    const leftSide = 0.07 + Math.random() * 0.17;
    return Math.round(width * (x < width / 2 ? rightSide : leftSide));
  }

  function setSprite(nextMood) {
    mood = nextMood;
    frame = 0;
    [walker, stage].forEach((element) => {
      element.classList.toggle("is-paused", mood === "pause");
      element.classList.toggle("is-stretching", mood === "stretch");
      element.classList.toggle("is-walking", mood === "walk");
      element.classList.toggle("is-running", mood === "run");
      element.classList.toggle("is-loitering", mood !== "walk" && mood !== "run");
      element.classList.toggle("is-entering", introActive);
    });
    stage.style.setProperty("--cat-row", moods[mood].row);
    stage.style.setProperty("--cat-frame", frame);
  }

  function draw(lift = 0) {
    stage.style.setProperty("--cat-x", `${Math.round(x)}px`);
    stage.style.setProperty("--cat-facing", facing);
    stage.style.setProperty("--cat-frame", frame);
    stage.style.setProperty("--cat-lift", `${lift}px`);
  }

  function pickNewDestination(now) {
    loiterQueue = [];
    targetX = randomStop();

    if (Math.abs(targetX - x) < 120) {
      targetX = targetX > stageWidth() / 2 ? Math.round(stageWidth() * 0.12) : Math.round(stageWidth() * 0.88);
    }

    facing = targetX > x ? 1 : -1;
    setSprite(facing === 1 ? "walk" : "run");
    lastFrameTime = now;
  }

  function chooseLoiterQueue() {
    if (introActive) {
      return ["sit", "sniff", "pause"];
    }

    const longRest = Math.random() > 0.58;
    const justRan = mood === "run";

    if (justRan) {
      return longRest ? ["stretch", "sit", "pause"] : ["stretch", "sniff"];
    }

    if (longRest) {
      return Math.random() > 0.5 ? ["sniff", "loaf", "sit"] : ["sit", "pause", "sniff"];
    }

    return Math.random() > 0.5 ? ["sit", "sniff"] : ["pause", "stretch"];
  }

  function loiterDuration(nextMood) {
    const baseDurations = {
      pause: 950,
      sit: 1300,
      loaf: 2200,
      sniff: 900,
      stretch: 1050,
    };

    return baseDurations[nextMood] + Math.random() * 650;
  }

  function continueLoiter(now) {
    const nextMood = loiterQueue.shift();

    if (!nextMood) {
      pickNewDestination(now);
      return;
    }

    setSprite(nextMood);
    nextLoiterAt = now + loiterDuration(nextMood);
  }

  function arrive(now) {
    x = targetX;
    draw(0);
    const finishedIntro = introActive;
    introActive = false;
    loiterQueue = finishedIntro ? ["sit", "sniff", "pause"] : chooseLoiterQueue();
    continueLoiter(now);
  }

  function tick(now) {
    const currentMood = moods[mood];

    if (now - lastFrameTime >= currentMood.interval) {
      lastFrameTime = now;
      frame = (frame + 1) % currentMood.frames;

      if (mood === "walk" || mood === "run") {
        const remaining = targetX - x;
        const direction = Math.sign(remaining);
        const stride = mood === "run"
          ? 13 + (frame === 1 || frame === 4 || frame === 6 ? 6 : 0)
          : 5 + (frame === 1 || frame === 3 ? 2 : 0);
        const step = Math.min(Math.abs(remaining), stride);
        x += direction * step;

        if (Math.abs(targetX - x) <= stride) {
          arrive(now);
        } else {
          const lift = mood === "run"
            ? (frame === 1 || frame === 5 ? -3 : frame === 3 || frame === 7 ? -1 : 0)
            : (frame === 1 || frame === 3 ? -1 : 0);
          draw(lift);
        }
      } else {
        draw(0);
      }
    }

    if (mood !== "walk" && mood !== "run" && now >= nextLoiterAt) {
      continueLoiter(now);
    }

    rafId = requestAnimationFrame(tick);
  }

  function placeInitialCat() {
    x = -walker.clientWidth;
    targetX = Math.round(stageWidth() * 0.18);
    facing = 1;
    introActive = true;
    setSprite("walk");
    draw(0);
    lastFrameTime = performance.now() + 360;
    nextLoiterAt = Number.POSITIVE_INFINITY;
  }

  function start() {
    placeInitialCat();
    rafId = requestAnimationFrame(tick);
  }

  function showStaticCat() {
    introActive = false;
    x = Math.round(stageWidth() * 0.2);
    facing = 1;
    setSprite("sit");
    draw(0);
    stage.classList.add("is-loitering");
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    showStaticCat();
  } else {
    start();
  }

  window.addEventListener("resize", () => {
    x = Math.min(x, stageWidth());
    targetX = Math.min(targetX, stageWidth());
    draw(0);
  });

  window.addEventListener("beforeunload", () => {
    if (rafId) cancelAnimationFrame(rafId);
  });
})();
