/* ---- Menu mobile ---- */
(function(){
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  if(toggle && nav){
    toggle.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('.nav-links a').forEach(function(link){
      link.addEventListener('click', function(){
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
      });
    });
  }
})();

/* ---- Sombra no header ao rolar ---- */
(function(){
  var header = document.getElementById('siteHeader');
  if(!header) return;
  var onScroll = function(){ header.classList.toggle('scrolled', window.scrollY > 12); };
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
})();

/* ---- Revelar elementos ao entrar na tela ---- */
(function(){
  var els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window) || !els.length){
    els.forEach(function(el){ el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
  els.forEach(function(el){ io.observe(el); });
})();

/* ---- Formulário de acolhimento (Web3Forms) ---- */
(function(){
  var form = document.getElementById('acolhimentoForm');
  var feedback = document.getElementById('formFeedback');
  if(!form) return;

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var key = form.querySelector('input[name="access_key"]').value;

    // Se a chave ainda não foi configurada, avisa sem tentar enviar.
    if(key.indexOf('SUA-CHAVE') !== -1){
      feedback.className = 'form-feedback err';
      feedback.textContent = 'Formulário ainda não configurado: gere uma chave gratuita em web3forms.com e substitua no código para ativar o envio.';
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    var original = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    fetch(form.action, {
      method:'POST',
      headers:{'Accept':'application/json'},
      body:new FormData(form)
    })
    .then(function(r){ return r.json(); })
    .then(function(data){
      if(data.success){
        feedback.className = 'form-feedback ok';
        feedback.textContent = 'Recebemos sua mensagem com carinho. Em breve nossa equipe entra em contato.';
        form.reset();
      }else{
        feedback.className = 'form-feedback err';
        feedback.textContent = 'Não foi possível enviar agora. Tente novamente ou fale com a gente pelo WhatsApp.';
      }
    })
    .catch(function(){
      feedback.className = 'form-feedback err';
      feedback.textContent = 'Não foi possível enviar agora. Tente novamente ou fale com a gente pelo WhatsApp.';
    })
    .finally(function(){
      btn.textContent = original;
      btn.disabled = false;
    });
  });
})();
