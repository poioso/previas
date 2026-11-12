/* ViverClin: movimento da página.
   Efeitos da biblioteca horizonx: 01 título, 02 botões, 04 frase que acende e entradas em lote,
   05 passos com trilho, 06 faixa de avaliações, 07 cartões com brilho, 08 colunas de fotos.
   Mais o seletor "Sou empresa / Sou paciente", que troca a mensagem pronta, o texto e o tema.
   Sem GSAP ou com "reduzir movimento", tudo aparece no estado final. */
(function () {
  var local = location.protocol === 'file:';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = matchMedia('(hover: hover)').matches;
  var temGsap = typeof window.gsap !== 'undefined';
  var mexe = temGsap && !reduce;
  var WA = 'https://wa.me/5573988489978';
  var raiz = document.documentElement;
  if (!mexe) raiz.classList.remove('js-movimento');

  // Aberto com dois cliques (file://): imagens carregam direto.
  if (local) document.querySelectorAll('img[loading]').forEach(function (i) { i.loading = 'eager'; });
  // Efeito 07: o brilho some quando a foto já estava pronta.
  document.querySelectorAll('.thumb .pic').forEach(function (i) { if (i.complete && i.naturalWidth) i.parentNode.classList.add('loaded'); });

  /* ---------- Seletor empresa / paciente ---------- */
  var texto = document.querySelector('.zap-texto');
  var botoes = [].slice.call(document.querySelectorAll('.seletor button'));
  var digitando = null;
  function linkWA(msg) { return WA + '?text=' + encodeURIComponent(msg); }
  function digitar(msg) {
    if (digitando) digitando.kill();
    if (!mexe) { texto.textContent = msg; return; }
    var obj = { n: 0 };
    texto.textContent = '';
    digitando = gsap.to(obj, { n: msg.length, duration: Math.min(2.6, msg.length * 0.024), ease: 'none', onUpdate: function () { texto.textContent = msg.slice(0, Math.round(obj.n)); } });
  }
  function escolher(publico, animar) {
    raiz.setAttribute('data-publico', publico);
    botoes.forEach(function (b) { b.setAttribute('aria-checked', b.dataset.publico === publico ? 'true' : 'false'); });
    var msg = texto.getAttribute('data-msg-' + publico);
    document.querySelectorAll('[data-wa="principal"]').forEach(function (a) { a.href = linkWA(msg); });
    document.querySelector('meta[name="theme-color"]').content = publico === 'empresa' ? '#1c2156' : '#ffffff';
    if (animar) digitar(msg); else texto.textContent = msg;
    if (animar && mexe) {
      gsap.fromTo('.conversa .lead [data-so="' + publico + '"]', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .7, ease: 'expo.out' });
      if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 50);
    }
  }
  botoes.forEach(function (b, k) {
    b.addEventListener('click', function () { if (b.getAttribute('aria-checked') !== 'true') escolher(b.dataset.publico, true); });
    b.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault(); var o = botoes[1 - k]; o.focus(); escolher(o.dataset.publico, true);
    });
  });
  escolher('empresa', false);

  /* ---------- Horário real (Itabuna, UTC-3): marca hoje e diz se está aberto ---------- */
  var agora = new Date(Date.now() - 3 * 3600e3), dia = agora.getUTCDay(), h = agora.getUTCHours() + agora.getUTCMinutes() / 60;
  document.querySelectorAll('.semana tr').forEach(function (tr) { if (tr.dataset.d.split(',').indexOf(String(dia)) > -1) tr.classList.add('hoje'); });
  var util = dia >= 1 && dia <= 5, aberto = util && ((h >= 6 && h < 12) || (h >= 14 && h < 17));
  var st = document.querySelector('.agora');
  if (st) {
    var t = aberto ? 'Aberto agora · segunda a sexta, das 6h às 12h e das 14h às 17h'
      : (util && h >= 12 && h < 14) ? 'Intervalo de almoço · reabre às 14h'
      : 'Fechado agora · segunda a sexta, das 6h às 12h e das 14h às 17h';
    st.innerHTML = '<i></i>' + t; st.classList.toggle('fechado', !aberto);
  }

  /* ---------- Efeito 06: avaliações com texto do Google, nas palavras de cada pessoa ---------- */
  var R = [
    ['Ótimo atendimento, e colaboradores bem educados.', 'Rogério Muniz', 'uma semana atrás'],
    ['Muito boa a experiência, atendimento, pró-ativo, e acolhedor.', 'Márcio Souza Gomes', 'um mês atrás'],
    ['Muito bom atendimento.', 'Silmar Souza', 'uma semana atrás']
  ];
  var estrela = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3 6.6 7.2.7-5.4 4.9 1.6 7.1L12 17.6 5.6 21.3l1.6-7.1L1.8 9.3 9 8.6Z"/></svg>';
  var trilha = document.querySelector('.trilha');
  if (trilha) {
    var um = function (r, oculto) {
      return '<figure class="aval"' + (oculto ? ' aria-hidden="true"' : '') + '><div class="estrelas" role="img" aria-label="5 estrelas">' + estrela + estrela + estrela + estrela + estrela + '</div><p>“' + r[0] + '”</p><b>' + r[1] + '</b><small>' + r[2] + '</small></figure>';
    };
    var html = '';
    for (var v = 0; v < 4; v++) R.forEach(function (r) { html += um(r, v > 0); });
    trilha.innerHTML = html;
    var faixa = document.querySelector('[data-faixa]');
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { faixa.classList.toggle('parada', !es[0].isIntersecting); }).observe(faixa);
  }

  /* ---------- Efeito 02: letras que rolam nos botões ---------- */
  if (mexe && canHover) document.querySelectorAll('[data-roll]').forEach(function (el) {
    var labels = el.querySelectorAll('.label');
    var partes = [];
    labels.forEach(function (label) {
      var txt = label.textContent;
      label.setAttribute('aria-label', txt);
      label.innerHTML = txt.split('').map(function (c) {
        return c === ' ' ? '<span class="roll-space"></span>' : '<span class="roll-mask" aria-hidden="true"><span class="roll-front">' + c + '</span><span class="roll-back">' + c + '</span></span>';
      }).join('');
    });
    var to = function (y) { gsap.to(el.querySelectorAll('.roll-front, .roll-back'), { yPercent: y, duration: .6, ease: 'expo.out', stagger: .02, overwrite: true }); };
    el.addEventListener('mouseenter', function () { to(-100); });
    el.addEventListener('mouseleave', function () { to(0); });
    el.addEventListener('focus', function () { to(-100); });
    el.addEventListener('blur', function () { to(0); });
  });

  /* ---------- Efeito 05: passos com trilho ---------- */
  var passos = [].slice.call(document.querySelectorAll('.passo'));
  var cenas = [].slice.call(document.querySelectorAll('.cena'));
  var cheio = document.querySelector('.trilho-cheio');
  var atual = -1, timer = null, naTela = false;
  function ir(i) {
    if (timer) timer.kill();
    var antes = atual; atual = i;
    passos.forEach(function (p, k) {
      p.classList.toggle('on', k === i); p.classList.toggle('done', k < i);
      p.querySelector('button').setAttribute('aria-expanded', k === i ? 'true' : 'false');
      if (temGsap) gsap.set(p.querySelector('.barra i'), { scaleX: 0 });
    });
    if (!mexe) {
      cheio.style.transform = 'scaleY(' + (i + .5) / passos.length + ')';
      cenas.forEach(function (c, k) { c.style.visibility = k === i ? 'visible' : 'hidden'; c.style.opacity = k === i ? 1 : 0; });
      return;
    }
    gsap.to(cheio, { scaleY: (i + .5) / passos.length, duration: .8, ease: 'expo.out' });
    if (antes > -1 && antes !== i) gsap.to(cenas[antes], { autoAlpha: 0, y: -10, duration: .3, ease: 'power2.in' });
    gsap.fromTo(cenas[i], { autoAlpha: 0, y: 14, scale: .97 }, { autoAlpha: 1, y: 0, scale: 1, duration: .7, ease: 'expo.out', delay: antes > -1 ? .15 : 0 });
    timer = gsap.to(passos[i].querySelector('.barra i'), { scaleX: 1, duration: 5, ease: 'none', onComplete: function () { ir((i + 1) % passos.length); } });
    if (!naTela) timer.pause();
  }
  passos.forEach(function (p, k) { p.querySelector('button').addEventListener('click', function () { ir(k); }); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { naTela = es[0].isIntersecting; if (timer) naTela ? timer.resume() : timer.pause(); }).observe(document.querySelector('.passos-grade'));
  ir(0);

  if (!mexe) return;

  /* ---------- Efeito 01: título com letras que sobem ---------- */
  var h1 = document.querySelector('[data-split]');
  var frase = h1.textContent.trim();
  h1.setAttribute('aria-label', frase);
  h1.innerHTML = frase.split(' ').map(function (w) {
    return '<span class="word" aria-hidden="true">' + w.split('').map(function (c) { return '<span class="char">' + c + '</span>'; }).join('') + '</span>';
  }).join(' ');
  var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.fromTo('.conversa .seletor', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .7 })
    .fromTo(h1.querySelectorAll('.char'),
      { opacity: 0, yPercent: function () { return gsap.utils.random(60, 110); }, rotate: function () { return gsap.utils.random(-12, 12); } },
      { opacity: 1, yPercent: 0, rotate: 0, duration: 1.1, stagger: .018 }, '<.1')
    .fromTo('.conversa .lead, .conversa .acoes, .conversa .fatos', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .8, stagger: .08 }, '-=.8')
    .fromTo('.conversa-cena', { opacity: 0, scale: .94 }, { opacity: 1, scale: 1, duration: 1.2 }, '-=.9')
    .fromTo('.zap', { y: 30 }, { y: 0, duration: 1 }, '<.2')
    .add(function () { digitar(texto.getAttribute('data-msg-' + raiz.getAttribute('data-publico'))); }, '-=.6');

  if (!window.ScrollTrigger) { gsap.set('[data-rev]', { opacity: 1 }); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Efeito 04: frase que acende com a rolagem ---------- */
  var lit = document.querySelector('[data-lit]');
  var marcar = ['ASO', 'consulta'];
  lit.innerHTML = lit.textContent.trim().split(' ').map(function (w) {
    var limpo = w.replace(/[.,]/g, '');
    return '<span class="w' + (marcar.indexOf(limpo) > -1 ? ' marcada' : '') + '">' + w + '</span>';
  }).join(' ');
  gsap.to(lit.querySelectorAll('.w'), { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: lit, start: 'top 80%', end: 'bottom 45%', scrub: .6 } });

  /* ---------- Entradas em lote (efeito 04), na ordem da página ---------- */
  ScrollTrigger.batch('[data-rev]', {
    once: true, start: 'top 88%',
    onEnter: function (els) { gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .9, ease: 'expo.out', stagger: .08 }); }
  });
})();
