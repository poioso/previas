/* Oral Centter: movimento da página. Sem GSAP ou com "reduzir movimento", tudo aparece no estado final. */
(function () {
  var local = location.protocol === 'file:';
  // Aberto com dois cliques (file://): imagens carregam direto e o mapa vira link.
  if (local) document.querySelectorAll('img[loading]').forEach(function (i) { i.loading = 'eager'; });
  var mapa = document.querySelector('[data-mapa]');
  if (mapa && local) {
    mapa.removeAttribute('role'); mapa.removeAttribute('tabindex'); mapa.removeAttribute('aria-label');
    mapa.innerHTML = '<a href="https://maps.google.com/?cid=15074940448003042268" target="_blank" rel="noopener">Abrir o endereço no Google Maps</a>';
    mapa = null;
  }
  if (mapa) {
    var abrir = function () {
      if (mapa.dataset.aberto) return; mapa.dataset.aberto = 1;
      var f = document.createElement('iframe'); f.src = mapa.dataset.mapa; f.loading = 'lazy'; f.title = 'Mapa da Oral Centter'; mapa.appendChild(f);
    };
    mapa.addEventListener('click', abrir);
    mapa.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') abrir(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { abrir(); o.disconnect(); } }, { rootMargin: '400px' }).observe(mapa);
  }

  // Horário: marca o dia de hoje e diz se está aberto, pelo relógio de Teixeira de Freitas (UTC-3).
  var agora = new Date(Date.now() - 3 * 3600e3), dia = agora.getUTCDay(), h = agora.getUTCHours() + agora.getUTCMinutes() / 60;
  var status = document.querySelector('.agora');
  document.querySelectorAll('.horas tr').forEach(function (tr) {
    if (tr.dataset.dias.split(',').indexOf(String(dia)) < 0) return;
    tr.classList.add('hoje');
    var abre = +tr.dataset.abre, fecha = +tr.dataset.fecha;
    if (fecha && h >= abre && h < fecha) { status.textContent = 'Aberto agora, até as ' + fecha + 'h'; status.classList.add('aberto'); }
    else status.textContent = 'Fechado agora';
  });

  // Efeito 06: faixa de avaliações (trechos com as palavras de cada paciente no Google).
  var R = [
    ['Gostei do atendimento e principalmente da recepção, eu indico muito.', 'Daiane Santos'],
    ['Muito bem recebida, equipe super educadas desde a recepção ao final do atendimento, muito satisfeita.', 'Ana beatriz Cardoso pinto'],
    ['Desde a recepção até o atendimento dos dentistas, fui tratada com muita atenção, cuidado e profissionalismo.', 'Emanuelly Silvestre'],
    ['Todos bem educados atenciosos com os pacientes.', 'Gabriel Gama'],
    ['Tudo feito com muita responsabilidade, carinho.', 'Irismar Revendedor']
  ];
  var track = document.querySelector('[data-fill]');
  if (track) {
    var html = R.map(function (r) { return '<figure class="review"><div class="estrelas" aria-label="5 estrelas">★★★★★</div><p>“' + r[0] + '”</p><b>' + r[1] + '<small>no Google</small></b></figure>'; }).join('');
    track.innerHTML = html + html.replace(/<figure/g, '<figure aria-hidden="true"');
    var faixa = document.querySelector('.marquee');
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { faixa.classList.toggle('parado', !es[0].isIntersecting); }).observe(faixa);
  }

  if (!window.gsap || !window.ScrollTrigger) { document.documentElement.classList.remove('js-movimento'); return; }
  gsap.registerPlugin(ScrollTrigger);
  var mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    document.documentElement.classList.add('js-movimento');

    // Efeito 01 (momento principal): letras do título sobem com leve giro, depois a ficha e a fachada.
    var h1 = document.querySelector('[data-split]'), texto = h1.textContent.trim();
    h1.setAttribute('aria-label', texto);
    h1.innerHTML = texto.split(' ').map(function (w) {
      var cls = (w === 'azul') ? ' azul' : '';
      return '<span class="word' + cls + '" aria-hidden="true">' + Array.from(w).map(function (c) { return '<span class="char">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
    h1.classList.add('pronto');
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .fromTo('.ficha .rot[data-in]', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .7 })
      .fromTo('.ficha .char', { autoAlpha: 0, yPercent: function () { return gsap.utils.random(60, 110); }, rotate: function () { return gsap.utils.random(-12, 12); } },
        { autoAlpha: 1, yPercent: 0, rotate: 0, duration: 1.1, stagger: .028 }, '<.1')
      .fromTo('.ficha-texto > p[data-in], .ficha .acoes', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .8, stagger: .08 }, '-=.7')
      .fromTo('.dado', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .8, stagger: .07 }, '<.1')
      .fromTo('[data-scale]', { autoAlpha: 0, scale: .94 }, { autoAlpha: 1, scale: 1, duration: 1.2 }, '-=.7');

    // WhatsApp flutuante aparece depois da ficha.
    var whats = document.querySelector('.whats');
    ScrollTrigger.create({ trigger: '.recepcao', start: 'top 70%', end: 'max', onToggle: function (s) { whats.classList.toggle('visivel', s.isActive); } });

    // Efeito 02: letras que rolam nos botões (só onde há mouse).
    if (matchMedia('(hover: hover)').matches) {
      document.querySelectorAll('[data-roll]').forEach(function (el) {
        var label = el.querySelector('.label'), t = label.textContent;
        label.setAttribute('aria-label', t);
        label.innerHTML = Array.from(t).map(function (c) {
          return c === ' ' ? '<span class="roll-space"></span>' : '<span class="roll-mask" aria-hidden="true"><span class="roll-front">' + c + '</span><span class="roll-back">' + c + '</span></span>';
        }).join('');
        var parts = label.querySelectorAll('.roll-front, .roll-back');
        var to = function (y) { gsap.to(parts, { yPercent: y, duration: .6, ease: 'expo.out', stagger: .022, overwrite: true }); };
        el.addEventListener('mouseenter', function () { to(-100); });
        el.addEventListener('mouseleave', function () { to(0); });
        el.addEventListener('focus', function () { to(-100); });
        el.addEventListener('blur', function () { to(0); });
      });
    }
  });

  if (document.fonts) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
