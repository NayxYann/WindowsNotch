#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use tauri::{Manager, PhysicalPosition};

#[derive(Serialize)]
struct MediaState {
    title: String,
    artist: String,
    source: String,
    is_playing: bool,
}

#[tauri::command]
async fn get_media_state() -> Result<Option<MediaState>, String> {
    use windows::Media::Control::{
        GlobalSystemMediaTransportControlsSessionManager as SessionManager,
        GlobalSystemMediaTransportControlsSessionPlaybackStatus,
    };

    let manager = SessionManager::RequestAsync()
        .map_err(|error| error.to_string())?
        .await
        .map_err(|error| error.to_string())?;
    let session = match manager.GetCurrentSession() {
        Ok(session) => session,
        Err(_) => return Ok(None),
    };

    let properties = session
        .TryGetMediaPropertiesAsync()
        .map_err(|error| error.to_string())?
        .await
        .map_err(|error| error.to_string())?;
    let playback = session.GetPlaybackInfo().map_err(|error| error.to_string())?;
    let status = playback.PlaybackStatus().map_err(|error| error.to_string())?;

    Ok(Some(MediaState {
        title: properties.Title().map_err(|error| error.to_string())?.to_string_lossy(),
        artist: properties.Artist().map_err(|error| error.to_string())?.to_string_lossy(),
        source: session.SourceAppUserModelId().map_err(|error| error.to_string())?.to_string_lossy(),
        is_playing: status == GlobalSystemMediaTransportControlsSessionPlaybackStatus::Playing,
    }))
}

#[tauri::command]
async fn control_media(action: String) -> Result<(), String> {
    use windows::Media::Control::GlobalSystemMediaTransportControlsSessionManager as SessionManager;

    let manager = SessionManager::RequestAsync()
        .map_err(|error| error.to_string())?
        .await
        .map_err(|error| error.to_string())?;
    let session = manager
        .GetCurrentSession()
        .map_err(|_| "Aucun média actif.".to_string())?;

    let operation = match action.as_str() {
        "toggle" => session.TryTogglePlayPauseAsync(),
        "previous" => session.TrySkipPreviousAsync(),
        "next" => session.TrySkipNextAsync(),
        _ => return Err("Commande média inconnue.".into()),
    }
    .map_err(|error| error.to_string())?;

    operation.await.map_err(|error| error.to_string())?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![get_media_state, control_media])
        .setup(|app| {
            let window = app.get_webview_window("main").expect("fenêtre principale absente");
            if let Some(monitor) = window.current_monitor()? {
                let origin = monitor.position();
                let screen = monitor.size();
                let window_size = window.outer_size()?;
                let x = origin.x + (screen.width as i32 - window_size.width as i32) / 2;
                window.set_position(PhysicalPosition::new(x, origin.y))?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("erreur au lancement de WindowsNotch");
}