(() => {
// Shared helpers for project data and responsive images.
function getProjects() {
  if (!Array.isArray(window.AANGAN_PROJECTS)) throw new Error("Could not load projects");
  return window.AANGAN_PROJECTS;
}
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function picture(src, alt, { w = 800, h = 1000, sizes = "100vw", eager = false, cls = "" } = {}) {
  const b = `assets/images/${src}`;
  return `<picture${cls ? ` class="${cls}"` : ""}><source type="image/webp" srcset="${b}.webp 1x, ${b}@2x.webp 2x"><img src="${b}.jpg" srcset="${b}.jpg 1x, ${b}@2x.jpg 2x" alt="${esc(alt)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" sizes="${sizes}"></picture>`;
}
function card(p) {
  return `<li><a class="card-project" href="project-detail.html?p=${p.slug}">
    ${picture(p.card.src, p.card.alt, { cls: "media media--4x5", sizes: "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw" })}
    <span class="card-project__meta"><span class="t-eyebrow">${esc(p.category)}</span>${p.sample ? '<span class="sample-tag">Sample</span>' : ""}</span>
    <span class="card-project__title">${esc(p.title)}</span>
    <span class="t-small">${esc(p.location)}${p.sample ? " · Illustrative, not a completed project" : ""}</span>
  </a></li>`;
}

window.AANGAN = { getProjects, esc, picture, card };
})();
