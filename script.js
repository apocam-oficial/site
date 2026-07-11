/* ============================================================
   APOCAM | Interações v3 — "Jornada do acolhimento"
   Combinação cinematográfica (estilo alethia.earth):
   · Lenis smooth scroll
   · Hero: logo em partículas (Three.js) + título linha a linha + parallax
   · Rail de capítulos (scroll-spy) + números-fantasma em parallax
   · Manifesto que acende palavra por palavra (scrub)
   · "Como funciona": cena PINADA com cross-fade das 4 etapas + contador
   · Capítulos entrando com fade + escala + translate contínuos
   · Fotos de parceiros em parallax · listas em cascata · botões magnéticos
   Fallbacks: sem WebGL / sem GSAP / prefers-reduced-motion → site estático.
   ============================================================ */
(function () {
  'use strict';

  var docEl = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var hasST = typeof window.ScrollTrigger !== 'undefined';
  var hasLenis = typeof window.Lenis !== 'undefined';
  var hasThree = typeof window.THREE !== 'undefined';

  function webglOK() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  /* ---------------- Lenis: smooth scroll ---------------- */
  var lenis = null;
  if (hasLenis && !reduced) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap && hasST) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var rafLenis = function (t) { lenis.raf(t); requestAnimationFrame(rafLenis); };
      requestAnimationFrame(rafLenis);
    }
  } else if (hasGsap && hasST) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  var header = document.getElementById('siteHeader');

  function scrollToTarget(target) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var offset = -((header ? header.offsetHeight : 72) + 12);
    if (lenis) { lenis.scrollTo(el, { offset: offset, duration: 1.4 }); }
    else { el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); }
  }

  /* ---------------- Menu mobile ---------------- */
  var toggle = document.getElementById('navToggle');
  function closeMenu() {
    if (!document.body.classList.contains('menu-open')) return;
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    if (lenis) lenis.start();
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      if (lenis) { open ? lenis.stop() : lenis.start(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* Âncoras internas */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        closeMenu();
        scrollToTarget(id);
      }
    });
  });

  /* ---------------- Header: estado ao rolar ---------------- */
  function onScrollUpdate() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', y > 24);
  }
  onScrollUpdate();
  window.addEventListener('scroll', onScrollUpdate, { passive: true });
  if (lenis) lenis.on('scroll', onScrollUpdate);

  if (!reduced) docEl.classList.add('anim');

  /* ============================================================
     ANIMAÇÕES COM GSAP / SCROLLTRIGGER
     ============================================================ */
  if (!reduced && hasGsap && hasST) {
    var gsap = window.gsap, ST = window.ScrollTrigger;

    /* ---- Entrada do hero ---- */
    var h1Lines = document.querySelectorAll('.hero h1 .li');
    var intro = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.15 });
    if (h1Lines.length) {
      gsap.set(h1Lines, { yPercent: 115 });
      intro.to(h1Lines, { yPercent: 0, duration: 1.15, stagger: 0.12, overwrite: 'auto' }, 0);
    }
    intro.fromTo('.reveal-hero', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.45);

    /* ---- Hero parallax de saída (foreground mais rápido) ---- */
    var heroSec = document.querySelector('.hero');
    if (heroSec) {
      gsap.to('.hero-inner', {
        yPercent: -12, autoAlpha: 0, ease: 'none',
        scrollTrigger: { trigger: heroSec, start: 'top top', end: 'bottom 28%', scrub: 0.5 }
      });
      gsap.to('.scroll-cue', {
        autoAlpha: 0, ease: 'none',
        scrollTrigger: { trigger: heroSec, start: 'top top', end: '16% top', scrub: true }
      });
    }

    /* ---- Aurora de fundo à deriva (camada lenta) ---- */
    gsap.utils.toArray('.aurora-blob').forEach(function (b, i) {
      gsap.to(b, {
        yPercent: (i % 2 === 0 ? 1 : -1) * (14 + i * 6), xPercent: (i % 2 === 0 ? -1 : 1) * 6, ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.2 }
      });
    });

    /* ---- Números-fantasma em parallax ---- */
    gsap.utils.toArray('.ghost-num').forEach(function (g) {
      var host = g.closest('.chapter');
      gsap.fromTo(g, { yPercent: -9 }, {
        yPercent: 9, ease: 'none',
        scrollTrigger: { trigger: host, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
      });
    });

    /* ---- Reveals gerais (exceto etapas do deck) ---- */
    gsap.utils.toArray('.reveal').forEach(function (el) {
      if (el.closest('#passosDeck')) return;
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    /* ---- Caminhos (participar): stagger ---- */
    var caminhos = document.querySelector('.caminhos');
    if (caminhos) {
      gsap.fromTo(caminhos.children, { opacity: 0, y: 34 }, {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: caminhos, start: 'top 82%', once: true }
      });
    }

    /* ---- Capítulos entrando: fade + escala + translate contínuos ---- */
    gsap.utils.toArray('.chapter').forEach(function (sec) {
      if (sec.id === 'como-funciona') return; /* pinado — não transformar o container */
      var wrap = sec.querySelector(':scope > .container');
      if (!wrap) return;
      gsap.fromTo(wrap, { opacity: 0.35, y: 60, scale: 0.97 }, {
        opacity: 1, y: 0, scale: 1, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top 88%', end: 'top 42%', scrub: 0.5 }
      });
      if (sec.id !== 'acolhimento') {
        gsap.fromTo(wrap, { opacity: 1, y: 0 }, {
          opacity: 0.5, y: -34, ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: sec, start: 'bottom 42%', end: 'bottom 6%', scrub: 0.5 }
        });
      }
    });

    /* ---- Fotos dos parceiros em parallax ---- */
    gsap.utils.toArray('.foto-mask img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -11 }, {
        yPercent: 1, ease: 'none',
        scrollTrigger: { trigger: img.closest('.parceiro'), start: 'top bottom', end: 'bottom top', scrub: 0.8 }
      });
    });

    /* ---- Rail de capítulos: scroll-spy ---- */
    document.querySelectorAll('.rail a[data-rail]').forEach(function (link) {
      var sec = document.getElementById(link.getAttribute('data-rail'));
      if (!sec) return;
      ST.create({
        trigger: sec, start: 'top 55%', end: 'bottom 45%',
        onToggle: function (self) { link.classList.toggle('on', self.isActive); }
      });
    });

    /* ---- Manifesto: acende palavra por palavra ---- */
    var frase = document.getElementById('manifestoFrase');
    if (frase) {
      var words = splitWords(frase);
      if (words.length) {
        gsap.set(words, { opacity: 0.16 });
        gsap.to(words, {
          opacity: 1, ease: 'none', stagger: 0.5,
          scrollTrigger: { trigger: '#manifesto', start: 'top 74%', end: 'top 14%', scrub: 0.4 }
        });
      }
    }

    /* ---- "Como funciona": cena PINADA + cross-fade das etapas ---- */
    setupPassos(gsap, ST);

    /* Recalcular após tudo carregar (fontes, imagens) */
    window.addEventListener('load', function () { ST.refresh(); });

  } else {
    /* ---------------- Fallback sem GSAP / reduzido ---------------- */
    docEl.classList.add('no-gsap');
    var revs = document.querySelectorAll('.reveal');
    if (reduced || !('IntersectionObserver' in window)) {
      revs.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revs.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---- Split de palavras preservando os <em> ---- */
  function splitWords(root) {
    var out = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var parts = ch.nodeValue.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (p === '' ) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); }
            else { var s = document.createElement('span'); s.className = 'w'; s.textContent = p; frag.appendChild(s); out.push(s); }
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) {
          walk(ch);
        }
      });
    })(root);
    return out;
  }

  /* ---- Cena pinada das etapas (desktop) / reveal simples (mobile) ---- */
  function setupPassos(gsap, ST) {
    var pin = document.getElementById('passosPin');
    var deck = document.getElementById('passosDeck');
    if (!pin || !deck || typeof gsap.matchMedia !== 'function') {
      /* sem matchMedia: revela as etapas normalmente */
      if (deck) gsap.fromTo(deck.querySelectorAll('.passo'), { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: deck, start: 'top 82%', once: true }
      });
      return;
    }
    var steps = deck.querySelectorAll('.passo');
    var numEl = document.getElementById('passoNum');
    var ticks = document.querySelectorAll('#passoTicks b');

    function setActive(idx) {
      if (numEl) numEl.textContent = String(idx + 1).padStart(2, '0');
      ticks.forEach(function (b, i) { b.classList.toggle('on', i <= idx); });
    }

    var mm = gsap.matchMedia();

    /* Desktop: trava a cena e faz cross-fade entre as etapas */
    mm.add('(min-width: 1024px)', function () {
      pin.classList.add('is-deck');
      gsap.set(steps, { autoAlpha: 0, y: 42 });
      gsap.set(steps[0], { autoAlpha: 1, y: 0 });
      setActive(0);

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          start: 'center center',
          end: '+=' + ((steps.length - 1) * 620),
          pin: true, scrub: 0.5, anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            var idx = Math.min(steps.length - 1, Math.round(self.progress * (steps.length - 1)));
            setActive(idx);
          }
        }
      });
      for (var i = 1; i < steps.length; i++) {
        tl.to(steps[i - 1], { autoAlpha: 0, y: -42, duration: 0.5 }, i);
        tl.to(steps[i], { autoAlpha: 1, y: 0, duration: 0.5 }, i);
      }

      return function () {
        pin.classList.remove('is-deck');
        gsap.set(steps, { clearProps: 'opacity,visibility,transform' });
      };
    });

    /* Mobile: etapas empilhadas revelam em cascata */
    mm.add('(max-width: 1023px)', function () {
      gsap.fromTo(steps, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: deck, start: 'top 82%', once: true }
      });
      return function () { gsap.set(steps, { clearProps: 'opacity,transform' }); };
    });
  }

  /* ---------------- Botões magnéticos ---------------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      var strength = 16;
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        btn.style.transform = 'translate(' + (x * strength * 0.4).toFixed(1) + 'px,' + (y * strength * 0.35 - 2).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () {
        if (hasGsap) { window.gsap.to(btn, { x: 0, y: 0, clearProps: 'transform', duration: 0.6, ease: 'elastic.out(1,0.45)' }); }
        else { btn.style.transform = ''; }
      });
    });
  }

  /* ================================================================
     HERO 3D: logo da APOCAM formada por partículas (alta definição)
     ================================================================ */
  var LOGO_URI = (typeof window.APOCAM_LOGO_URI === 'string' && window.APOCAM_LOGO_URI.indexOf('data:image') === 0)
    ? window.APOCAM_LOGO_URI : null;

  var canvas = document.getElementById('heroCanvas');
  var hero = document.querySelector('.hero');
  if (canvas && hero && LOGO_URI && hasThree && !reduced && webglOK()) {
    initLogoParticles();
  } else if (hero) {
    hero.classList.add('no-webgl');
  }

  function initLogoParticles() {
    var img = new Image();
    img.onload = function () { try { build(img); } catch (e) { hero.classList.add('no-webgl'); } };
    img.onerror = function () { hero.classList.add('no-webgl'); };
    img.src = LOGO_URI;

    function build(image) {
      var THREE = window.THREE;
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
      camera.position.z = 3.2;

      var group = new THREE.Group();
      scene.add(group);

      function circleTexture() {
        var cv = document.createElement('canvas');
        cv.width = cv.height = 64;
        var cx = cv.getContext('2d');
        var g = cx.createRadialGradient(32, 32, 0, 32, 32, 30);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.75, 'rgba(255,255,255,1)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        cx.fillStyle = g;
        cx.beginPath(); cx.arc(32, 32, 30, 0, Math.PI * 2); cx.fill();
        var tex = new THREE.Texture(cv);
        tex.needsUpdate = true;
        return tex;
      }
      var dotTex = circleTexture();

      function liftColor(r, g, b) {
        var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        var d = mx - mn, l = (mx + mn) / 2, h = 0;
        var sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
        if (d !== 0) {
          if (mx === r) h = ((g - b) / d) % 6;
          else if (mx === g) h = (b - r) / d + 2;
          else h = (r - g) / d + 4;
          h *= 60; if (h < 0) h += 360;
        }
        l = Math.max(l, 0.40);
        sat = Math.max(sat, 0.35);
        var c = (1 - Math.abs(2 * l - 1)) * sat;
        var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        var m = l - c / 2, rr = 0, gg = 0, bb = 0;
        if (h < 60) { rr = c; gg = x; }
        else if (h < 120) { rr = x; gg = c; }
        else if (h < 180) { gg = c; bb = x; }
        else if (h < 240) { gg = x; bb = c; }
        else if (h < 300) { rr = x; bb = c; }
        else { rr = c; bb = x; }
        return [rr + m, gg + m, bb + m];
      }

      var c2d = document.createElement('canvas');
      c2d.width = image.width; c2d.height = image.height;
      var ctx = c2d.getContext('2d');
      ctx.drawImage(image, 0, 0);
      var data = ctx.getImageData(0, 0, c2d.width, c2d.height).data;

      var W = c2d.width, H = c2d.height;
      var worldW = 2.0;
      var s = worldW / W;

      var target = [], colors = [];
      for (var py = 0; py < H; py++) {
        for (var px = 0; px < W; px++) {
          var i4 = (py * W + px) * 4;
          if (data[i4 + 3] > 110) {
            var jx = (Math.random() - 0.5) * s * 0.4;
            var jy = (Math.random() - 0.5) * s * 0.4;
            target.push((px - W / 2) * s + jx, -(py - H / 2) * s + jy, (Math.random() - 0.5) * 0.05);
            var lifted = liftColor(data[i4] / 255, data[i4 + 1] / 255, data[i4 + 2] / 255);
            colors.push(lifted[0], lifted[1], lifted[2]);
          }
        }
      }
      var N = target.length / 3;
      var pos = new Float32Array(target.length);
      var start = new Float32Array(target.length);
      for (var i = 0; i < N; i++) {
        var th = Math.random() * Math.PI * 2;
        var ph = Math.acos(2 * Math.random() - 1);
        var rr = 1.4 + Math.random() * 1.6;
        start[i * 3]     = target[i * 3] + rr * Math.sin(ph) * Math.cos(th);
        start[i * 3 + 1] = target[i * 3 + 1] + rr * Math.sin(ph) * Math.sin(th);
        start[i * 3 + 2] = target[i * 3 + 2] + rr * Math.cos(ph) * 0.6;
        pos[i * 3] = start[i * 3]; pos[i * 3 + 1] = start[i * 3 + 1]; pos[i * 3 + 2] = start[i * 3 + 2];
      }

      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
      var mat = new THREE.PointsMaterial({
        size: 0.016, vertexColors: true, transparent: true, opacity: 0,
        map: dotTex, alphaTest: 0.35,
        depthWrite: false, sizeAttenuation: true
      });
      var leafPts = new THREE.Points(geo, mat);
      group.add(leafPts);

      var dustN = 240;
      var dPos = new Float32Array(dustN * 3);
      var dCol = new Float32Array(dustN * 3);
      var cGold = new THREE.Color('#DCA865'), cTeal = new THREE.Color('#7fd4d1'), tmp = new THREE.Color();
      for (var d = 0; d < dustN; d++) {
        var rr2 = 1.5 + Math.random() * 2.6;
        var th2 = Math.random() * Math.PI * 2;
        var ph2 = Math.acos(2 * Math.random() - 1);
        dPos[d * 3] = rr2 * Math.sin(ph2) * Math.cos(th2);
        dPos[d * 3 + 1] = rr2 * Math.sin(ph2) * Math.sin(th2) * 0.7;
        dPos[d * 3 + 2] = rr2 * Math.cos(ph2) * 0.5 - 0.4;
        tmp.copy(Math.random() < 0.6 ? cGold : cTeal);
        dCol[d * 3] = tmp.r; dCol[d * 3 + 1] = tmp.g; dCol[d * 3 + 2] = tmp.b;
      }
      var dGeo = new THREE.BufferGeometry();
      dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
      dGeo.setAttribute('color', new THREE.BufferAttribute(dCol, 3));
      var dMat = new THREE.PointsMaterial({
        size: 0.015, vertexColors: true, transparent: true, opacity: 0,
        map: dotTex, alphaTest: 0.2,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      var dust = new THREE.Points(dGeo, dMat);
      scene.add(dust);

      var worldH = worldW * (H / W);
      var FOVr = camera.fov * Math.PI / 180;
      var hit = document.getElementById('logoHit');
      var wide = true, baseK = 0.78, baseY = 0.02, baseX = 1.02, opTarget = 0.96;
      function layout() {
        var w = hero.clientWidth, h = hero.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        var visH = 2 * Math.tan(FOVr / 2) * camera.position.z;
        var visW = visH * camera.aspect;
        wide = w / h > 1.05;
        leafPts.visible = true;
        if (wide) {
          var availW = visW * 0.40, availH = visH * 0.78;
          baseK = Math.min(availW / worldW, availH / worldH, 0.95);
          baseX = visW * 0.265;
          baseY = 0.02;
          opTarget = 0.96;
        } else {
          var winH = window.innerHeight || h;
          var headerEl = document.getElementById('siteHeader');
          var headerPx = headerEl ? headerEl.offsetHeight : 72;
          var bandTop = headerPx + winH * 0.04;
          var bandH = winH * 0.30;
          var availW2 = visW * 0.74, availH2 = visH * (bandH / h);
          baseK = Math.min(availW2 / worldW, availH2 / worldH);
          baseX = 0;
          baseY = visH * (0.5 - (bandTop + bandH / 2) / h);
          opTarget = 0.94;
        }
        group.position.x = baseX;
        group.position.y = baseY;
        group.scale.set(baseK, baseK, baseK);
        if (hit) {
          var pw = w * (worldW * baseK / visW) * 1.18;
          var ph3 = h * (worldH * baseK / visH) * 1.18;
          var pxc = w * (0.5 + baseX / visW);
          var pyc = h * (0.5 - baseY / visH);
          hit.style.display = 'block';
          hit.style.width = pw.toFixed(0) + 'px';
          hit.style.height = ph3.toFixed(0) + 'px';
          hit.style.left = (pxc - pw / 2).toFixed(0) + 'px';
          hit.style.top = (pyc - ph3 / 2).toFixed(0) + 'px';
        }
      }
      layout();
      var resizeT = null;
      window.addEventListener('resize', function () {
        layout();
        clearTimeout(resizeT);
        resizeT = setTimeout(function () {
          if (hasGsap) { window.gsap.to(mat, { opacity: opTarget, duration: 0.4, overwrite: 'auto' }); }
          else { mat.opacity = opTarget; }
        }, 120);
      });

      var dragging = false, userY = 0, userX = 0, velY = 0, velX = 0;
      if (hit) {
        var lastPX = 0, lastPY = 0;
        hit.addEventListener('pointerdown', function (e) {
          dragging = true;
          lastPX = e.clientX; lastPY = e.clientY;
          velY = 0; velX = 0;
          try { hit.setPointerCapture(e.pointerId); } catch (err) {}
          hit.classList.add('arrastando');
          kick();
        });
        hit.addEventListener('pointermove', function (e) {
          if (!dragging) return;
          var dx = (e.clientX - lastPX) / Math.max(1, hero.clientWidth);
          var dy = (e.clientY - lastPY) / Math.max(1, hero.clientHeight);
          lastPX = e.clientX; lastPY = e.clientY;
          userY += dx * 5;
          userX = Math.max(-0.7, Math.min(0.7, userX + dy * 3));
          velY = dx * 5;
          velX = dy * 3;
        });
        var soltar = function () { dragging = false; hit.classList.remove('arrastando'); };
        hit.addEventListener('pointerup', soltar);
        hit.addEventListener('pointercancel', soltar);
      }

      var mx = 0, my = 0, tmx = 0, tmy = 0;
      if (finePointer) {
        window.addEventListener('pointermove', function (e) {
          tmx = (e.clientX / window.innerWidth) * 2 - 1;
          tmy = (e.clientY / window.innerHeight) * 2 - 1;
        }, { passive: true });
      }

      if (hasGsap) {
        window.gsap.to(mat, { opacity: opTarget, duration: 1.6, ease: 'power2.out', delay: 0.3 });
        window.gsap.to(dMat, { opacity: 0.5, duration: 2.4, ease: 'power2.out', delay: 0.8 });
      } else {
        mat.opacity = opTarget; dMat.opacity = 0.5;
      }

      var formed = 0;
      var inView = true, rafId = null;
      var clock = new THREE.Clock();
      var posAttr = geo.getAttribute('position');

      function frame() {
        rafId = null;
        if (!inView || document.hidden) return;
        var t = clock.getElapsedTime();

        if (formed < 1) {
          formed = Math.min(1, formed + 0.016);
          var e = 1 - Math.pow(1 - formed, 3);
          for (var i = 0; i < N; i++) {
            pos[i * 3]     = start[i * 3]     + (target[i * 3]     - start[i * 3])     * e;
            pos[i * 3 + 1] = start[i * 3 + 1] + (target[i * 3 + 1] - start[i * 3 + 1]) * e;
            pos[i * 3 + 2] = start[i * 3 + 2] + (target[i * 3 + 2] - start[i * 3 + 2]) * e;
          }
          posAttr.needsUpdate = true;
        }

        mx += (tmx - mx) * 0.045;
        my += (tmy - my) * 0.045;
        if (!dragging) {
          userY += velY; velY *= 0.94;
          userX += velX; velX *= 0.94;
          userX *= 0.985;
        }
        group.rotation.y = userY + Math.sin(t * 0.14) * 0.08 + mx * 0.24;
        group.rotation.x = Math.max(-1, Math.min(1, userX + Math.cos(t * 0.11) * 0.04 + my * 0.12));
        var breathe = 1 + Math.sin(t * 0.5) * 0.014;
        group.scale.set(baseK * breathe, baseK * breathe, baseK * breathe);
        group.position.y = baseY + Math.sin(t * 0.4) * 0.03;
        dust.rotation.y = t * 0.02;
        dust.rotation.x = Math.sin(t * 0.05) * 0.06;
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(frame);
      }
      function kick() { if (!rafId) rafId = requestAnimationFrame(frame); }

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          inView = entries[0].isIntersecting;
          if (inView) kick();
        }, { threshold: 0.02 }).observe(hero);
      }
      document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
      kick();
    }
  }

  /* ---------------- Formulário de acolhimento (Web3Forms) ---------------- */
  var form = document.getElementById('acolhimentoForm');
  var feedback = document.getElementById('formFeedback');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var key = form.querySelector('input[name="access_key"]').value;

      if (key.indexOf('SUA-CHAVE') !== -1) {
        feedback.className = 'form-feedback err';
        feedback.textContent = 'Formulário ainda não configurado: gere uma chave gratuita em web3forms.com e substitua no código para ativar o envio.';
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.textContent = 'Enviando...';
      btn.disabled = true;

      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.success) {
            feedback.className = 'form-feedback ok';
            feedback.textContent = 'Recebemos sua mensagem com carinho. Em breve nossa equipe entra em contato.';
            form.reset();
          } else {
            feedback.className = 'form-feedback err';
            feedback.textContent = 'Não foi possível enviar agora. Tente novamente ou fale com a gente pelo WhatsApp.';
          }
        })
        .catch(function () {
          feedback.className = 'form-feedback err';
          feedback.textContent = 'Não foi possível enviar agora. Tente novamente ou fale com a gente pelo WhatsApp.';
        })
        .finally(function () {
          btn.textContent = original;
          btn.disabled = false;
        });
    });
  }
})();
