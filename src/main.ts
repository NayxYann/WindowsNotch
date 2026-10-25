import { getVersion } from "@tauri-apps/api/app";
import { relaunch } from "@tauri-apps/api/process";
import { check, type Update } from "@tauri-apps/plugin-updater";
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
        <h2>Paramètres</h2>
        <label><input type="checkbox" id="startup" disabled /> Lancer au démarrage de Windows</label>
        <div class="updates">
          <div><strong>Mises à jour</strong><p id="update-status">Recherche de mises à jour…</p></div>
          <button id="update-button" class="update-button" disabled>Vérifier</button>
        </div>
      </section>
      <footer>WindowsNotch <span id="version">—</span></footer>
    </section>
  </main>`;
const notch = document.querySelector<HTMLElement>(".notch")!;
const settings = document.querySelector<HTMLElement>("#settings")!;
const updateStatus = document.querySelector<HTMLElement>("#update-status")!;
const updateButton = document.querySelector<HTMLButtonElement>("#update-button")!;
let pendingUpdate: Update | null = null;

async function checkForUpdate() {
  updateButton.disabled = true;
  updateStatus.textContent = "Recherche de mises à jour…";
  try {
    pendingUpdate = await check();
    if (pendingUpdate) {
      updateStatus.textContent = `Version ${pendingUpdate.version} disponible.`;
      updateButton.textContent = "Installer";
    } else {
      updateStatus.textContent = "WindowsNotch est à jour.";
      updateButton.textContent = "À jour";
    }
  } catch {
    updateStatus.textContent = "Vérification impossible pour le moment.";
    updateButton.textContent = "Réessayer";
  } finally {
    updateButton.disabled = false;
  }
}

updateButton.addEventListener("click", async () => {
  if (!pendingUpdate) {
    await checkForUpdate();
    return;
  }
  updateButton.disabled = true;
  updateButton.textContent = "Installation…";
  updateStatus.textContent = "Téléchargement et installation de la mise à jour…";
  try {
    await pendingUpdate.downloadAndInstall();
    await relaunch();
  } catch {
    updateStatus.textContent = "Échec de l’installation. Réessaie plus tard.";
    updateButton.textContent = "Réessayer";
    updateButton.disabled = false;
    pendingUpdate = null;
  }
});

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
void getVersion().then((version) => {
  const element = document.querySelector<HTMLElement>("#version");
  if (element) element.textContent = `v${version}`;
});
void checkForUpdate();