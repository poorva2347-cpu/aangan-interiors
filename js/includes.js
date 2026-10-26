// Loads shared header/footer partials, marks the current nav item, then boots page scripts.
// Requires an HTTP server (partials are fetched) — see README.
const slots = [...document.querySelectorAll("[data-include]")];

async function loadPartials() {
  await Promise.all(slots.map(async (slot) => {
    try {
      const res = await fetch(slot.dataset.include);
      if (!res.ok) throw new Error(res.status);
      slot.outerHTML = await res.text();
    } catch (e) {
      console.warn(`Could not load ${slot.dataset.include}. Run the site through a local server (see README).`, e);
    }
  }));
  const current = document.body.dataset.page;
  document.querySelectorAll(`[data-nav="${current}"]`).forEach((a) => a.setAttribute("aria-current", "page"));
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
}

await loadPartials();
document.dispatchEvent(new CustomEvent("partials:ready"));
