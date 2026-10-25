import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <main class="notch" aria-label="WindowsNotch">
    <div class="pill">
      <span class="brand">WN</span>
      <span id="mini-title" class="mini-title">WindowsNotch</span>
      <button id="settings-toggle" class="settings-toggle" aria-label="Ouvrir les paramètres" title="Paramètres">⚙</button>
    </div>
    <section class="panel">
      <header><div><span class="eyebrow">LECTURE EN COURS</span><h1 id="title">Aucun média détecté</h1><p id="subtitle">Lance une musique ou une vidéo</p></div><span class="source">WINDOWS</span></header>
      <div class="controls" aria-label="Commandes média">
        <button data-action="previous" aria-label="Précédent" title="Précédent">◀◀</button>
        <button data-action="toggle" class="play" aria-label="Lecture ou pause" title="Lecture / pause">▶</button>
        <button data-action="next" aria-label="Suivant" title="Suivant">▶▶</button>
      </div>
      <section id="settings" class="settings" hidden>
        <h2>Paramètres</h2><p>Les options de la notch seront disponibles ici.</p>
        <label><input type="checkbox" id="startup" disabled /> Lancer au démarrage de Windows</label>
      </section>
      <footer>WindowsNotch <span>v0.1.0 — aperçu</span></footer>
    </section>
  </main>`;
const notch = document.querySelector<HTMLElement>(".notch")!;
const settings = document.querySelector<HTMLElement>("#settings")!;
document.querySelector("#settings-toggle")?.addEventListener("click", (event) => {
  event.stopPropagation();
  settings.hidden = !settings.hidden;
  notch.classList.add("expanded");
});
document.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    button.animate([{ transform: "scale(.92)" }, { transform: "scale(1)" }], { duration: 140 });
  });
});
notch.addEventListener("mouseenter", () => notch.classList.add("expanded"));
notch.addEventListener("mouseleave", () => {
  if (settings.hidden) notch.classList.remove("expanded");
});