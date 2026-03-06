// Custom Cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
if (hasFinePointer && cursor && ring) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function animCursor() {
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animCursor);
  }
  animCursor();
  document.querySelectorAll('a, button, .faq-q, .service-item, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.style.transform = 'translate(-50%,-50%) scale(2.5)'; ring.style.opacity = '0'; });
    el.addEventListener('mouseleave', () => { cursor.style.transform = 'translate(-50%,-50%) scale(1)'; ring.style.opacity = '1'; });
  });
} else {
  document.body.style.cursor = 'auto';
  if (cursor) cursor.style.display = 'none';
  if (ring) ring.style.display = 'none';
}

// Background Canvas — Fluid Mesh Gradient
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, t = 0;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const orbs = [
  { x: 0.2, y: 0.3, r: 0.5, vx: 0.00015, vy: 0.00011, color: [201,168,76] },
  { x: 0.7, y: 0.6, r: 0.55, vx: -0.00012, vy: 0.00014, color: [232,201,106] },
  { x: 0.5, y: 0.1, r: 0.45, vx: 0.0001, vy: -0.00013, color: [42,40,32] },
  { x: 0.9, y: 0.9, r: 0.4, vx: -0.00008, vy: -0.0001, color: [122,112,96] },
];

function drawBg() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0f0e0c';
  ctx.fillRect(0, 0, W, H);

  orbs.forEach(o => {
    o.x += o.vx;
    o.y += o.vy;
    if (o.x < 0 || o.x > 1) o.vx *= -1;
    if (o.y < 0 || o.y > 1) o.vy *= -1;

    const grd = ctx.createRadialGradient(o.x * W, o.y * H, 0, o.x * W, o.y * H, o.r * Math.max(W, H) * 0.6);
    grd.addColorStop(0, `rgba(${o.color[0]},${o.color[1]},${o.color[2]},0.06)`);
    grd.addColorStop(1, `rgba(${o.color[0]},${o.color[1]},${o.color[2]},0)`);
    ctx.beginPath();
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  });

  t++;
  requestAnimationFrame(drawBg);
}
drawBg();

// Scroll Reveal
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
}, { threshold: 0.1 });
reveals.forEach(r => io.observe(r));

// FAQ Accordion
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// Nav shrink on scroll
const navEl = document.querySelector('nav');
function getNavPadding() {
  if (window.innerWidth <= 680) {
    return { base: '0.95rem 1rem', compact: '0.8rem 1rem' };
  }
  if (window.innerWidth <= 980) {
    return { base: '1rem 1.4rem', compact: '0.8rem 1.4rem' };
  }
  return { base: '1.4rem 4rem', compact: '0.9rem 4rem' };
}

function syncNavPadding() {
  if (!navEl) return;
  const navPadding = getNavPadding();
  navEl.style.padding = window.scrollY > 80 ? navPadding.compact : navPadding.base;
}

window.addEventListener('scroll', syncNavPadding);
window.addEventListener('resize', syncNavPadding);
syncNavPadding();

