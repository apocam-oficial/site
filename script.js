/* ============================================================
   APOCAM | Interações premium v2.2
   Three.js: LOGO da APOCAM formada por partículas em alta
   definição (≈19 mil pontos amostrados da marca real — os dados
   da imagem ficam em logo-data.js, gerado automaticamente)
   GSAP ScrollTrigger · Lenis · tilt · magnetic
   Fallbacks: sem WebGL/libs/movimento → site estático completo.
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

  function scrollToTarget(target) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var offset = -(document.getElementById('siteHeader').offsetHeight + 10);
    if (lenis) { lenis.scrollTo(el, { offset: offset, duration: 1.4 }); }
    else { el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); }
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

  /* ---------------- Header: estado + barra de progresso ---------------- */
  var header = document.getElementById('siteHeader');
  var progress = document.getElementById('scrollProgress');
  function onScrollUpdate() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('scrolled', y > 24);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    }
  }
  onScrollUpdate();
  window.addEventListener('scroll', onScrollUpdate, { passive: true });
  if (lenis) lenis.on('scroll', onScrollUpdate);

  /* ---------------- Menu mobile fullscreen ---------------- */
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

  /* ---------------- Animações de entrada / reveal ---------------- */
  if (!reduced) docEl.classList.add('anim');

  if (!reduced && hasGsap && hasST) {
    var gsap = window.gsap, ST = window.ScrollTrigger;

    /* Entrada do hero — estado inicial 100% via JS (nunca fica invisível) */
    var h1Lines = document.querySelectorAll('.hero h1 .li');
    var intro = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.15 });
    if (h1Lines.length) {
      gsap.set(h1Lines, { yPercent: 112 });
      intro.to(h1Lines, { yPercent: 0, duration: 1.15, stagger: 0.12, overwrite: 'auto' }, 0);
    }
    intro.fromTo('.reveal-hero', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.45);

    /* Reveals gerais (itens de grade têm stagger próprio abaixo) */
    gsap.utils.toArray('.reveal').forEach(function (el) {
      if (el.parentElement && (el.parentElement.classList.contains('grid-3') || el.parentElement.classList.contains('parceiros-grid'))) return;
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });

    /* Stagger interno de grades */
    gsap.utils.toArray('.grid-3, .parceiros-grid').forEach(function (grid) {
      var items = grid.children;
      gsap.fromTo(items, { opacity: 0, y: 34 }, {
        opacity: 1, y: 0, duration: 0.85, stagger: 0.09, ease: 'power3.out',
        scrollTrigger: { trigger: grid, start: 'top 84%', once: true }
      });
    });

    /* Timeline: linha desenha com o scroll + etapas acendem */
    var tl = document.getElementById('timeline');
    var tlProgress = document.getElementById('tlProgress');
    if (tl && tlProgress) {
      gsap.fromTo(tlProgress, { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: tl, start: 'top 72%', end: 'bottom 55%', scrub: 0.6 }
      });
      gsap.utils.toArray('.tl-step').forEach(function (step) {
        gsap.fromTo(step, { opacity: 0, x: -26 }, {
          opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: step, start: 'top 80%', once: true }
        });
        ST.create({
          trigger: step, start: 'top 66%', end: 'bottom 40%',
          onEnter: function () { step.classList.add('active'); },
          onLeaveBack: function () { step.classList.remove('active'); }
        });
      });
    }
  } else {
    /* Fallback sem GSAP: IntersectionObserver simples */
    docEl.classList.add('no-gsap');
    var els = document.querySelectorAll('.reveal');
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      document.querySelectorAll('.tl-step').forEach(function (s) { s.classList.add('active'); });
      var p = document.getElementById('tlProgress');
      if (p) p.style.transform = 'scaleY(1)';
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            if (e.target.classList.contains('tl-step')) e.target.classList.add('active');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      els.forEach(function (el) { io.observe(el); });
      document.querySelectorAll('.tl-step').forEach(function (s) { io.observe(s); });
      var p2 = document.getElementById('tlProgress');
      if (p2) p2.style.transform = 'scaleY(1)';
    }
  }

  /* ---------------- Tilt 3D nos cards de parceiros ---------------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var rect = null, raf = null, rx = 0, ry = 0, tx = 0, ty = 0;
      function loop() {
        rx += (tx - rx) * 0.12; ry += (ty - ry) * 0.12;
        card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(3) + 'deg) rotateY(' + ry.toFixed(3) + 'deg)';
        if (Math.abs(tx - rx) > 0.01 || Math.abs(ty - ry) > 0.01) { raf = requestAnimationFrame(loop); }
        else raf = null;
      }
      card.addEventListener('pointerenter', function () { rect = card.getBoundingClientRect(); });
      card.addEventListener('pointermove', function (e) {
        if (!rect) rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        tx = (0.5 - py) * 6;
        ty = (px - 0.5) * 6;
        card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener('pointerleave', function () {
        tx = 0; ty = 0; rect = null;
        if (!raf) raf = requestAnimationFrame(loop);
      });
    });

    /* Brilho que segue o mouse nos cards comuns */
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }

  /* ---------------- Botões magnéticos ---------------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      var strength = 18;
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
     A miniatura da marca vem de logo-data.js (window.APOCAM_LOGO_URI),
     amostrada pixel a pixel → ≈19.000 partículas com as cores reais.
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

      /* Textura circular → partículas redondas */
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

      /* Mantém o MATIZ exato da logo; só garante luminosidade mínima
         para que os tons escuros (folhas azul-petróleo) leiam certo
         sobre o fundo escuro do hero, sem virar cinza. */
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

      /* ----- Amostragem dos pixels da logo (alta definição) ----- */
      var c2d = document.createElement('canvas');
      c2d.width = image.width; c2d.height = image.height;
      var ctx = c2d.getContext('2d');
      ctx.drawImage(image, 0, 0);
      var data = ctx.getImageData(0, 0, c2d.width, c2d.height).data;

      var W = c2d.width, H = c2d.height;
      var worldW = 2.0;                 /* largura da logo no mundo 3D */
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
      group.add(new THREE.Points(geo, mat));

      /* ----- Poeira dourada/verde-água ambiente ----- */
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

      /* ----- Posição/tamanho 100% responsivos -----
         Calcula a área visível da câmera e encaixa o símbolo:
         · telas largas → metade direita, sem invadir a coluna de texto
         · telas estreitas/retrato → faixa superior reservada pelo CSS */
      var worldH = worldW * (H / W);
      var FOVr = camera.fov * Math.PI / 180;
      var wide = true, baseK = 0.78, baseY = 0.02, baseX = 1.02, opTarget = 0.96;
      function layout() {
        var w = hero.clientWidth, h = hero.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        var visH = 2 * Math.tan(FOVr / 2) * camera.position.z; /* altura visível em z=0 */
        var visW = visH * camera.aspect;
        wide = w / h > 1.05;
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
          var bandTop = headerPx + winH * 0.04;   /* faixa: logo abaixo do header */
          var bandH = winH * 0.30;
          var availW2 = visW * 0.74, availH2 = visH * (bandH / h);
          baseK = Math.min(availW2 / worldW, availH2 / worldH);
          baseX = 0;
          baseY = visH * (0.5 - (bandTop + bandH / 2) / h);
          opTarget = 0.92;
        }
        group.position.x = baseX;
        group.position.y = baseY;
        group.scale.set(baseK, baseK, baseK);
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

      /* ----- Mouse parallax ----- */
      var mx = 0, my = 0, tmx = 0, tmy = 0;
      if (finePointer) {
        window.addEventListener('pointermove', function (e) {
          tmx = (e.clientX / window.innerWidth) * 2 - 1;
          tmy = (e.clientY / window.innerHeight) * 2 - 1;
        }, { passive: true });
      }

      /* ----- Entrada ----- */
      if (hasGsap) {
        window.gsap.to(mat, { opacity: opTarget, duration: 1.6, ease: 'power2.out', delay: 0.3 });
        window.gsap.to(dMat, { opacity: 0.5, duration: 2.4, ease: 'power2.out', delay: 0.8 });
      } else {
        mat.opacity = opTarget; dMat.opacity = 0.5;
      }

      /* ----- Loop: formação + flutuação (pausa fora da tela/aba) ----- */
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
        group.rotation.y = Math.sin(t * 0.14) * 0.08 + mx * 0.24;
        group.rotation.x = Math.cos(t * 0.11) * 0.04 + my * 0.12;
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
