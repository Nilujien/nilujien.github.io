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
})();
