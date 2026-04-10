pub mod db;
pub mod watcher;
pub mod backup;

use tauri::Emitter;
use ::sysinfo::{System, ProcessRefreshKind, RefreshKind, ProcessesToUpdate};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutState};

// ─── Check if a specific executable is running ───────────────────────────────
#[tauri::command]
fn check_game_running(game_executable: &str) -> bool {
    let mut sys = System::new_with_specifics(
        RefreshKind::nothing().with_processes(ProcessRefreshKind::everything())
    );
    sys.refresh_processes(ProcessesToUpdate::All, false);

    let target = game_executable.to_lowercase();
    let target_no_ext = target.split('.').next().unwrap_or(&target);

    for (_pid, process) in sys.processes() {
        if let Some(exe_name) = process.name().to_string_lossy().to_lowercase().split('.').next() {
            if exe_name == target_no_ext {
                return true;
            }
        }
    }
    false
}

// ─── Check MULTIPLE executables at once, return which are running ─────────────
// Input: JSON array of {"id": "game-uuid", "exe": "eldenring.exe"}
// Output: JSON array of game IDs that are currently running
#[tauri::command]
fn get_running_games(game_executables: Vec<serde_json::Value>) -> Vec<String> {
    let mut sys = System::new_with_specifics(
        RefreshKind::nothing().with_processes(ProcessRefreshKind::everything())
    );
    sys.refresh_processes(ProcessesToUpdate::All, false);

    // Collect all running exe names (lowercase, no extension)
    let running: Vec<String> = sys.processes()
        .values()
        .filter_map(|p| {
            p.name().to_string_lossy().to_lowercase()
                .split('.').next()
                .map(|s| s.to_string())
        })
        .collect();

    // Return IDs of games whose exe is found in running processes
    game_executables.iter().filter_map(|entry| {
        let id  = entry.get("id")?.as_str()?;
        let exe = entry.get("exe")?.as_str()?;
        let exe_stem = exe.to_lowercase();
        let exe_stem = exe_stem.split('.').next().unwrap_or(&exe_stem);
        if running.iter().any(|r| r == exe_stem) {
            Some(id.to_string())
        } else {
            None
        }
    }).collect()
}

// ─── Start watching a game's save folder for file changes ────────────────────
#[tauri::command]
fn start_watching_game(app_handle: tauri::AppHandle, game_id: String, save_folder: String) -> Result<(), String> {
    if save_folder.is_empty() {
        return Err("No save folder configured".to_string());
    }
    if !std::path::Path::new(&save_folder).exists() {
        return Err(format!("Save folder does not exist: {}", save_folder));
    }
    watcher::start_save_watcher(app_handle, save_folder, game_id);
    Ok(())
}

// ─── Scan ALL running processes ───────────────────────────────────────────────
// Returns a deduplicated list of exe stems (lowercase, no extension).
// The frontend matches these against its built-in game dictionary.
// Noisy Windows system processes are filtered out so the list stays small.
#[tauri::command]
fn scan_all_processes() -> Vec<String> {
    // Common Windows/system processes to skip
    const BLOCKLIST: &[&str] = &[
        "system","idle","registry","smss","csrss","wininit","winlogon","services",
        "lsass","svchost","fontdrvhost","dwm","explorer","taskhostw","runtimebroker",
        "searchindexer","spoolsv","msdtc","wuauclt","audiodg","conhost","cmd",
        "powershell","pwsh","windowsterminal","wt","notepad","notepad++","code",
        "devenv","msbuild","git","node","npm","cargo","rustc","python","pythonw",
        "chrome","msedge","firefox","opera","brave","discord","slack","teams",
        "zoom","obs64","obs","steam","epicgameslauncher","galaxyclient","ubisoft",
        "battlenet","origin","ea app","playnite","geforceexperience","nvidia",
        "amd","igfxtray","ctfmon","regsvr32","dllhost","taskmgr","sihost",
        "searchhost","startmenuexperiencehost","shellexperiencehost","lockapp",
        "applicationframehost","textinputhost","antimalware","mbam","malwarebytes",
        "avast","avg","norton","mcafee","defender","mpcmdrun","vgc","vgtray",
        "rivatuner","msiafterburner","hwinfo64","cpuid","speccy","aida64",
    ];

    let mut sys = System::new_with_specifics(
        RefreshKind::nothing().with_processes(ProcessRefreshKind::everything())
    );
    sys.refresh_processes(ProcessesToUpdate::All, false);

    let mut seen = std::collections::HashSet::new();
    let mut result = Vec::new();

    for process in sys.processes().values() {
        let raw = process.name().to_string_lossy().to_lowercase();
        let stem = raw.split('.').next().unwrap_or(&raw).to_string();

        if stem.is_empty() { continue; }
        if BLOCKLIST.contains(&stem.as_str()) { continue; }
        if seen.contains(&stem) { continue; }

        seen.insert(stem.clone());
        result.push(stem);
    }

    result.sort();
    result
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            // Global hotkey: Ctrl+Shift+S = manual milestone snapshot
            use tauri_plugin_global_shortcut::GlobalShortcutExt;
            let ctrl_shift_s = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyS);
            let _ = app.handle().global_shortcut().on_shortcut(ctrl_shift_s, |app, _shortcut, event| {
                if event.state() == ShortcutState::Pressed {
                    let _ = app.emit("milestone-hotkey", ());
                }
            });
            let _ = app.handle().global_shortcut().register(ctrl_shift_s);

            let _conn = db::initialize_database(&app.handle()).expect("Failed to initialize database");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            check_game_running,
            get_running_games,
            scan_all_processes,
            start_watching_game,
            backup::backup_save_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
