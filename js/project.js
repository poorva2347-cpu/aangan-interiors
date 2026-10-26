(() => {
// Project detail: renders the project from ?p=slug, lightbox gallery, before/after slider.
const { getProjects, picture, card, esc } = window.AANGAN;

const root = document.getElementById("project");
const slug = new URLSearchParams(location.search).get("p") || "sage-living-room";
const all = getProjects();
const p = all.find((x) => x.slug === slug) || all[0];

document.title = `${p.title} — AANGAN Interiors`;
document.querySelector('meta[name="description"]')?.setAttribute("content", p.intro);
const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
set("crumb-current", esc(p.title));
set("p-eyebrow", `${esc(p.category)}${p.sample ? " · Sample project" : ""}`);
set("p-title", esc(p.title));
set("p-intro", esc(p.intro));
set("p-hero", picture(p.hero.src, p.hero.alt, { w: 1600, h: 900, eager: true, sizes: "100vw" }));
set("p-meta", [["Project type", `${p.category} · ${p.propertyType}`], ["Location", p.location], ["Approx. area", p.area], ["Design style", p.style], ["Year", p.year]]
  .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join(""));
set("p-brief", esc(p.brief));
set("p-concept", esc(p.concept));
set("p-palette", p.palette.map(([n, c]) => `<li><span aria-hidden="true" style="--swatch:${c}"></span>${esc(n)}</li>`).join(""));
set("p-gallery", p.gallery.map((g, i) => `<button class="gallery__item gallery__item--${g.size}" type="button" data-index="${i}" aria-label="View larger: ${esc(g.alt)}">${picture(g.src, g.alt, { w: g.w, h: g.h, sizes: g.size === "tall" ? "(max-width: 767px) 100vw, 50vw" : "100vw" })}</button>`).join(""));
const related = all.filter((x) => x.slug !== p.slug && x.category === p.category).concat(all.filter((x) => x.slug !== p.slug && x.category !== p.category)).slice(0, 3);
set("p-related", related.map(card).join(""));

// Before / after
const baWrap = document.getElementById("p-ba-section");
if (p.beforeAfter) {
  const b = p.beforeAfter, base = "assets/images/";
  set("p-ba", `<img src="${base}${b.before}.jpg" alt="Before: the original room" loading="lazy">
    <img class="ba__after" src="${base}${b.after}.jpg" alt="After: the redesigned room" loading="lazy">
    <span class="ba__tag ba__tag--before">Before</span><span class="ba__tag ba__tag--after">After</span>
    <span class="ba__divider" aria-hidden="true"></span>
    <input type="range" min="0" max="100" value="50" aria-label="Drag to compare before and after">`);
  set("p-ba-note", esc(b.note));
  const ba = document.getElementById("p-ba");
  ba.querySelector("input").addEventListener("input", (e) => ba.style.setProperty("--pos", `${e.target.value}%`));
} else baWrap.hidden = true;

// Lightbox
const lb = document.getElementById("lightbox");
const img = lb.querySelector("img"), cap = lb.querySelector(".lightbox__caption"), counter = lb.querySelector(".lightbox__count");
let i = 0, opener = null;
const show = (n) => {
  i = (n + p.gallery.length) % p.gallery.length;
  const g = p.gallery[i];
  img.src = `assets/images/${g.src}@2x.jpg`; img.alt = g.alt; cap.textContent = g.alt;
  counter.textContent = `${i + 1} / ${p.gallery.length}`;
};
document.getElementById("p-gallery").addEventListener("click", (e) => {
  const b = e.target.closest(".gallery__item"); if (!b) return;
  opener = b; show(+b.dataset.index); lb.showModal(); lb.querySelector("[data-lb-close]").focus();
});
lb.querySelector("[data-lb-prev]").addEventListener("click", () => show(i - 1));
lb.querySelector("[data-lb-next]").addEventListener("click", () => show(i + 1));
lb.querySelector("[data-lb-close]").addEventListener("click", () => lb.close());
lb.addEventListener("close", () => opener?.focus());
lb.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") show(i - 1); if (e.key === "ArrowRight") show(i + 1); });
let x0 = null;
lb.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
lb.addEventListener("touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); x0 = null; });
root.removeAttribute("aria-busy");

})();
