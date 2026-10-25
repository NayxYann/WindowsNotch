import { invoke } from "@tauri-apps/api/core";
import { getVersion } from "@tauri-apps/api/app";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import "./style.css";

type MediaState = { title: string; artist: string; source: string; is_playing: boolean };

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <main class="notch" aria-label="WindowsNotch">
    <div class="pill">
      <span class="brand">WN</span>
      <span id="mini-title" class="mini-title">WindowsNotch</span>
      <button id="settings-toggle" class="settings-toggle" aria-label="Ouvrir les paramètres" title="Paramètres">⚙</button>
    </div>
    <section class="panel">
      <header><div><span class="eyebrow">LECTURE EN COURS</span><h1 id="title">Aucun média détecté</h1><p id="subtitle">Lance une musique ou une vidéo</p></div><span id="source" class="source">WINDOWS</span></header>
      <div class="controls" aria-label="Commandes média">
        <button data-action="previous" aria-label="Précédent" title="Précédent" disabled>◀◀</button>
        <button data-action="toggle" class="play" aria-label="Lecture ou pause" title="Lecture / pause" disabled>▶</button>
        <button data-action="next" aria-label="Suivant" title="Suivant" disabled>▶▶</button>
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
const title = document.querySelector<HTMLElement>("#title")!;
const subtitle = document.querySelector<HTMLElement>("#subtitle")!;
const source = document.querySelector<HTMLElement>("#source")!;
const miniTitle = document.querySelector<HTMLElement>("#mini-title")!;
const mediaButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-action]")];
const win = getCurrentWindow();
let pendingUpdate: Update | null = null;
let expanded = false;
let lastMediaKey = "";

async function setExpanded(value: boolean) {
  if (expanded === value) return;
  expanded = value;
  if (value) {
    await win.setSize(new LogicalSize(420, 310));
    notch.classList.add("expanded");
  } else {
    notch.classList.remove("expanded");
    window.setTimeout(() => void win.setSize(new LogicalSize(420, 46)), 220);
  }
}

async function refreshMedia() {
  try {
    const media = await invoke<MediaState | null>("get_media_state");
    const hasMedia = !!media && !!media.title;
    mediaButtons.forEach((button) => { button.disabled = !hasMedia; });
    if (!hasMedia || !media) {
      title.textContent = "Aucun média détecté";
      subtitle.textContent = "Lance une musique ou une vidéo";
      source.textContent = "WINDOWS";
      miniTitle.textContent = "WindowsNotch";
      lastMediaKey = "";
      return;
    }
    const key = `${media.title}|${media.artist}|${media.source}|${media.is_playing}`;
    if (key !== lastMediaKey) {
      title.textContent = media.title;
      subtitle.textContent = media.artist || " ";
      source.textContent = media.source.split(/[.!]/).filter(Boolean).at(-1) || "MÉDIA";
      miniTitle.textContent = media.title;
      document.querySelector<HTMLButtonElement>('[data-action="toggle"]')!.textContent = media.is_playing ? "Ⅱ" : "▶";
      lastMediaKey = key;
    }
  } catch {
    // Keep the notch usable when Windows has no media session yet.
  }
}

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

document.querySelector("#settings-toggle")?.addEventListener("click", async (event) => {
  event.stopPropagation();
  await setExpanded(true);
  settings.hidden = !settings.hidden;
});
mediaButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const action = button.dataset.action;
    if (!action) return;
    try {
      await invoke("control_media", { action });
      await refreshMedia();
    } catch {
      await refreshMedia();
    }
  });
});
notch.addEventListener("mouseenter", () => void setExpanded(true));
notch.addEventListener("mouseleave", () => {
  if (settings.hidden) void setExpanded(false);
});
void getVersion().then((version) => {
  const element = document.querySelector<HTMLElement>("#version");
  if (element) element.textContent = `v${version}`;
});
void refreshMedia();
window.setInterval(() => void refreshMedia(), 1500);
void checkForUpdate();