const corner = document.querySelector('.corner-badge');
const scriptUrl = document.currentScript.src;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const files = [...new Set(window.cornerImages || [])];

Promise.all(files.map(src => new Promise(resolve => {
  const image = new Image();
  image.alt = '';
  image.onload = () => resolve(image);
  image.onerror = () => resolve(null);
  image.src = new URL(src, scriptUrl).href;
}))).then(results => {
  const images = results.filter(Boolean);
  if (!images.length) return;

  let current = Math.floor(Math.random() * images.length);
  let timer;
  let glitch;
  let resumeTimer;
  let heldPointer;
  corner.hidden = false;
  showCurrentImage();

  function showCurrentImage() {
    const image = images[current];
    const longSide = Math.max(image.naturalWidth, image.naturalHeight);
    const shortSide = Math.min(image.naturalWidth, image.naturalHeight);
    const filename = new URL(image.src).pathname.split('/').pop();
    const enlargedImages = [
      'cutout-020.png',
      'cutout-037.png',
      'cutout-053.jpg',
      'cutout-054.jpg',
      'cutout-056.jpg',
      'cutout-060.png',
    ];
    const extraScale = enlargedImages.includes(filename) ? 1.25 : 1;
    const scale = Math.min(1.7, Math.pow(longSide / shortSide, 0.35)) * extraScale;
    corner.style.setProperty('--corner-scale', scale);
    corner.style.setProperty('--corner-mask', 'url(' + JSON.stringify(image.src) + ')');
    corner.replaceChildren(image);
  }

  function updateTimer() {
    clearInterval(timer);
    if (heldPointer !== undefined || resumeTimer !== undefined || motion.matches || images.length < 2) return;
    timer = setInterval(() => {
      const offset = 1 + Math.floor(Math.random() * (images.length - 1));
      current = (current + offset) % images.length;
      showCurrentImage();
    }, 600);
  }

  function startGlitch(held) {
    glitch?.cancel();
    clearInterval(timer);
    clearTimeout(resumeTimer);
    resumeTimer = undefined;
    const frames = motion.matches
      ? [{ filter: 'grayscale(1)' }, { filter: held ? 'grayscale(1)' : 'none' }]
      : [
          { transform: 'none', filter: 'none' },
          { transform: 'translate(-16px, 4px) skewX(-17deg)', filter: 'drop-shadow(8px 0 #f35) drop-shadow(-8px 0 #0cd) contrast(1.45)' },
          { transform: 'translate(11px, -5px) skewX(13deg)', filter: 'drop-shadow(-3px 0 #f35) drop-shadow(3px 0 #0cd)' },
          { transform: 'translate(-3px, 1px)', filter: 'drop-shadow(2px 0 #0cd)' },
          { transform: 'none', filter: 'none' },
        ];
    corner.classList.toggle('corner-badge--glitch', !motion.matches);
    glitch = corner.animate(frames, {
      duration: 650,
      easing: 'steps(2, end)',
      iterations: held ? Infinity : 1,
    });
    glitch.onfinish = stopGlitch;
  }

  function stopGlitch() {
    glitch?.cancel();
    corner.classList.remove('corner-badge--glitch');
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      resumeTimer = undefined;
      updateTimer();
    }, 350);
  }

  corner.addEventListener('pointerdown', event => {
    if (event.button !== 0 || heldPointer !== undefined) return;
    corner.setPointerCapture(event.pointerId);
    heldPointer = event.pointerId;
    startGlitch(true);
  });

  function releaseGlitch(event) {
    if (event.pointerId !== heldPointer) return;
    heldPointer = undefined;
    stopGlitch();
  }

  corner.addEventListener('pointerup', releaseGlitch);
  corner.addEventListener('pointercancel', releaseGlitch);
  corner.addEventListener('lostpointercapture', releaseGlitch);
  corner.addEventListener('click', event => {
    if (event.detail === 0 && heldPointer === undefined) startGlitch(false);
  });


  motion.addEventListener('change', updateTimer);
  updateTimer();
});
