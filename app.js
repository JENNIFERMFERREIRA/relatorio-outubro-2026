(() => {
  const deck = document.getElementById('deck');
  const slides = [...deck.querySelectorAll('.slide')];
  const count = document.getElementById('count');
  const bar = document.getElementById('bar');
  let i = 0;

  // Escala o palco de 1920×1080 para caber na janela
  function fit() {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    deck.style.setProperty('--scale', s);
  }

  const fmtMoney = v => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Números sobem de 0 até o valor final
  function countUp(slide) {
    slide.querySelectorAll('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count);
      const dec = el.dataset.money ? 2 : parseInt(el.dataset.dec || '0', 10);
      const fmt = v => el.dataset.money ? fmtMoney(v) : v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      const dur = 1400, start = performance.now() + 250;
      el.textContent = fmt(0);
      const step = now => {
        const t = Math.min(Math.max((now - start) / dur, 0), 1);
        const e = 1 - Math.pow(1 - t, 3);
        el.textContent = fmt(end * e);
        if (t < 1 && slide.classList.contains('active')) requestAnimationFrame(step);
        else el.textContent = fmt(end);
      };
      requestAnimationFrame(step);
    });
  }

  function go(n) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    slides[i].classList.remove('active');
    i = n;
    const s = slides[i];
    void s.offsetWidth; // reinicia as animações ao voltar para um slide
    s.classList.add('active');
    countUp(s);
    count.textContent = `${i + 1} / ${slides.length}`;
    bar.style.width = `${((i + 1) / slides.length) * 100}%`;
    history.replaceState(null, '', `#${i + 1}`);
  }

  const next = () => go(i + 1);
  const prev = () => go(i - 1);

  document.getElementById('next').addEventListener('click', e => { e.stopPropagation(); next(); });
  document.getElementById('prev').addEventListener('click', e => { e.stopPropagation(); prev(); });
  document.getElementById('full').addEventListener('click', e => {
    e.stopPropagation();
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  });

  document.addEventListener('keydown', e => {
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(slides.length - 1);
    else if (e.key.toLowerCase() === 'f') document.getElementById('full').click();
  });

  // Clique: metade direita avança, metade esquerda volta
  document.querySelector('.stage').addEventListener('click', e => {
    e.clientX > window.innerWidth / 2 ? next() : prev();
  });

  // Deslizar no celular
  let x0 = null;
  window.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; document.body.classList.add('touch'); }, { passive: true });
  window.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    x0 = null;
  });

  window.addEventListener('resize', fit);
  fit();
  const start = parseInt(location.hash.slice(1), 10);
  go(Number.isFinite(start) ? start - 1 : 0);
})();
