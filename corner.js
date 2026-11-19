const corner = document.querySelector('.corner-link');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const files = [...new Set(window.cornerImages || [])];

Promise.all(files.map(src => new Promise(resolve => {
  const image = new Image();
  image.alt = '';
  image.onload = () => resolve(image);
  image.onerror = () => resolve(null);
  image.src = src;
}))).then(results => {
  const images = results.filter(Boolean);
  if (!images.length) return;

  const label = corner.textContent;
  let current = Math.floor(Math.random() * images.length);
  let timer;
  corner.setAttribute('aria-label', label);
  corner.classList.add('corner-link--images');
  corner.replaceChildren(images[current]);

  function updateTimer() {
    clearInterval(timer);
    if (motion.matches || images.length < 2) return;
    timer = setInterval(() => {
      const offset = 1 + Math.floor(Math.random() * (images.length - 1));
      current = (current + offset) % images.length;
      corner.replaceChildren(images[current]);
    }, 900);
  }

  motion.addEventListener('change', updateTimer);
  updateTimer();
});
