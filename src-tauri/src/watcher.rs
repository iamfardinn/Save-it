use notify::{Config, Event, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::Path;
use tokio::sync::mpsc;
use tauri::{AppHandle, Emitter};

pub fn start_save_watcher(app: AppHandle, path_to_watch: String, game_id: String) {
    tauri::async_runtime::spawn(async move {
        let (tx, mut rx) = mpsc::channel(100);

        let mut watcher = match RecommendedWatcher::new(
            move |res: notify::Result<Event>| {
                if let Ok(event) = res {
                    if event.kind.is_modify() || event.kind.is_create() {
                        let _ = tx.blocking_send(event);
                    }
                }
            },
            Config::default(),
        ) {
            Ok(w) => w,
            Err(e) => {
                eprintln!("Failed to create watcher: {}", e);
                return;
            }
        };

        if let Err(e) = watcher.watch(Path::new(&path_to_watch), RecursiveMode::Recursive) {
            eprintln!("Failed to watch path {}: {}", path_to_watch, e);
            return;
        }

        while let Some(event) = rx.recv().await {
            // Extract the first changed file path
            if let Some(changed_path) = event.paths.first() {
                let file_name = changed_path
                    .file_name()
                    .map(|f| f.to_string_lossy().to_string())
                    .unwrap_or_default();

                // Skip temp/lock files and hidden files
                if file_name.starts_with('.') || file_name.ends_with(".tmp") || file_name.ends_with(".lock") {
                    continue;
                }

                let payload = serde_json::json!({
                    "game_id":    game_id,
                    "file_name":  file_name,
                    "file_path":  changed_path.to_string_lossy(),
                    "event_type": format!("{:?}", event.kind),
                    "timestamp":  chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string()
                });

                let _ = app.emit("save-detected", payload);
            }

            // 3-second debounce to avoid duplicate events for the same save
            tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;
        }
    });
}
