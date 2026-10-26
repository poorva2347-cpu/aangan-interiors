(() => {
// Projects page: category chips, extra filters (sheet), Load more, empty state, live count.
const { getProjects, card } = window.AANGAN;

const grid = document.getElementById("project-grid");
const countEl = document.getElementById("project-count");
const live = document.getElementById("project-live");
const more = document.getElementById("load-more");
const empty = document.getElementById("empty-state");
const chips = [...document.querySelectorAll("[data-category]")];
const sheet = document.getElementById("filter-sheet");
const PAGE = 6;

let all = [], shown = PAGE;
const state = { category: "All", propertyType: new Set(), style: new Set() };

const matches = (p) =>
  (state.category === "All" || p.category === state.category) &&
  (!state.propertyType.size || state.propertyType.has(p.propertyType)) &&
  (!state.style.size || state.style.has(p.style));

function render(announce = false) {
  const list = all.filter(matches);
  grid.innerHTML = list.slice(0, shown).map(card).join("");
  const n = list.length;
  countEl.textContent = `${n} project${n === 1 ? "" : "s"}`;
  empty.hidden = n > 0;
  grid.hidden = n === 0;
  const done = shown >= n;
  more.hidden = n === 0;
  more.disabled = done;
  more.textContent = done ? "All projects shown" : "Load more projects";
  if (announce) live.textContent = `${n} project${n === 1 ? "" : "s"} shown`;
  const applyBtn = document.getElementById("sheet-apply");
  if (applyBtn) applyBtn.textContent = `Show ${n} project${n === 1 ? "" : "s"}`;
}

chips.forEach((c) => c.addEventListener("click", () => {
  chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
  state.category = c.dataset.category; shown = PAGE; render(true);
}));
more.addEventListener("click", () => { shown += PAGE; render(true); });
document.getElementById("clear-filters").addEventListener("click", () => {
  state.category = "All"; state.propertyType.clear(); state.style.clear();
  chips.forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.category === "All")));
  sheet.querySelectorAll("input").forEach((i) => (i.checked = false));
  shown = PAGE; render(true); chips[0].focus();
});

// Filter sheet (property type + style)
document.querySelectorAll("[data-open-filters]").forEach((b) => b.addEventListener("click", () => sheet.showModal()));
sheet.querySelectorAll("[data-close-sheet]").forEach((b) => b.addEventListener("click", () => sheet.close()));
sheet.addEventListener("change", (e) => {
  const set = state[e.target.name]; if (!set) return;
  e.target.checked ? set.add(e.target.value) : set.delete(e.target.value);
  shown = PAGE; render();
});
document.getElementById("sheet-clear").addEventListener("click", () => {
  state.propertyType.clear(); state.style.clear(); sheet.querySelectorAll("input").forEach((i) => (i.checked = false)); render();
});
document.getElementById("sheet-apply").addEventListener("click", () => { sheet.close(); render(true); });

try { all = getProjects(); render(); }
catch { grid.innerHTML = ""; empty.hidden = false; empty.querySelector("h2").textContent = "Projects couldn’t load."; empty.querySelector("p").textContent = "Check your connection and refresh the page."; }

})();
