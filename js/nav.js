(() => {
// Sticky-header border and accessible mobile drawer (focus trap, Esc, restore focus).
const init = () => {
  const header = document.getElementById("site-header");
  const drawer = document.getElementById("drawer");
  const toggle = document.querySelector(".menu-toggle");
  if (!header || !drawer || !toggle) return;

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const focusables = () => [...drawer.querySelectorAll("a[href], button:not([disabled])")];
  let lastFocus = null;

  const open = () => {
    lastFocus = document.activeElement;
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add("is-open"));
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    focusables()[0]?.focus();
  };
  const close = () => {
    drawer.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    const done = () => { drawer.hidden = true; };
    matchMedia("(prefers-reduced-motion: reduce)").matches ? done() : setTimeout(done, 250);
    lastFocus?.focus();
  };

  toggle.addEventListener("click", open);
  drawer.querySelectorAll("[data-drawer-close]").forEach((el) => el.addEventListener("click", close));
  drawer.addEventListener("keydown", (e) => {
    if (e.key === "Escape") return close();
    if (e.key !== "Tab") return;
    const f = focusables(), first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  matchMedia("(min-width: 1024px)").addEventListener("change", (m) => { if (m.matches && !drawer.hidden) close(); });
};

// Works both in dev (partials loaded by includes.js) and in the built site (partials baked in).
let started = false;
const start = () => { if (!started && document.getElementById("site-header")) { started = true; init(); } };
start();
document.addEventListener("partials:ready", start);

})();
