(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Theme-aware accent colors, shared by every canvas effect
  var fxColors = { a: "110,168,254", b: "192,139,255" };

  function refreshFxColors() {
    var styles = getComputedStyle(document.documentElement);
    var a = styles.getPropertyValue("--accent-rgb").trim();
    var b = styles.getPropertyValue("--accent-2-rgb").trim();
    if (a) fxColors.a = a;
    if (b) fxColors.b = b;
  }

  // Menu mobile
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Apparition au défilement
  var revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) { el.classList.add("in"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  // Hero depth interaction
  var hero = document.querySelector(".hero");
  var heroLab = document.querySelector(".hero-lab");
  if (hero && heroLab && !prefersReducedMotion) {
    hero.addEventListener("pointermove", function (e) {
      var rect = hero.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      heroLab.style.setProperty("--hx", (x * 14).toFixed(2));
      heroLab.style.setProperty("--hy", (y * 10).toFixed(2));
    });

    hero.addEventListener("pointerleave", function () {
      heroLab.style.setProperty("--hx", "0");
      heroLab.style.setProperty("--hy", "0");
    });
  }

  // Process interaction
  var processData = [
    {
      title: "Problème",
      text: "Identifier précisément ce qui ralentit l'usage ou crée de la confusion.",
      before: "Navigation dense, priorités visuelles mélangées.",
      after: "Structure clarifiée avec chemin principal immédiat.",
      decisions: [
        "Décision UI : renforcer le contraste des actions clés.",
        "Feedback : lecture plus rapide sur mobile."
      ]
    },
    {
      title: "Exploration",
      text: "Comparer plusieurs pistes d'interface sans perdre le cap produit.",
      before: "Hypothèses nombreuses mais peu hiérarchisées.",
      after: "Scénarios testés puis triés selon impact réel.",
      decisions: [
        "Décision UX : prioriser les flux les plus fréquents.",
        "Feedback : navigation ressentie plus fluide dès la 1re visite."
      ]
    },
    {
      title: "Prototype",
      text: "Créer une version cliquable pour valider interaction, rythme et compréhension.",
      before: "Concept prometteur mais abstrait.",
      after: "Parcours tangible avec micro-interactions cohérentes.",
      decisions: [
        "Décision UI : unifier les transitions et états de focus.",
        "Feedback : meilleure confiance dans les actions principales."
      ]
    },
    {
      title: "Itération",
      text: "Ajuster les détails qui améliorent la sensation premium au quotidien.",
      before: "Expérience correcte, mais encore neutre.",
      after: "Interface plus expressive, précise et mémorable.",
      decisions: [
        "Décision UX : réduire les frictions sur mobile.",
        "Feedback : interactions jugées plus naturelles et rapides."
      ]
    }
  ];

  var processButtons = document.querySelectorAll(".process-step");
  var processPanel = document.getElementById("process-panel");

  function renderProcessStep(index) {
    var item = processData[index];
    if (!item || !processPanel) return;
    processPanel.innerHTML = [
      "<h3>" + item.title + "</h3>",
      "<p>" + item.text + "</p>",
      "<div class='proof-grid'>",
      "<div><span>Avant</span><p>" + item.before + "</p></div>",
      "<div><span>Après</span><p>" + item.after + "</p></div>",
      "</div>",
      "<ul><li>" + item.decisions[0] + "</li><li>" + item.decisions[1] + "</li></ul>"
    ].join("");
  }

  processButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var index = Number(btn.getAttribute("data-step"));
      processButtons.forEach(function (item) {
        item.classList.remove("active");
        item.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      renderProcessStep(index);
      trackInteraction();
    });
  });

  // Project filters
  var filterButtons = document.querySelectorAll(".filter-btn");
  var projectCards = document.querySelectorAll(".project[data-domains]");

  function applyFilter(filter) {
    projectCards.forEach(function (card) {
      var domains = (card.getAttribute("data-domains") || "").split(",");
      var show = filter === "all" || domains.indexOf(filter) !== -1;
      card.hidden = !show;
    });
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");
      filterButtons.forEach(function (item) { item.classList.remove("active"); });
      btn.classList.add("active");
      applyFilter(filter);
      trackInteraction();
    });
  });

  // Visitor vote + personalized path
  var voteButtons = document.querySelectorAll(".vote-btn");
  var voteResult = document.getElementById("vote-result");
  var projectsSection = document.getElementById("projets");

  voteButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var preference = btn.getAttribute("data-preference");
      voteButtons.forEach(function (item) { item.classList.remove("active"); });
      btn.classList.add("active");
      if (voteResult) {
        voteResult.textContent = "Préférence enregistrée : " + btn.textContent + ". Parcours filtré appliqué.";
      }
      localMetrics.preference = preference;
      saveMetrics();
      syncFilterFromPreference(preference);
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      }
      trackInteraction();
    });
  });

  function syncFilterFromPreference(filter) {
    filterButtons.forEach(function (item) {
      var selected = item.getAttribute("data-filter") === filter;
      item.classList.toggle("active", selected);
    });
    applyFilter(filter);
  }

  // Lightweight interaction metrics
  var metricTime = document.getElementById("metric-time");
  var metricGithub = document.getElementById("metric-github");
  var metricInteractions = document.getElementById("metric-interactions");

  var localMetrics = {
    projectsTimeMs: 0,
    githubClicks: 0,
    interactions: 0,
    preference: ""
  };

  try {
    var saved = window.localStorage.getItem("portfolioMetrics");
    if (saved) {
      var parsed = JSON.parse(saved);
      localMetrics.projectsTimeMs = Number(parsed.projectsTimeMs) || 0;
      localMetrics.githubClicks = Number(parsed.githubClicks) || 0;
      localMetrics.interactions = Number(parsed.interactions) || 0;
      localMetrics.preference = parsed.preference || "";
    }
  } catch (e) {}

  function saveMetrics() {
    try {
      window.localStorage.setItem("portfolioMetrics", JSON.stringify(localMetrics));
    } catch (e) {}
    renderMetrics();
  }

  function renderMetrics() {
    if (metricTime) {
      metricTime.textContent = Math.round(localMetrics.projectsTimeMs / 1000) + "s";
    }
    if (metricGithub) {
      metricGithub.textContent = String(localMetrics.githubClicks);
    }
    if (metricInteractions) {
      metricInteractions.textContent = String(localMetrics.interactions);
    }
    if (voteResult && localMetrics.preference) {
      var prefButton = document.querySelector('.vote-btn[data-preference="' + localMetrics.preference + '"]');
      if (prefButton) {
        voteResult.textContent = "Préférence enregistrée : " + prefButton.textContent + ".";
      }
    }
  }

  function trackInteraction() {
    localMetrics.interactions += 1;
    saveMetrics();
  }

  // Count-up animation when the metrics card first enters the viewport
  var metricsCard = document.querySelector(".metrics-card");
  if (metricsCard && "IntersectionObserver" in window && !prefersReducedMotion) {
    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        animateCount(metricTime, Math.round(localMetrics.projectsTimeMs / 1000), "s");
        animateCount(metricGithub, localMetrics.githubClicks, "");
        animateCount(metricInteractions, localMetrics.interactions, "");
      });
    }, { threshold: 0.4 });
    countObserver.observe(metricsCard);
  }

  function animateCount(el, target, suffix) {
    if (!el || target <= 0) return;
    var start = performance.now();
    var duration = 900;
    function step(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var projectEntryStart = 0;
  var projectsInView = false;
  var projectsObserverSupported = "IntersectionObserver" in window;

  function flushProjectTime() {
    if (projectsInView && projectEntryStart) {
      localMetrics.projectsTimeMs += Date.now() - projectEntryStart;
      projectEntryStart = Date.now();
      saveMetrics();
    }
  }

  if (projectsSection && projectsObserverSupported) {
    var projectsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.target !== projectsSection) return;
        if (entry.isIntersecting) {
          projectsInView = true;
          projectEntryStart = Date.now();
        } else if (projectsInView && projectEntryStart) {
          localMetrics.projectsTimeMs += Date.now() - projectEntryStart;
          projectsInView = false;
          projectEntryStart = 0;
          saveMetrics();
        }
      });
    }, { threshold: 0.35 });

    projectsObserver.observe(projectsSection);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && projectsInView && projectEntryStart) {
      localMetrics.projectsTimeMs += Date.now() - projectEntryStart;
      projectsInView = false;
      projectEntryStart = 0;
      saveMetrics();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (projectsInView && projectEntryStart) {
      localMetrics.projectsTimeMs += Date.now() - projectEntryStart;
      projectsInView = false;
      projectEntryStart = 0;
    }
    saveMetrics();
  });

  setInterval(flushProjectTime, 15000);

  document.querySelectorAll('a[href*="github.com"]').forEach(function (link) {
    link.addEventListener("click", function () {
      localMetrics.githubClicks += 1;
      saveMetrics();
    });
  });

  document.querySelectorAll(".project details summary").forEach(function (summary) {
    summary.addEventListener("click", trackInteraction);
  });

  if (localMetrics.preference) {
    syncFilterFromPreference(localMetrics.preference);
    var selectedVote = document.querySelector('.vote-btn[data-preference="' + localMetrics.preference + '"]');
    if (selectedVote) selectedVote.classList.add("active");
  } else {
    applyFilter("all");
  }

  renderMetrics();

  // Scroll progress bar
  var progressBar = document.getElementById("scroll-progress-bar");
  var toTop = document.getElementById("to-top");

  function onScroll() {
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - doc.clientHeight;
    var ratio = scrollable > 0 ? doc.scrollTop / scrollable : 0;
    if (progressBar) progressBar.style.width = (ratio * 100).toFixed(2) + "%";
    if (toTop) toTop.classList.toggle("is-visible", doc.scrollTop > 600);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  // Cursor spotlight glow
  var cursorGlow = document.querySelector(".cursor-glow");
  if (cursorGlow && !prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", function (e) {
      cursorGlow.style.transform = "translate3d(" + e.clientX + "px," + e.clientY + "px,0) translate(-50%,-50%)";
      cursorGlow.classList.add("is-visible");
    }, { passive: true });
    document.addEventListener("pointerleave", function () {
      cursorGlow.classList.remove("is-visible");
    });
  }

  // Interactive 3D tilt on cards
  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    var tiltCards = document.querySelectorAll(".project, .passion, .principles article");
    tiltCards.forEach(function (card) {
      card.classList.add("tilt");
      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        card.style.setProperty("--ry", ((px - 0.5) * 7).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - py) * 7).toFixed(2) + "deg");
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        card.classList.add("is-tilting");
      });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        card.classList.remove("is-tilting");
      });
    });
  }

  // Magnetic primary buttons
  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".btn-primary").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var rect = btn.getBoundingClientRect();
        var mx = e.clientX - rect.left - rect.width / 2;
        var my = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = "translate3d(" + (mx * 0.2).toFixed(1) + "px," + (my * 0.3 - 2).toFixed(1) + "px,0)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
    });
  }

  // Hero interactive particle field
  var heroCanvas = document.querySelector(".hero-canvas");
  if (heroCanvas && heroCanvas.getContext && !prefersReducedMotion) {
    var ctx = heroCanvas.getContext("2d");
    var heroEl = document.querySelector(".hero");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var pointer = { x: -999, y: -999 };
    var width = 0;
    var height = 0;
    var rafId = 0;
    var running = false;

    function sizeCanvas() {
      if (!heroEl) return;
      var rect = heroEl.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      heroCanvas.width = Math.round(width * dpr);
      heroCanvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(28, Math.min(72, Math.round(width / 18)));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.8 + 0.6
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        var dxp = p.x - pointer.x;
        var dyp = p.y - pointer.y;
        var distP = Math.sqrt(dxp * dxp + dyp * dyp);
        if (distP < 120) {
          var force = (120 - distP) / 120 * 0.6;
          p.x += (dxp / (distP || 1)) * force;
          p.y += (dyp / (distP || 1)) * force;
        }

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x;
          var dy = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 116) {
            ctx.strokeStyle = "rgba(" + fxColors.a + "," + (0.16 * (1 - dist / 116)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = "rgba(" + fxColors.b + ",.55)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(draw);
    }

    function startHero() {
      if (running) return;
      running = true;
      draw();
    }

    function stopHero() {
      running = false;
      cancelAnimationFrame(rafId);
    }

    if (heroEl) {
      heroEl.addEventListener("pointermove", function (e) {
        var rect = heroEl.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
      });
      heroEl.addEventListener("pointerleave", function () {
        pointer.x = -999;
        pointer.y = -999;
      });
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(sizeCanvas, 200);
    });

    if ("IntersectionObserver" in window && heroEl) {
      var heroObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) startHero();
          else stopHero();
        });
      }, { threshold: 0 });
      heroObserver.observe(heroEl);
    } else {
      startHero();
    }

    sizeCanvas();
  }

  /* ====================================================
     Immersive layer: themes, typewriter, sparkles,
     achievements, mini-game, easter egg
     ==================================================== */

  refreshFxColors();

  // ---------- Achievements ----------
  var achievementDefs = [
    { id: "explorer", icon: "\uD83E\uDDED", name: "Explorateur", desc: "Atteindre le bas de la page" },
    { id: "curious", icon: "\uD83D\uDD0D", name: "Curieux", desc: "Ouvrir 3 aper\u00e7us d\u00e9taill\u00e9s" },
    { id: "player", icon: "\uD83C\uDFAE", name: "Joueur", desc: "Terminer une partie du mini-jeu" },
    { id: "champion", icon: "\uD83C\uDFC6", name: "Champion", desc: "Marquer 15 points ou plus" },
    { id: "chameleon", icon: "\uD83C\uDFA8", name: "Cam\u00e9l\u00e9on", desc: "Changer d'ambiance" },
    { id: "hacker", icon: "\uD83D\uDD79\uFE0F", name: "Hacker", desc: "Trouver le code secret" }
  ];

  var unlockedAchievements = [];
  try {
    unlockedAchievements = JSON.parse(window.localStorage.getItem("portfolioAchievements") || "[]");
    if (!Array.isArray(unlockedAchievements)) unlockedAchievements = [];
  } catch (e) { unlockedAchievements = []; }

  var achievementList = document.getElementById("achievement-list");
  var toastStack = document.getElementById("toast-stack");

  function renderAchievements() {
    if (!achievementList) return;
    achievementList.innerHTML = "";
    achievementDefs.forEach(function (def) {
      var li = document.createElement("li");
      li.textContent = def.icon + " " + def.name;
      li.title = def.desc;
      if (unlockedAchievements.indexOf(def.id) !== -1) li.classList.add("unlocked");
      achievementList.appendChild(li);
    });
  }

  function showToast(icon, title, subtitle) {
    if (!toastStack) return;
    var toast = document.createElement("div");
    toast.className = "toast";
    var iconEl = document.createElement("span");
    iconEl.className = "toast-icon";
    iconEl.textContent = icon;
    var body = document.createElement("div");
    var strong = document.createElement("strong");
    strong.textContent = title;
    var small = document.createElement("small");
    small.textContent = subtitle;
    body.appendChild(strong);
    body.appendChild(small);
    toast.appendChild(iconEl);
    toast.appendChild(body);
    toastStack.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add("show"); });
    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () { toast.remove(); }, 450);
    }, 3800);
  }

  function unlockAchievement(id) {
    if (unlockedAchievements.indexOf(id) !== -1) return;
    var def = null;
    achievementDefs.forEach(function (item) { if (item.id === id) def = item; });
    if (!def) return;
    unlockedAchievements.push(id);
    try {
      window.localStorage.setItem("portfolioAchievements", JSON.stringify(unlockedAchievements));
    } catch (e) {}
    renderAchievements();
    showToast(def.icon, "Succ\u00e8s d\u00e9bloqu\u00e9 : " + def.name, def.desc);
    spawnBurst(window.innerWidth - 90, 110, 26, false);
  }

  renderAchievements();

  // Explorer: reach the bottom of the page
  var explorerDone = unlockedAchievements.indexOf("explorer") !== -1;
  window.addEventListener("scroll", function () {
    if (explorerDone) return;
    var doc = document.documentElement;
    if (doc.scrollTop + doc.clientHeight >= doc.scrollHeight - 40) {
      explorerDone = true;
      unlockAchievement("explorer");
    }
  }, { passive: true });

  // Curious: open 3 project details
  var detailsOpened = 0;
  document.querySelectorAll(".project details").forEach(function (details) {
    details.addEventListener("toggle", function () {
      if (!details.open) return;
      detailsOpened += 1;
      if (detailsOpened >= 3) unlockAchievement("curious");
    });
  });

  // ---------- Theme ambiances ----------
  var themes = [
    { id: "", name: "Nuit" },
    { id: "neon", name: "N\u00e9on" },
    { id: "sunset", name: "Cr\u00e9puscule" }
  ];
  var themeToggle = document.getElementById("theme-toggle");
  var themeName = document.getElementById("theme-name");
  var themeIndex = 0;

  function applyTheme(index, silent) {
    themeIndex = ((index % themes.length) + themes.length) % themes.length;
    var theme = themes[themeIndex];
    if (theme.id) document.documentElement.setAttribute("data-theme", theme.id);
    else document.documentElement.removeAttribute("data-theme");
    if (themeName) themeName.textContent = theme.name;
    try { window.localStorage.setItem("portfolioTheme", String(themeIndex)); } catch (e) {}
    refreshFxColors();
    if (!silent) unlockAchievement("chameleon");
  }

  try {
    var savedTheme = parseInt(window.localStorage.getItem("portfolioTheme"), 10);
    if (!isNaN(savedTheme) && savedTheme > 0) applyTheme(savedTheme, true);
  } catch (e) {}

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(themeIndex + 1, false);
      trackInteraction();
    });
  }

  // ---------- Typewriter hero ----------
  var typewriterEl = document.getElementById("typewriter");
  if (typewriterEl && !prefersReducedMotion) {
    var typeWords = [
      "des interfaces et des mondes",
      "des syst\u00e8mes vivants",
      "des prototypes joueurs",
      "des exp\u00e9riences immersives"
    ];
    var typeWordIndex = 0;
    var typeCharIndex = typeWords[0].length;
    var typeDeleting = false;

    function typeTick() {
      var word = typeWords[typeWordIndex];
      if (typeDeleting) {
        typeCharIndex -= 1;
        typewriterEl.textContent = word.slice(0, typeCharIndex);
        if (typeCharIndex <= 0) {
          typeDeleting = false;
          typeWordIndex = (typeWordIndex + 1) % typeWords.length;
          setTimeout(typeTick, 350);
          return;
        }
        setTimeout(typeTick, 26);
      } else {
        word = typeWords[typeWordIndex];
        typeCharIndex += 1;
        typewriterEl.textContent = word.slice(0, typeCharIndex);
        if (typeCharIndex >= word.length) {
          typeDeleting = true;
          setTimeout(typeTick, 2600);
          return;
        }
        setTimeout(typeTick, 46);
      }
    }

    setTimeout(function () {
      typeDeleting = true;
      typeTick();
    }, 2400);
  }

  // ---------- Scramble-in section headings ----------
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    var scrambleChars = "!<>-_/[]{}\u2014=+*^?#";

    function scrambleHeading(el) {
      var original = el.textContent;
      var frame = 0;
      var totalFrames = 18;
      el.classList.add("scrambling");
      function step() {
        var out = "";
        for (var i = 0; i < original.length; i++) {
          if (original[i] === " " || i < (frame / totalFrames) * original.length) {
            out += original[i];
          } else {
            out += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          }
        }
        el.textContent = out;
        frame += 1;
        if (frame <= totalFrames) {
          requestAnimationFrame(step);
        } else {
          el.textContent = original;
          el.classList.remove("scrambling");
        }
      }
      step();
    }

    var scrambleObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        scrambleHeading(entry.target);
      });
    }, { threshold: 0.6 });

    document.querySelectorAll(".section-head h2, .interaction-card h2").forEach(function (h2) {
      scrambleObserver.observe(h2);
    });
  }

  // ---------- FX canvas: sparkles + confetti ----------
  var fxCanvas = document.getElementById("fx-canvas");
  var fxCtx = fxCanvas && fxCanvas.getContext ? fxCanvas.getContext("2d") : null;
  var fxParticles = [];
  var fxRunning = false;
  var fxDpr = Math.min(window.devicePixelRatio || 1, 2);

  function sizeFxCanvas() {
    if (!fxCanvas) return;
    fxCanvas.width = Math.round(window.innerWidth * fxDpr);
    fxCanvas.height = Math.round(window.innerHeight * fxDpr);
    if (fxCtx) fxCtx.setTransform(fxDpr, 0, 0, fxDpr, 0, 0);
  }

  var CONFETTI_BASE_DECAY = 0.008;
  var CONFETTI_DECAY_RANGE = 0.008;
  var SPARKLE_BASE_DECAY = 0.025;
  var SPARKLE_DECAY_RANGE = 0.02;

  function spawnBurst(x, y, count, confetti) {
    if (!fxCtx || prefersReducedMotion) return;
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = confetti ? Math.random() * 7 + 2 : Math.random() * 3.4 + 1;
      fxParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (confetti ? 3 : 1),
        life: 1,
        decay: confetti
          ? CONFETTI_BASE_DECAY + Math.random() * CONFETTI_DECAY_RANGE
          : SPARKLE_BASE_DECAY + Math.random() * SPARKLE_DECAY_RANGE,
        size: confetti ? Math.random() * 5 + 3 : Math.random() * 2.4 + 1,
        color: Math.random() < 0.5 ? fxColors.a : fxColors.b,
        spin: Math.random() * Math.PI,
        confetti: !!confetti
      });
    }
    if (!fxRunning) {
      fxRunning = true;
      requestAnimationFrame(fxDraw);
    }
  }

  function fxDraw() {
    if (!fxCtx) return;
    fxCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = fxParticles.length - 1; i >= 0; i--) {
      var p = fxParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.confetti ? 0.16 : 0.05;
      p.vx *= 0.99;
      p.life -= p.decay;
      p.spin += 0.12;
      if (p.life <= 0) {
        fxParticles.splice(i, 1);
        continue;
      }
      fxCtx.globalAlpha = Math.max(p.life, 0);
      fxCtx.fillStyle = "rgb(" + p.color + ")";
      if (p.confetti) {
        fxCtx.save();
        fxCtx.translate(p.x, p.y);
        fxCtx.rotate(p.spin);
        fxCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        fxCtx.restore();
      } else {
        fxCtx.beginPath();
        fxCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        fxCtx.fill();
      }
    }
    fxCtx.globalAlpha = 1;
    if (fxParticles.length > 0) {
      requestAnimationFrame(fxDraw);
    } else {
      fxRunning = false;
      fxCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  sizeFxCanvas();
  window.addEventListener("resize", sizeFxCanvas);

  // Sparkles on every click (outside the game stage, which has its own)
  if (!prefersReducedMotion) {
    document.addEventListener("pointerdown", function (e) {
      if (e.target.closest && e.target.closest(".game-stage")) return;
      spawnBurst(e.clientX, e.clientY, 10, false);
    }, { passive: true });
  }

  function confettiShower() {
    if (prefersReducedMotion) return;
    for (var i = 0; i < 6; i++) {
      (function (delay) {
        setTimeout(function () {
          spawnBurst(Math.random() * window.innerWidth, window.innerHeight * 0.25, 34, true);
        }, delay);
      })(i * 180);
    }
  }

  // ---------- Mini-game: orb hunt ----------
  var gameCanvas = document.getElementById("game-canvas");
  var gameOverlay = document.getElementById("game-overlay");
  var gameMessage = document.getElementById("game-message");
  var gameStartBtn = document.getElementById("game-start");
  var gameScoreEl = document.getElementById("game-score");
  var gameBestEl = document.getElementById("game-best");
  var gameTimeEl = document.getElementById("game-time");

  if (gameCanvas && gameCanvas.getContext && gameOverlay && gameStartBtn) {
    var gctx = gameCanvas.getContext("2d");
    var gameDpr = Math.min(window.devicePixelRatio || 1, 2);
    var gameW = 0;
    var gameH = 0;
    var orbs = [];
    var gameScore = 0;
    var gameBest = 0;
    var gameActive = false;
    var gameEndsAt = 0;
    var gameRaf = 0;
    var lastSpawn = 0;
    var GAME_DURATION = 30000;
    var NORMAL_ORB_PROBABILITY = 0.62;
    var GOLD_ORB_PROBABILITY = 0.82;
    var INITIAL_SPAWN_INTERVAL = 750;
    var DIFFICULTY_SCALE = 60;
    var MIN_SPAWN_INTERVAL = 320;

    try {
      gameBest = parseInt(window.localStorage.getItem("orbGameBest"), 10) || 0;
    } catch (e) {}
    if (gameBestEl) gameBestEl.textContent = String(gameBest);

    function sizeGameCanvas() {
      var rect = gameCanvas.getBoundingClientRect();
      gameW = rect.width;
      gameH = rect.height;
      gameCanvas.width = Math.round(gameW * gameDpr);
      gameCanvas.height = Math.round(gameH * gameDpr);
      gctx.setTransform(gameDpr, 0, 0, gameDpr, 0, 0);
    }

    function spawnOrb(now) {
      var roll = Math.random();
      var type = roll < NORMAL_ORB_PROBABILITY ? "normal" : roll < GOLD_ORB_PROBABILITY ? "gold" : "red";
      var maxR = type === "gold" ? 15 : type === "red" ? 20 : 19;
      orbs.push({
        x: 30 + Math.random() * (gameW - 60),
        y: 30 + Math.random() * (gameH - 60),
        born: now,
        ttl: type === "gold" ? 1500 : 2300,
        maxR: maxR,
        type: type
      });
    }

    function orbRadius(orb, now) {
      var t = (now - orb.born) / orb.ttl;
      if (t >= 1) return -1;
      return Math.max(Math.sin(t * Math.PI) * orb.maxR, 2.5);
    }

    function drawGame(now) {
      gctx.clearRect(0, 0, gameW, gameH);
      var remaining = gameEndsAt - now;

      var elapsed = GAME_DURATION - remaining;
      var spawnEvery = Math.max(INITIAL_SPAWN_INTERVAL - elapsed / DIFFICULTY_SCALE, MIN_SPAWN_INTERVAL);
      if (now - lastSpawn > spawnEvery) {
        spawnOrb(now);
        lastSpawn = now;
      }

      for (var i = orbs.length - 1; i >= 0; i--) {
        var orb = orbs[i];
        var r = orbRadius(orb, now);
        if (r < 0) {
          orbs.splice(i, 1);
          continue;
        }
        var color = orb.type === "gold" ? "255,209,102" : orb.type === "red" ? "255,99,99" : fxColors.a;
        var glow = gctx.createRadialGradient(orb.x - r * 0.3, orb.y - r * 0.3, r * 0.1, orb.x, orb.y, r);
        glow.addColorStop(0, "rgba(255,255,255,.85)");
        glow.addColorStop(0.35, "rgba(" + color + ",.9)");
        glow.addColorStop(1, "rgba(" + color + ",.1)");
        gctx.fillStyle = glow;
        gctx.beginPath();
        gctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
        gctx.fill();
      }

      if (gameTimeEl) gameTimeEl.textContent = Math.max(Math.ceil(remaining / 1000), 0) + "s";

      if (remaining <= 0) {
        endGame();
        return;
      }
      gameRaf = requestAnimationFrame(drawGame);
    }

    function startGame() {
      sizeGameCanvas();
      orbs = [];
      gameScore = 0;
      gameActive = true;
      lastSpawn = 0;
      if (gameScoreEl) gameScoreEl.textContent = "0";
      gameOverlay.classList.add("hidden");
      gameEndsAt = performance.now() + GAME_DURATION;
      gameRaf = requestAnimationFrame(drawGame);
      trackInteraction();
    }

    function endGame() {
      gameActive = false;
      cancelAnimationFrame(gameRaf);
      gctx.clearRect(0, 0, gameW, gameH);
      orbs = [];
      var isRecord = gameScore > gameBest;
      if (isRecord) {
        gameBest = gameScore;
        try { window.localStorage.setItem("orbGameBest", String(gameBest)); } catch (e) {}
        if (gameBestEl) gameBestEl.textContent = String(gameBest);
      }
      if (gameMessage) {
        gameMessage.textContent = isRecord
          ? "Nouveau record : " + gameScore + " points ! Bravo \uD83C\uDF89"
          : "Partie termin\u00e9e : " + gameScore + " points. On retente ?";
      }
      if (gameStartBtn) gameStartBtn.textContent = "Rejouer";
      gameOverlay.classList.remove("hidden");
      unlockAchievement("player");
      if (gameScore >= 15) unlockAchievement("champion");
      if (isRecord) confettiShower();
    }

    gameStartBtn.addEventListener("click", startGame);

    gameCanvas.addEventListener("pointerdown", function (e) {
      if (!gameActive) return;
      var rect = gameCanvas.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var now = performance.now();
      for (var i = orbs.length - 1; i >= 0; i--) {
        var orb = orbs[i];
        var r = orbRadius(orb, now);
        if (r < 0) continue;
        var dx = x - orb.x;
        var dy = y - orb.y;
        if (dx * dx + dy * dy <= (r + 8) * (r + 8)) {
          var gain = orb.type === "gold" ? 3 : orb.type === "red" ? -2 : 1;
          gameScore = Math.max(gameScore + gain, 0);
          if (gameScoreEl) gameScoreEl.textContent = String(gameScore);
          spawnBurst(e.clientX, e.clientY, orb.type === "gold" ? 18 : 10, false);
          orbs.splice(i, 1);
          return;
        }
      }
    });

    window.addEventListener("resize", function () {
      if (gameActive) sizeGameCanvas();
    });
  }

  // ---------- Konami code easter egg ----------
  var konamiSequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  var konamiProgress = 0;

  function triggerParty() {
    var on = document.body.classList.toggle("party");
    unlockAchievement("hacker");
    if (on) {
      confettiShower();
      showToast("\uD83C\uDF89", "Mode f\u00eate activ\u00e9 !", "Refaites la s\u00e9quence pour revenir au calme.");
    }
  }

  document.addEventListener("keydown", function (e) {
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === konamiSequence[konamiProgress]) {
      konamiProgress += 1;
      if (konamiProgress === konamiSequence.length) {
        konamiProgress = 0;
        triggerParty();
      }
    } else {
      konamiProgress = key === konamiSequence[0] ? 1 : 0;
    }
  });

  var footerSecret = document.querySelector(".footer-secret");
  if (footerSecret) {
    var secretTaps = 0;
    footerSecret.addEventListener("click", function () {
      secretTaps += 1;
      if (secretTaps >= 3) {
        secretTaps = 0;
        triggerParty();
      }
    });
  }
})();
