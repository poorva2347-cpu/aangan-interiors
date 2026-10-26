(() => {
// Accessible accordion: buttons with aria-expanded control their panels.
document.querySelectorAll(".accordion__trigger").forEach((btn) => {
  const panel = document.getElementById(btn.getAttribute("aria-controls"));
  const sync = () => panel?.toggleAttribute("inert", btn.getAttribute("aria-expanded") !== "true");
  sync();
  btn.addEventListener("click", () => {
    btn.setAttribute("aria-expanded", String(btn.getAttribute("aria-expanded") !== "true"));
    sync();
  });
});

})();
