(function () {
  const PROJECTS = {
    compass: {
      title: "Compass",
      body:
        "A navigation and onboarding system for a B2B analytics product. Led research, IA, and high-fidelity flows that reduced time-to-first-insight by 40%.",
    },
    relay: {
      title: "Relay",
      body:
        "Real-time collaboration patterns for distributed teams. Prototyped presence, cursors, and conflict resolution in a pixel-perfect design system.",
    },
    atlas: {
      title: "Atlas",
      body:
        "Design system and component library for a health-tech platform. Documented tokens, accessibility specs, and engineer handoff in Figma + Storybook.",
    },
    signal: {
      title: "Signal",
      body:
        "Mobile-first dashboard for field operators. Simplified dense data into glanceable cards and offline-friendly workflows.",
    },
  };

  const home = document.getElementById("home");
  const layer = document.getElementById("dialog-layer");
  const dialogs = {
    work: document.getElementById("dialog-work"),
    "not-work": document.getElementById("dialog-not-work"),
    about: document.getElementById("dialog-about"),
  };

  const workDialog = dialogs.work;
  const workContent = workDialog ? workDialog.querySelector(".welcome-content") : null;
  const workIndex = document.querySelector("#dialog-work .work-index");
  const projectDetail = document.getElementById("project-detail");
  const projectTitle = document.getElementById("project-detail-title");
  const projectBody = document.getElementById("project-detail-body");
  const caseStudies = {
    compass: document.getElementById("case-compass"),
  };

  let activeDialog = null;
  let activeOrigin = null;

  // Read the motion language from CSS so JS and CSS never drift apart.
  const rootStyle = getComputedStyle(document.documentElement);
  const EASE_SNAP = rootStyle.getPropertyValue("--ease-snap").trim() || "cubic-bezier(0.2,0.9,0.25,1.15)";
  const EASE_OUT = rootStyle.getPropertyValue("--ease-out").trim() || "cubic-bezier(0.16,1,0.3,1)";
  const EASE_IN = rootStyle.getPropertyValue("--ease-in").trim() || "cubic-bezier(0.5,0,0.75,0)";
  const DUR_WINDOW = parseFloat(rootStyle.getPropertyValue("--dur-window")) || 360;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canAnimate = typeof Element !== "undefined" && "animate" in Element.prototype;

  // The transform that maps the window's final rect onto the icon that spawned it.
  function originTransform(dialog, originEl) {
    const d = dialog.getBoundingClientRect();
    const o = originEl.getBoundingClientRect();
    const dx = o.left + o.width / 2 - (d.left + d.width / 2);
    const dy = o.top + o.height / 2 - (d.top + d.height / 2);
    const sx = Math.max(o.width / d.width, 0.08);
    const sy = Math.max(o.height / d.height, 0.08);
    return `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
  }

  // Window springs out of its icon with a CRT brightness bloom and a little overshoot.
  function animateWindowOpen(dialog, originEl) {
    if (reduceMotion.matches || !originEl || !canAnimate) return;
    layer.getAnimations().forEach((a) => a.cancel());
    layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: EASE_OUT });
    dialog.getAnimations().forEach((a) => a.cancel());
    dialog.animate(
      [
        { transform: originTransform(dialog, originEl), opacity: 0, filter: "brightness(1.9)" },
        { transform: "translate(0, 0) scale(1, 1)", opacity: 1, filter: "brightness(1)" },
      ],
      { duration: DUR_WINDOW, easing: EASE_SNAP, fill: "backwards" }
    );
  }

  // Close collapses back into the icon; done() hides the layer once the motion lands.
  function animateWindowClose(dialog, originEl, done) {
    if (reduceMotion.matches || !originEl || !canAnimate) {
      done();
      return;
    }
    // Match the window collapse duration and hold at 0 so the backdrop never
    // snaps back to full opacity before the layer is hidden.
    layer.getAnimations().forEach((a) => a.cancel());
    layer.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 220,
      easing: EASE_IN,
      fill: "forwards",
    });
    dialog.getAnimations().forEach((a) => a.cancel());
    const anim = dialog.animate(
      [
        { transform: "translate(0, 0) scale(1, 1)", opacity: 1 },
        { transform: originTransform(dialog, originEl), opacity: 0 },
      ],
      { duration: 220, easing: EASE_IN, fill: "forwards" }
    );
    anim.onfinish = () => {
      done();
      anim.cancel();
    };
  }

  function hideAllCaseStudies() {
    Object.values(caseStudies).forEach((el) => {
      if (el) el.hidden = true;
    });
  }

  function hideProjectDetail() {
    if (workIndex) workIndex.classList.remove("is-hidden");
    if (projectDetail) projectDetail.hidden = true;
    hideAllCaseStudies();
    if (workDialog) workDialog.classList.remove("is--reading");
    if (workContent) workContent.scrollTop = 0;
  }

  function showProjectDetail(id) {
    if (!workIndex) return;

    const caseEl = caseStudies[id];
    if (caseEl) {
      if (projectDetail) projectDetail.hidden = true;
      hideAllCaseStudies();
      workIndex.classList.add("is-hidden");
      caseEl.hidden = false;
      if (workDialog) workDialog.classList.add("is--reading");
      if (workContent) workContent.scrollTop = 0;
      return;
    }

    const data = PROJECTS[id];
    if (!data || !projectDetail) return;
    projectTitle.textContent = data.title;
    projectBody.textContent = data.body;
    hideAllCaseStudies();
    workIndex.classList.add("is-hidden");
    if (workDialog) workDialog.classList.remove("is--reading");
    projectDetail.hidden = false;
    if (workContent) workContent.scrollTop = 0;
  }

  function openDialog(name, originEl) {
    const dialog = dialogs[name];
    if (!dialog) return;

    Object.values(dialogs).forEach((el) => {
      el.hidden = true;
    });

    if (name === "work") hideProjectDetail();

    dialog.hidden = false;
    activeDialog = name;
    activeOrigin = originEl || null;
    layer.hidden = false;
    layer.setAttribute("aria-hidden", "false");
    home.setAttribute("aria-hidden", "true");

    animateWindowOpen(dialog, originEl);
    // Let the audio layer play a distinct "window opened" chime.
    document.dispatchEvent(new CustomEvent("lemonade:windowopen"));

    const closeBtn = dialog.querySelector("[data-close]");
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function closeAll() {
    const dialog = activeDialog ? dialogs[activeDialog] : null;
    const origin = activeOrigin;
    activeDialog = null;
    activeOrigin = null;

    // Only when a window was actually open: play the close "whoosh".
    if (dialog) document.dispatchEvent(new CustomEvent("lemonade:windowclose"));

    const finish = () => {
      Object.values(dialogs).forEach((el) => {
        el.hidden = true;
      });
      layer.hidden = true;
      layer.setAttribute("aria-hidden", "true");
      home.removeAttribute("aria-hidden");
      hideProjectDetail();
    };

    if (dialog) animateWindowClose(dialog, origin, finish);
    else finish();
  }

  document.querySelectorAll("[data-dialog]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openDialog(btn.getAttribute("data-dialog"), btn);
    });
  });

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", closeAll);
  });

  // Menu-bar "Lemonade / home" returns to the desktop (closes any open window).
  document.querySelectorAll('[data-action="home"]').forEach((btn) => {
    btn.addEventListener("click", closeAll);
  });

  layer.addEventListener("click", (e) => {
    if (e.target === layer) closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeDialog) closeAll();
  });

  document.querySelectorAll(".folder-item[data-project]").forEach((btn) => {
    btn.addEventListener("click", () => {
      showProjectDetail(btn.getAttribute("data-project"));
    });
  });

  document.querySelectorAll("[data-detail-back]").forEach((btn) => {
    btn.addEventListener("click", hideProjectDetail);
  });
})();
