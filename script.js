(function () {
  "use strict";

  var header = document.getElementById("siteHeader");
  var nav = document.getElementById("navLinks");
  var toggle = document.getElementById("navToggle");
  var mobileActionBar = document.getElementById("mobileActionBar");
  var footer = document.querySelector(".site-footer");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function updateHeader() {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 18);
    }

    if (mobileActionBar) {
      var footerIsNear = footer && footer.getBoundingClientRect().top < window.innerHeight * 0.72;
      var shouldShow = window.innerWidth <= 860 && window.scrollY > Math.min(520, window.innerHeight * 0.72) && !footerIsNear;
      mobileActionBar.classList.toggle("is-visible", shouldShow);
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  function closeMenu() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("menu-open");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var willOpen = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));
      toggle.setAttribute("aria-label", willOpen ? "Fechar menu" : "Abrir menu");
      document.body.classList.toggle("menu-open", willOpen);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080) closeMenu();
      updateHeader();
    });
  }

  var revealItems = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav-links a[href^='#']");
  if ("IntersectionObserver" in window && navLinks.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          var current = link.getAttribute("href") === "#" + entry.target.id;
          if (current) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, {
      rootMargin: "-34% 0px -58% 0px",
      threshold: 0
    });

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  var parallax = document.querySelector("[data-parallax] img");
  if (parallax && !reduceMotion && window.matchMedia("(min-width: 861px)").matches) {
    var ticking = false;

    function updateParallax() {
      var rect = parallax.parentElement.getBoundingClientRect();
      var viewport = window.innerHeight;
      var progress = (viewport - rect.top) / (viewport + rect.height);
      var offset = Math.max(-7, Math.min(7, (progress - 0.5) * 14));
      parallax.style.transform = "translateY(" + (-5 + offset).toFixed(2) + "%)";
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    updateParallax();
  }

  document.querySelectorAll(".faq details").forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      document.querySelectorAll(".faq details").forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  var form = document.getElementById("acolhimentoForm");
  var feedback = document.getElementById("formFeedback");

  function showFeedback(type, message) {
    if (!feedback) return;
    feedback.className = "form-feedback " + type;
    feedback.textContent = message;
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var keyField = form.querySelector("input[name='access_key']");
      var key = keyField ? keyField.value : "";
      if (!key || key.indexOf("SUA-CHAVE") !== -1) {
        showFeedback("err", "O formulário ainda está em configuração. Por enquanto, fale pelo WhatsApp no número (61) 99512-7355.");
        return;
      }

      var submitButton = form.querySelector("button[type='submit']");
      var originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";

      fetch(form.action, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Falha no envio");
          return response.json();
        })
        .then(function (data) {
          if (!data.success) throw new Error("Falha no envio");
          form.reset();
          showFeedback("ok", "Recebemos seu pedido de contato. A equipe da APOCAM retornará assim que possível.");
        })
        .catch(function () {
          showFeedback("err", "Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp no número (61) 99512-7355.");
        })
        .finally(function () {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        });
    });
  }
})();
