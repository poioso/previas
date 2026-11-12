/* Oral Centter: movimento da página.
   Efeitos da biblioteca horizonx: 01 título, 02 botões, 03 carrossel 3D, 04 frase e revelação,
   05 passos, 06 faixa de avaliações, 07 cartões, 08 colunas, 09 foto com profundidade.
   Sem GSAP, sem WebGL ou com "reduzir movimento", tudo aparece no estado final. */
(function () {
  var local = location.protocol === 'file:';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var grande = matchMedia('(min-width: 768px)').matches;
  var WA = 'https://wa.me/557398669387';

  // Aberto com dois cliques (file://): imagens carregam direto e o mapa vira link.
  if (local) document.querySelectorAll('img[loading]').forEach(function (i) { i.loading = 'eager'; });
  // Efeito 07: o brilho para quando a foto já estava pronta.
  document.querySelectorAll('.thumb .pic').forEach(function (i) { if (i.complete && i.naturalWidth) i.parentNode.classList.add('loaded'); });

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

  // Horário real: marca o dia de hoje e diz se está aberto (relógio de Teixeira de Freitas, UTC-3).
  var agora = new Date(Date.now() - 3 * 3600e3), dia = agora.getUTCDay(), h = agora.getUTCHours() + agora.getUTCMinutes() / 60;
  var status = document.querySelector('.agora'), selo = document.querySelector('.selo');
  document.querySelectorAll('.horas tr').forEach(function (tr) {
    if (tr.dataset.dias.split(',').indexOf(String(dia)) < 0) return;
    tr.classList.add('hoje');
    var abre = +tr.dataset.abre, fecha = +tr.dataset.fecha, aberto = fecha && h >= abre && h < fecha;
    var t = aberto ? 'Aberto agora, até as ' + fecha + 'h' : 'Fechado agora';
    status.textContent = t; status.classList.toggle('aberto', !!aberto);
    selo.innerHTML = '<i></i>' + t; selo.classList.toggle('fechado', !aberto);
  });

  // Efeito 06: faixa infinita com todas as avaliações com texto que o Google mostra (palavras de cada paciente).
  var R = [
    ['Gostei do atendimento e principalmente da recepção, eu indico muito.', 'Daiane Santos', '5 meses atrás'],
    ['Muito bem recebida, equipe super educadas desde a recepção ao final do atendimento, muito satisfeita.', 'Ana beatriz Cardoso pinto', '3 meses atrás'],
    ['Desde a recepção até o atendimento dos dentistas, fui tratada com muita atenção, cuidado e profissionalismo. Os profissionais foram super atenciosos, explicou tudo com clareza.', 'Emanuelly Silvestre', '2 meses atrás'],
    ['Todos bem educados atenciosos com os pacientes, amando fazer meu tratamento nessa clínica.', 'Gabriel Gama', '3 meses atrás'],
    ['Super indico (...) tudo feito com muita responsabilidade, carinho.', 'Irismar Revendedor', '3 meses atrás']
  ];
  document.querySelectorAll('[data-fill]').forEach(function (t, n) {
    var lista = n ? R.slice(2).concat(R.slice(0, 2)) : R;
    var html = lista.map(function (r) { return '<figure class="review"><div class="estrelas" aria-label="5 estrelas">★★★★★</div><p>“' + r[0] + '”</p><b>' + r[1] + '<small>no Google, ' + r[2] + '</small></b></figure>'; }).join('');
    t.innerHTML = html + html.replace(/<figure/g, '<figure aria-hidden="true"');
  });
  var pausa = function (sel, alvo) {
    if (!('IntersectionObserver' in window)) return;
    document.querySelectorAll(sel).forEach(function (el) { new IntersectionObserver(function (es) { (alvo ? el.querySelector(alvo) : el).classList.toggle(alvo ? 'paused' : 'parado', !es[0].isIntersecting); }).observe(el); });
  };
  pausa('.marquee');

  // Efeito 08: colunas de fotos da clínica atrás da chamada final.
  var F = ['fachada', 'recepcao', 'parede-logo', 'atendimento', 'equipe-recepcao', 'dentista', 'consultorio'];
  var cols = document.querySelector('.cols');
  if (cols) {
    cols.innerHTML = [0, 1, 2, 3, 4].map(function (c) {
      var tiles = [0, 1, 2, 3].map(function (k) { return '<img class="tile" src="fotos/' + F[(c * 3 + k) % F.length] + '.webp?v=2" alt="" loading="lazy">'; }).join('');
      if (local) tiles = tiles.replace(/ loading="lazy"/g, '');
      return '<div class="col"><div class="col-track" style="--d:' + (38 + c * 6) + 's">' + tiles + tiles + '</div></div>';
    }).join('');
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { cols.classList.toggle('paused', !es[0].isIntersecting); }).observe(cols);
  }

  // three.js só no computador, por http, com WebGL e sem "reduzir movimento". No celular a página fica leve.
  var temGL = false;
  try { var cv = document.createElement('canvas'); temGL = !!(cv.getContext('webgl2') || cv.getContext('webgl')); } catch (e) {}
  if (grande && !reduce && !local && temGL) {
    var s = document.createElement('script'); s.src = 'assets/three.min.js?v=2';
    s.onload = function () { try { profundidade(); } catch (e) {} try { carrossel(); } catch (e) {} };
    document.body.appendChild(s);
  }

  // Efeito 09: fachada com profundidade (paralaxe por pixel com mapa aproximado da própria foto).
  function profundidade() {
    var box = document.querySelector('[data-depth]'); if (!box) return;
    var img = new Image(); img.src = box.dataset.depth;
    img.onload = function () {
      var renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      box.insertBefore(renderer.domElement, box.firstChild);
      var scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      var u = { uImg: { value: null }, uDepth: { value: null }, uMouse: { value: new THREE.Vector2() }, uAmt: { value: 0.03 }, uCover: { value: new THREE.Vector2(1, 1) } };
      var mat = new THREE.ShaderMaterial({
        uniforms: u,
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
        fragmentShader: 'precision mediump float; uniform sampler2D uImg, uDepth; uniform vec2 uMouse, uCover; uniform float uAmt; varying vec2 vUv;' +
          'void main(){ vec2 uv = (vUv - .5) * uCover + vec2(.47, .5); float d = texture2D(uDepth, uv).r; vec2 off = uMouse * (d - .5) * uAmt;' +
          'uv = clamp(uv + off * 2., .002, .998); vec2 z = (uv - .5) * (1. - uAmt * 1.5) + .5; gl_FragColor = texture2D(uImg, z); }'
      });
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
      var tex = function (src) { var t = new THREE.Texture(src); t.needsUpdate = true; t.minFilter = THREE.LinearFilter; return t; };
      var w = 256, hh = Math.round(256 * img.height / img.width), c = document.createElement('canvas'); c.width = w; c.height = hh;
      var g = c.getContext('2d'); g.filter = 'grayscale(1) blur(6px)'; g.drawImage(img, 0, 0, w, hh); g.filter = 'none';
      g.globalCompositeOperation = 'soft-light'; var fl = g.createLinearGradient(0, 0, 0, hh); fl.addColorStop(0, '#000'); fl.addColorStop(1, '#fff'); g.fillStyle = fl; g.fillRect(0, 0, w, hh);
      u.uImg.value = tex(img); u.uDepth.value = tex(c);
      var imgA = img.width / img.height;
      var fit = function () { var bw = box.clientWidth, bh = box.clientHeight; renderer.setSize(bw, bh, false); var a = bw / bh; u.uCover.value.set(a < imgA ? a / imgA : 1, a < imgA ? 1 : imgA / a); };
      new ResizeObserver(fit).observe(box); fit();
      box.classList.add('gl');
      var target = new THREE.Vector2(), cur = u.uMouse.value, hover = false, visivel = true, raf = 0;
      box.addEventListener('pointermove', function (e) { var r = box.getBoundingClientRect(); hover = true; target.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height * 2 - 1)); });
      box.addEventListener('pointerleave', function () { hover = false; });
      new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; if (visivel) loop(); }).observe(box);
      function loop(t) {
        t = t || 0; cancelAnimationFrame(raf); if (!visivel) return;
        if (!hover) target.set(Math.sin(t / 2200) * .7, Math.cos(t / 3100) * .35);
        cur.lerp(target, .06); renderer.render(scene, cam); raf = requestAnimationFrame(loop);
      }
      loop();
    };
  }

  // Efeito 03: carrossel curvo 3D com as fotos da clínica.
  function carrossel() {
    var stage = document.querySelector('.stage'); if (!stage) return;
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    stage.classList.remove('no-gl'); stage.appendChild(renderer.domElement);
    var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(70, 1, .1, 100);
    var lista = F.concat(F), R = 6, STEP = 2.45 / R, TOTAL = STEP * lista.length, geo = new THREE.PlaneGeometry(2.1, 2.8);
    var loader = new THREE.TextureLoader();
    var cards = lista.map(function (nome, i) {
      var mat = new THREE.MeshBasicMaterial({ color: 0xe3ecfb, transparent: true });
      loader.load('fotos/' + nome + '.webp?v=2', function (t) {
        t.colorSpace = THREE.SRGBColorSpace || t.colorSpace;
        var a = t.image.width / t.image.height, p = 2.1 / 2.8;
        if (a > p) { t.repeat.set(p / a, 1); t.offset.set((1 - p / a) / 2, 0); } else { t.repeat.set(1, a / p); t.offset.set(0, (1 - a / p) / 2); }
        mat.map = t; mat.color.set(0xffffff); mat.needsUpdate = true;
      });
      var m = new THREE.Mesh(geo, mat); scene.add(m); return { m: m, base: i * STEP };
    });
    var offset = 0, target = 0, auto = .0009, visivel = true;
    function layout() {
      cards.forEach(function (c) {
        var a = c.base + offset + TOTAL / 2; a = ((a % TOTAL) + TOTAL) % TOTAL - TOTAL / 2;
        c.m.position.set(Math.sin(a) * R, 0, -Math.cos(a) * R); c.m.rotation.y = -a;
        c.m.material.opacity = THREE.MathUtils.clamp(1.6 - Math.abs(a) * .9, 0, 1); c.m.visible = c.m.material.opacity > .01;
      });
    }
    function resize() { var w = stage.clientWidth, hh = stage.clientHeight; renderer.setSize(w, hh, false); camera.aspect = w / hh; camera.fov = w < 640 ? 85 : 70; camera.updateProjectionMatrix(); }
    new ResizeObserver(resize).observe(stage); resize();
    var down = false, lastX = 0, vel = 0;
    stage.addEventListener('pointerdown', function (e) { down = true; lastX = e.clientX; vel = 0; stage.classList.add('dragging'); stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - lastX; lastX = e.clientX; vel = dx * .004; target += vel; });
    var up = function () { down = false; stage.classList.remove('dragging'); target += vel * 12; };
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    stage.addEventListener('wheel', function (e) { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); target -= e.deltaX * .002; } }, { passive: false });
    stage.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') target -= STEP; else if (e.key === 'ArrowLeft') target += STEP; else return; e.preventDefault(); });
    new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; if (visivel) tick(); }).observe(stage);
    var raf = 0;
    function tick() {
      cancelAnimationFrame(raf); if (!visivel || document.hidden) return;
      if (!down) target -= auto; offset += (target - offset) * .08; layout(); renderer.render(scene, camera); raf = requestAnimationFrame(tick);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden && visivel) tick(); });
    tick();
  }

  // Efeito 05: passos com trilho de progresso.
  var passos = [].slice.call(document.querySelectorAll('.step')), cenas = [].slice.call(document.querySelectorAll('.scene'));
  var fill = document.querySelector('.rail-fill'), atual = -1, timer = null, naTela = false;
  function vai(i) {
    if (!window.gsap) return;
    timer && timer.kill();
    var ant = atual; atual = i;
    passos.forEach(function (s, k) {
      s.classList.toggle('on', k === i); s.classList.toggle('done', k < i);
      s.querySelector('button').setAttribute('aria-expanded', k === i);
      gsap.set(s.querySelector('.bar i'), { scaleX: 0 });
    });
    gsap.to(fill, { scaleY: (i + .5) / passos.length, duration: .8, ease: 'expo.out' });
    cenas.forEach(function (c, k) { if (k !== i && k !== ant) gsap.set(c, { autoAlpha: 0 }); });
    if (ant > -1 && ant !== i) gsap.to(cenas[ant], { autoAlpha: 0, y: -10, duration: .3, ease: 'expo.out' });
    gsap.fromTo(cenas[i], { autoAlpha: 0, y: 14, scale: .97 }, { autoAlpha: 1, y: 0, scale: 1, duration: .7, ease: 'expo.out', delay: ant > -1 ? .15 : 0 });
    if (reduce) return;
    timer = gsap.to(passos[i].querySelector('.bar i'), { scaleX: 1, duration: 4.5, ease: 'none', onComplete: function () { vai((i + 1) % passos.length); } });
    if (!naTela) timer.pause();
  }
  passos.forEach(function (s, k) { s.querySelector('button').addEventListener('click', function () { vai(k); }); });
  if ('IntersectionObserver' in window && passos.length) new IntersectionObserver(function (es) { naTela = es[0].isIntersecting; timer && (naTela ? timer.resume() : timer.pause()); }).observe(document.querySelector('.passos'));

  if (!window.gsap || !window.ScrollTrigger) { document.documentElement.classList.remove('js-movimento'); return; }
  gsap.registerPlugin(ScrollTrigger);
  vai(0);

  // Efeito 04 (parte 1): frase dividida em palavras; "esquina azul" fica em azul.
  var lit = document.querySelector('[data-lit]');
  lit.innerHTML = lit.textContent.trim().split(/\s+/).map(function (w, i, a) {
    var azul = (w === 'azul') || (w === 'esquina' && a[i + 1] === 'azul');
    return '<span class="w' + (azul ? ' azul' : '') + '">' + w + '</span>';
  }).join(' ');

  var mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', function () {
    // Efeito 01 (momento principal): letras do slogan sobem com leve giro, depois a ficha e a fachada.
    var h1 = document.querySelector('[data-split]'), texto = h1.textContent.trim();
    h1.setAttribute('aria-label', texto);
    h1.innerHTML = texto.split(' ').map(function (w) {
      var cls = /sorrir/.test(w) ? ' azul' : '';
      return '<span class="word' + cls + '" aria-hidden="true">' + Array.from(w).map(function (c) { return '<span class="char">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
    h1.classList.add('pronto');
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .fromTo('.ficha .rot[data-in]', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .7 })
      .fromTo('.ficha .char', { autoAlpha: 0, yPercent: function () { return gsap.utils.random(60, 110); }, rotate: function () { return gsap.utils.random(-12, 12); } },
        { autoAlpha: 1, yPercent: 0, rotate: 0, duration: 1.1, stagger: .028 }, '<.1')
      .fromTo('.ficha .lead, .ficha .acoes', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .8, stagger: .08 }, '-=.7')
      .fromTo('.dado', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .8, stagger: .07 }, '<.1')
      .fromTo('[data-scale]', { autoAlpha: 0, scale: .94 }, { autoAlpha: 1, scale: 1, duration: 1.2 }, '-=.8');

    // Gatilhos na ordem da página.
    // Efeito 04 (parte 1): a frase acende palavra por palavra com a rolagem.
    gsap.to('.lit .w', { opacity: 1, ease: 'none', stagger: .1, scrollTrigger: { trigger: lit, start: 'top 80%', end: 'bottom 45%', scrub: .6 } });

    // Efeito 04 (parte 2): blocos entram em lote, uma vez, com expo.out.
    gsap.set('[data-reveal]', { y: 48 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%', once: true,
      onEnter: function (lote) {
        gsap.to(lote, { autoAlpha: 1, y: 0, duration: .9, ease: 'expo.out', stagger: .08, overwrite: true });
      }
    });

    // WhatsApp flutuante aparece depois da ficha.
    var whats = document.querySelector('.whats');
    ScrollTrigger.create({ trigger: '.frase', start: 'top 70%', endTrigger: '.cta', end: 'top 85%', onToggle: function (s) { whats.classList.toggle('visivel', s.isActive); } });

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
  mm.add('(prefers-reduced-motion: reduce)', function () { gsap.set('.lit .w, [data-reveal]', { opacity: 1 }); });

  if (document.fonts) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
