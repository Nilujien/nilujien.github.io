(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
            ctx.strokeStyle = "rgba(110,168,254," + (0.16 * (1 - dist / 116)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = "rgba(192,139,255,.55)";
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
})();
