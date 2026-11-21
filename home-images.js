const homeImage = document.querySelector('#home-image');
const homePanel = homeImage.closest('button');
const homeImages = ["home-images/home-01.jpg","home-images/home-02.jpg","home-images/home-03.jpg","home-images/home-04.jpg","home-images/home-05.jpg"];

let selection = 0;

async function showRandomImage(excludeCurrent = false) {
  const request = ++selection;
  const choices = excludeCurrent ? homeImages.filter(src => src !== homeImage.getAttribute("src")) : homeImages;
  if (!choices.length) return;
  const choice = Math.floor(Math.random() * choices.length);
  const next = new Image();
  next.src = choices[choice];

  try {
    await next.decode();
  } catch {
    return;
  }

  if (request !== selection) return;
  homeImage.src = choices[choice];
}

window.addEventListener('pageshow', () => showRandomImage());
homePanel.addEventListener('click', () => showRandomImage(true));

function alignImageTitle() {
  const { naturalWidth, naturalHeight } = homeImage;
  if (!naturalWidth || !naturalHeight) return;
  const { width, height } = homePanel.getBoundingClientRect();
  const scale = Math.min(width / naturalWidth, height / naturalHeight);
  homePanel.classList.add('home-panel--image-ready');
  homePanel.style.setProperty('--image-title-left', ((width - naturalWidth * scale) / 2) + 'px');
  homePanel.style.setProperty('--image-title-bottom', ((height - naturalHeight * scale) / 2) + 'px');
}

homeImage.addEventListener('load', alignImageTitle);
new ResizeObserver(alignImageTitle).observe(homePanel);
alignImageTitle();

const homeLink = document.querySelector('.home-brand a');
homeLink.addEventListener('click', event => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (location.hash || location.search) {
    history.replaceState(history.state, '', location.pathname);
  }
  window.scrollTo(0, 0);
});
