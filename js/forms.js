(() => {
// Validation + submission for the contact form and the 4-step consultation request.
const { FORM_ENDPOINT, FORM_ACCESS_KEY } = window.AANGAN_CONFIG || {};

const MSG = {
  required: (l) => `Please enter your ${l.toLowerCase()}.`,
  select: (l) => `Please choose ${/^[aeiou]/i.test(l) ? "an" : "a"} ${l.toLowerCase()}.`,
  email: "Enter a valid email, e.g. name@example.com",
  phone: "Enter a 10-digit mobile number.",
  consent: "Please confirm we may contact you.",
};
const labelOf = (el) => el.dataset.label || (el.closest(".field")?.querySelector(".field__label")?.textContent || "this field").replace("*", "").replace(/\(optional\)/i, "").trim();

function setError(field, text) {
  const wrap = field.closest(".field"); if (!wrap) return;
  const err = wrap.querySelector(".field__error");
  wrap.classList.toggle("is-error", !!text);
  if (err) err.textContent = text || "";
  field.setAttribute("aria-invalid", text ? "true" : "false");
}
function check(el) {
  const v = (el.value || "").trim();
  if (el.type === "checkbox" && el.required) return el.checked ? "" : MSG.consent;
  if (el.required && !v) return el.tagName === "SELECT" ? MSG.select(labelOf(el)) : MSG.required(labelOf(el));
  if (v && el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return MSG.email;
  if (v && el.type === "tel" && v.replace(/\D/g, "").replace(/^91/, "").length !== 10) return MSG.phone;
  return "";
}
function validate(scope) {
  const els = [...scope.querySelectorAll("input, select, textarea")].filter((e) => e.type !== "file" && e.type !== "radio" && !e.closest("[hidden]"));
  const bad = [];
  els.forEach((el) => { const m = check(el); setError(el, m); if (m) bad.push(el); });
  return bad;
}
function summary(box, bad) {
  if (!box) return;
  if (!bad.length) { box.hidden = true; return; }
  box.hidden = false;
  box.querySelector(".alert__title").textContent = `Please check ${bad.length} field${bad.length > 1 ? "s" : ""}.`;
  box.querySelector("p:not(.alert__title)").innerHTML = bad.map((el) => `<a href="#${el.id}">${labelOf(el)}</a>`).join(", ");
  box.focus();
}
// Live re-validation once a field has been touched
document.addEventListener("focusout", (e) => { const el = e.target; if (el.matches?.(".field__control, .choice input") && el.closest("form[data-validate]")) setError(el, check(el)); });
document.addEventListener("input", (e) => { const el = e.target; if (el.getAttribute?.("aria-invalid") === "true") setError(el, check(el)); });

async function send(form, extra = {}) {
  if (new URLSearchParams(location.search).get("demo") === "fail") { await wait(900); throw new Error("demo failure"); }
  if (!FORM_ACCESS_KEY) { await wait(1200); console.info("[AANGAN] Demo mode — form not sent. Add FORM_ACCESS_KEY in js/config.js."); return; }
  const data = new FormData(form);
  data.append("access_key", FORM_ACCESS_KEY);
  Object.entries(extra).forEach(([k, v]) => data.append(k, v));
  const res = await fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(res.status);
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const busy = (btn, on, label) => { btn.disabled = on; btn.setAttribute("aria-busy", String(on)); if (label) btn.textContent = label; };

// ---------- File upload ----------
document.querySelectorAll(".upload").forEach((up) => {
  const input = up.querySelector("input[type=file]"), list = up.querySelector(".upload__list"), err = up.querySelector(".field__error");
  const MAX = 5, MB = 10; let files = [];
  const draw = () => {
    list.innerHTML = files.map((f, i) => `<li><span>${f.name} · ${(f.size / 1048576).toFixed(1)} MB</span><button type="button" data-rm="${i}">Remove<span class="visually-hidden"> ${f.name}</span></button></li>`).join("");
    const dt = new DataTransfer(); files.forEach((f) => dt.items.add(f)); input.files = dt.files;
  };
  const add = (incoming) => {
    let msg = "";
    for (const f of incoming) {
      if (!/^image\/(jpeg|png)$/.test(f.type)) { msg = `${f.name} isn’t supported. Please upload JPG or PNG.`; continue; }
      if (f.size > MB * 1048576) { msg = `${f.name} is larger than ${MB} MB.`; continue; }
      if (files.length >= MAX) { msg = `You can add up to ${MAX} images.`; break; }
      files.push(f);
    }
    up.classList.toggle("is-error", !!msg); up.classList.toggle("field", true); err.textContent = msg; err.style.display = msg ? "block" : "none";
    draw();
  };
  input.addEventListener("change", () => add([...input.files].filter((f) => !files.includes(f))));
  list.addEventListener("click", (e) => { const b = e.target.closest("[data-rm]"); if (b) { files.splice(+b.dataset.rm, 1); draw(); input.focus(); } });
  ["dragenter", "dragover"].forEach((t) => up.addEventListener(t, (e) => { e.preventDefault(); up.classList.add("is-dragover"); }));
  ["dragleave", "drop"].forEach((t) => up.addEventListener(t, () => up.classList.remove("is-dragover")));
  up.addEventListener("drop", (e) => { e.preventDefault(); add([...e.dataTransfer.files]); });
});

// ---------- Contact form ----------
const contact = document.getElementById("contact-form");
if (contact) {
  const box = document.getElementById("contact-errors"), btn = contact.querySelector("[type=submit]");
  const ok = document.getElementById("contact-success"), fail = document.getElementById("contact-failed");
  contact.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bad = validate(contact); summary(box, bad); if (bad.length) return;
    busy(btn, true, "Sending…"); fail.hidden = true;
    try { await send(contact, { subject: "New enquiry — AANGAN website" }); contact.hidden = true; ok.hidden = false; ok.focus(); }
    catch { fail.hidden = false; fail.focus(); }
    finally { busy(btn, false, "Send enquiry"); }
  });
}

// ---------- Consultation (4 steps) ----------
const cform = document.getElementById("consult-form");
if (cform) {
  const steps = [...cform.querySelectorAll(".consult__step")];
  const prog = [...document.querySelectorAll(".progress li")];
  const mobileLabel = document.querySelector(".progress__label-mobile");
  const back = document.getElementById("consult-back"), next = document.getElementById("consult-next");
  const box = document.getElementById("consult-errors");
  const KEY = "aangan-consultation";
  let step = 0;

  // Preserve values between steps and reloads
  const saved = JSON.parse(sessionStorage.getItem(KEY) || "{}");
  Object.entries(saved).forEach(([name, val]) => {
    cform.querySelectorAll(`[name="${name}"]`).forEach((el) => {
      if (el.type === "checkbox" || el.type === "radio") el.checked = [].concat(val).includes(el.value);
      else if (el.type !== "file") el.value = val;
    });
  });
  const persist = () => {
    const o = {};
    new FormData(cform).forEach((v, k) => { if (v instanceof File) return; o[k] = k in o ? [].concat(o[k], v) : v; });
    sessionStorage.setItem(KEY, JSON.stringify(o));
  };
  cform.addEventListener("change", persist);

  const titles = steps.map((s) => s.dataset.title);
  const go = (n, init = false) => {
    step = n;
    steps.forEach((s, i) => (s.hidden = i !== n));
    prog.forEach((li, i) => { li.classList.toggle("is-done", i < n); i === n ? li.setAttribute("aria-current", "step") : li.removeAttribute("aria-current"); });
    mobileLabel.textContent = `Step ${n + 1} of ${steps.length} · ${titles[n]}`;
    back.disabled = n === 0;
    next.textContent = n === steps.length - 1 ? "Submit request" : "Continue";
    box.hidden = true;
    if (n === steps.length - 1) review();
    if (init) return;
    document.getElementById("consult-top").scrollIntoView({ block: "start" });
    steps[n].querySelector("legend")?.focus();
  };
  const val = (name) => [...cform.querySelectorAll(`[name="${name}"]`)].filter((e) => (e.type === "checkbox" || e.type === "radio" ? e.checked : true)).map((e) => (e.tagName === "SELECT" ? (e.value ? e.selectedOptions[0]?.text : "") : e.value)).filter(Boolean).join(", ");
  const review = () => {
    const files = cform.querySelector("input[type=file]")?.files.length || 0;
    const rows = [
      ["Project", [val("project_type"), val("property_type"), val("city")].filter(Boolean).join(" · "), 0],
      ["Requirements", [val("area") && `~${val("area")}`, val("rooms"), val("style"), files ? `${files} image${files > 1 ? "s" : ""}` : ""].filter(Boolean).join(" · "), 1],
      ["Budget & timeline", [val("budget"), val("start") && `Start ${val("start")}`, val("timeframe")].filter(Boolean).join(" · "), 2],
    ];
    document.getElementById("review").innerHTML = rows.map(([h, v, s]) => `<div><dt>${h}</dt><dd>${v || "Not specified"}</dd><button type="button" data-edit="${s}">Edit<span class="visually-hidden"> ${h}</span></button></div>`).join("");
  };
  document.getElementById("review").addEventListener("click", (e) => { const b = e.target.closest("[data-edit]"); if (b) go(+b.dataset.edit); });
  back.addEventListener("click", () => step > 0 && go(step - 1));

  const ok = document.getElementById("consult-success"), fail = document.getElementById("consult-failed"), flow = document.getElementById("consult-flow");
  cform.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bad = validate(steps[step]); summary(box, bad); if (bad.length) return;
    if (step < steps.length - 1) return go(step + 1);
    busy(next, true, "Sending…");
    try { await send(cform, { subject: "New consultation request — AANGAN website" }); sessionStorage.removeItem(KEY); flow.hidden = true; fail.hidden = true; ok.hidden = false; ok.querySelector("h2").focus(); }
    catch { fail.hidden = false; fail.focus(); }
    finally { busy(next, false, "Submit request"); }
  });
  document.getElementById("consult-retry")?.addEventListener("click", () => cform.requestSubmit());
  go(0, true);
}

})();
