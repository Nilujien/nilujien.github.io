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

  // Process interaction
  var processData = [
    {
      title: "Problème",
      text: "Identifier précisément ce qui ralentit l'usage ou crée de la confusion.",
      before: "Navigation dense, priorités visuelles mélangées.",
      after: "Structure clarifiée avec chemin principal immédiat.",
      decisions: [
        "Décision UI : renforcer le contraste des actions clés.",
        "Constat : la lecture devient plus rapide, surtout sur mobile."
      ]
    },
    {
      title: "Exploration",
      text: "Comparer plusieurs pistes d'interface sans perdre le cap du projet.",
      before: "Hypothèses nombreuses mais peu hiérarchisées.",
      after: "Pistes testées puis triées selon leur impact réel.",
      decisions: [
        "Décision UX : prioriser les parcours les plus fréquents.",
        "Constat : la navigation devient évidente dès la première visite."
      ]
    },
    {
      title: "Prototype",
      text: "Créer une version cliquable pour valider interaction, rythme et compréhension.",
      before: "Concept prometteur mais abstrait.",
      after: "Parcours tangible avec micro-interactions cohérentes.",
      decisions: [
        "Décision UI : unifier les transitions et les états de focus.",
        "Constat : les actions principales inspirent davantage confiance."
      ]
    },
    {
      title: "Itération",
      text: "Ajuster les détails qui rendent l'usage agréable au quotidien.",
      before: "Expérience correcte, mais encore neutre.",
      after: "Interface plus expressive, précise et mémorable.",
      decisions: [
        "Décision UX : réduire les frictions sur mobile.",
        "Constat : les interactions paraissent plus naturelles et rapides."
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

  // ---------- Petite simulation vivante : mini-écosystème ----------
  var labCanvas = document.getElementById("lab-canvas");
  var labPopEl = document.getElementById("lab-pop");
  var labBirthsEl = document.getElementById("lab-births");
  var labFoodEl = document.getElementById("lab-food");
  var labResetBtn = document.getElementById("lab-reset");

  if (labCanvas && labCanvas.getContext) {
    var lctx = labCanvas.getContext("2d");
    var labDpr = Math.min(window.devicePixelRatio || 1, 2);
    var labW = 0;
    var labH = 0;
    var cells = [];
    var foods = [];
    var labBirths = 0;
    var labPointer = { x: -999, y: -999 };
    var labRunning = false;
    var labRaf = 0;
    var lastFoodSpawn = 0;
    var lastStatsUpdate = 0;

    var MAX_CELLS = 34;
    var MAX_FOOD = 24;
    var SEED_CELLS = 8;
    var SEED_FOOD = 12;
    var FOOD_SPAWN_EVERY = 1100;
    var FOOD_CLICK_BUFFER = 8;
    var FOOD_ENERGY = 34;
    var SPLIT_ENERGY = 110;
    var ENERGY_DRAIN = 0.045;
    var SENSE_RADIUS = 140;
    var POINTER_RADIUS = 120;

    function sizeLabCanvas() {
      var rect = labCanvas.getBoundingClientRect();
      labW = rect.width;
      labH = rect.height;
      labCanvas.width = Math.round(labW * labDpr);
      labCanvas.height = Math.round(labH * labDpr);
      lctx.setTransform(labDpr, 0, 0, labDpr, 0, 0);
    }

    function spawnCell(x, y, energy) {
      cells.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        energy: energy,
        wander: Math.random() * Math.PI * 2,
        tint: Math.random()
      });
    }

    function spawnFood(x, y) {
      foods.push({
        x: x,
        y: y,
        born: performance.now(),
        phase: Math.random() * Math.PI * 2
      });
    }

    function seedLab() {
      cells = [];
      foods = [];
      labBirths = 0;
      for (var i = 0; i < SEED_CELLS; i++) {
        spawnCell(Math.random() * labW, Math.random() * labH, 55 + Math.random() * 35);
      }
      for (var j = 0; j < SEED_FOOD; j++) {
        spawnFood(20 + Math.random() * (labW - 40), 20 + Math.random() * (labH - 40));
      }
      updateLabStats(true);
    }

    function updateLabStats(force) {
      var now = performance.now();
      if (!force && now - lastStatsUpdate < 400) return;
      lastStatsUpdate = now;
      if (labPopEl) labPopEl.textContent = String(cells.length);
      if (labBirthsEl) labBirthsEl.textContent = String(labBirths);
      if (labFoodEl) labFoodEl.textContent = String(foods.length);
    }

    function updateCell(cell) {
      // Seek the nearest food within sensing range
      var targetX = 0;
      var targetY = 0;
      var bestDist = SENSE_RADIUS;
      var found = false;
      for (var i = 0; i < foods.length; i++) {
        var f = foods[i];
        var dx = f.x - cell.x;
        var dy = f.y - cell.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < bestDist) {
          bestDist = dist;
          targetX = dx;
          targetY = dy;
          found = true;
        }
      }
      if (found) {
        var norm = bestDist || 1;
        cell.vx += (targetX / norm) * 0.06;
        cell.vy += (targetY / norm) * 0.06;
      } else {
        // Gentle wandering when nothing is in sight
        cell.wander += (Math.random() - 0.5) * 0.5;
        cell.vx += Math.cos(cell.wander) * 0.03;
        cell.vy += Math.sin(cell.wander) * 0.03;
      }

      // Curiosity: cells drift toward the visitor's pointer
      var pdx = labPointer.x - cell.x;
      var pdy = labPointer.y - cell.y;
      var pdist = Math.sqrt(pdx * pdx + pdy * pdy);
      if (pdist < POINTER_RADIUS && pdist > 14) {
        cell.vx += (pdx / pdist) * 0.045;
        cell.vy += (pdy / pdist) * 0.045;
      }

      // Speed limit + drag
      var speed = Math.sqrt(cell.vx * cell.vx + cell.vy * cell.vy);
      var maxSpeed = 1.5;
      if (speed > maxSpeed) {
        cell.vx = (cell.vx / speed) * maxSpeed;
        cell.vy = (cell.vy / speed) * maxSpeed;
      }
      cell.vx *= 0.985;
      cell.vy *= 0.985;
      cell.x += cell.vx;
      cell.y += cell.vy;

      // Soft walls
      if (cell.x < 10) cell.vx += 0.08;
      if (cell.x > labW - 10) cell.vx -= 0.08;
      if (cell.y < 10) cell.vy += 0.08;
      if (cell.y > labH - 10) cell.vy -= 0.08;

      cell.energy -= ENERGY_DRAIN + speed * 0.012;
    }

    function cellRadius(cell) {
      return Math.max(2.4, Math.min(7, 2.4 + cell.energy * 0.04));
    }

    function drawLabFrame(now) {
      lctx.clearRect(0, 0, labW, labH);

      // Food: small pulsing seeds
      for (var i = 0; i < foods.length; i++) {
        var f = foods[i];
        var pulse = 1 + Math.sin(now / 420 + f.phase) * 0.25;
        lctx.fillStyle = "rgba(" + fxColors.b + ",.8)";
        lctx.beginPath();
        lctx.arc(f.x, f.y, 2.2 * pulse, 0, Math.PI * 2);
        lctx.fill();
        lctx.fillStyle = "rgba(" + fxColors.b + ",.18)";
        lctx.beginPath();
        lctx.arc(f.x, f.y, 6 * pulse, 0, Math.PI * 2);
        lctx.fill();
      }

      // Cells: glowing organisms, size tied to energy
      for (var j = 0; j < cells.length; j++) {
        var c = cells[j];
        var r = cellRadius(c);
        var color = c.tint < 0.5 ? fxColors.a : fxColors.b;
        var alpha = Math.max(0.35, Math.min(1, c.energy / 80));
        lctx.fillStyle = "rgba(" + color + "," + (alpha * 0.22).toFixed(3) + ")";
        lctx.beginPath();
        lctx.arc(c.x, c.y, r * 2.2, 0, Math.PI * 2);
        lctx.fill();
        lctx.fillStyle = "rgba(" + color + "," + alpha.toFixed(3) + ")";
        lctx.beginPath();
        lctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        lctx.fill();
        lctx.fillStyle = "rgba(255,255,255," + (alpha * 0.5).toFixed(3) + ")";
        lctx.beginPath();
        lctx.arc(c.x - r * 0.3, c.y - r * 0.3, r * 0.3, 0, Math.PI * 2);
        lctx.fill();
      }
    }

    function labTick(now) {
      // Regular food drops keep the ecosystem alive
      if (now - lastFoodSpawn > FOOD_SPAWN_EVERY && foods.length < MAX_FOOD) {
        spawnFood(20 + Math.random() * (labW - 40), 20 + Math.random() * (labH - 40));
        lastFoodSpawn = now;
      }

      for (var i = cells.length - 1; i >= 0; i--) {
        var cell = cells[i];
        updateCell(cell);

        // Eat food on contact
        var r = cellRadius(cell);
        for (var j = foods.length - 1; j >= 0; j--) {
          var f = foods[j];
          var dx = f.x - cell.x;
          var dy = f.y - cell.y;
          if (dx * dx + dy * dy < (r + 4) * (r + 4)) {
            cell.energy += FOOD_ENERGY;
            foods.splice(j, 1);
          }
        }

        // Division when well fed
        if (cell.energy >= SPLIT_ENERGY && cells.length < MAX_CELLS) {
          cell.energy /= 2;
          spawnCell(cell.x + (Math.random() - 0.5) * 8, cell.y + (Math.random() - 0.5) * 8, cell.energy);
          labBirths += 1;
        }

        // Starvation
        if (cell.energy <= 0) {
          cells.splice(i, 1);
        }
      }

      // Never let the dish go completely empty
      if (cells.length === 0) {
        for (var k = 0; k < 3; k++) {
          spawnCell(Math.random() * labW, Math.random() * labH, 60);
        }
      }

      drawLabFrame(now);
      updateLabStats(false);
      labRaf = requestAnimationFrame(labTick);
    }

    function startLab() {
      if (labRunning || prefersReducedMotion) return;
      labRunning = true;
      lastFoodSpawn = performance.now();
      labRaf = requestAnimationFrame(labTick);
    }

    function stopLab() {
      labRunning = false;
      cancelAnimationFrame(labRaf);
    }

    labCanvas.addEventListener("pointermove", function (e) {
      var rect = labCanvas.getBoundingClientRect();
      labPointer.x = e.clientX - rect.left;
      labPointer.y = e.clientY - rect.top;
    });

    labCanvas.addEventListener("pointerleave", function () {
      labPointer.x = -999;
      labPointer.y = -999;
    });

    labCanvas.addEventListener("pointerdown", function (e) {
      var rect = labCanvas.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      for (var i = 0; i < 4; i++) {
        if (foods.length >= MAX_FOOD + FOOD_CLICK_BUFFER) break;
        spawnFood(
          Math.max(8, Math.min(labW - 8, x + (Math.random() - 0.5) * 36)),
          Math.max(8, Math.min(labH - 8, y + (Math.random() - 0.5) * 36))
        );
      }
      updateLabStats(true);
      trackInteraction();
      if (prefersReducedMotion) drawLabFrame(performance.now());
    });

    if (labResetBtn) {
      labResetBtn.addEventListener("click", function () {
        seedLab();
        trackInteraction();
        if (prefersReducedMotion) drawLabFrame(performance.now());
      });
    }

    var labResizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(labResizeTimer);
      labResizeTimer = setTimeout(function () {
        sizeLabCanvas();
        if (prefersReducedMotion) drawLabFrame(performance.now());
      }, 200);
    });

    sizeLabCanvas();
    seedLab();

    if (prefersReducedMotion) {
      // Static snapshot for reduced motion: render once, no animation loop
      drawLabFrame(performance.now());
    } else if ("IntersectionObserver" in window) {
      var labObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) startLab();
          else stopLab();
        });
      }, { threshold: 0 });
      labObserver.observe(labCanvas);
    } else {
      startLab();
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
