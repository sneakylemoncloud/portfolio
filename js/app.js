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

  const folderGrid = document.querySelector("#dialog-work .folder-grid");
  const projectDetail = document.getElementById("project-detail");
  const projectTitle = document.getElementById("project-detail-title");
  const projectBody = document.getElementById("project-detail-body");
  const projectBack = document.getElementById("project-detail-back");

  let activeDialog = null;

  function hideProjectDetail() {
    if (!projectDetail || !folderGrid) return;
    projectDetail.hidden = true;
    folderGrid.classList.remove("is-hidden");
  }

  function showProjectDetail(id) {
    const data = PROJECTS[id];
    if (!data || !projectDetail || !folderGrid) return;
    projectTitle.textContent = data.title;
    projectBody.textContent = data.body;
    folderGrid.classList.add("is-hidden");
    projectDetail.hidden = false;
  }

  function openDialog(name) {
    const dialog = dialogs[name];
    if (!dialog) return;

    Object.values(dialogs).forEach((el) => {
      el.hidden = true;
    });

    if (name === "work") hideProjectDetail();

    dialog.hidden = false;
    activeDialog = name;
    layer.hidden = false;
    layer.setAttribute("aria-hidden", "false");
    home.setAttribute("aria-hidden", "true");

    const closeBtn = dialog.querySelector("[data-close]");
    if (closeBtn) closeBtn.focus();
  }

  function closeAll() {
    Object.values(dialogs).forEach((el) => {
      el.hidden = true;
    });
    activeDialog = null;
    layer.hidden = true;
    layer.setAttribute("aria-hidden", "true");
    home.removeAttribute("aria-hidden");
    hideProjectDetail();
  }

  document.querySelectorAll("[data-dialog]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openDialog(btn.getAttribute("data-dialog"));
    });
  });

  document.querySelectorAll("[data-close]").forEach((btn) => {
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

  if (projectBack) {
    projectBack.addEventListener("click", hideProjectDetail);
  }
})();
