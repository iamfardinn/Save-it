use sysinfo::{System, ProcessRefreshKind, RefreshKind};

#[tauri::command]
pub fn check_game_running(game_executable: &str) -> bool {
    // We only need to check processes, so we initialize System with only process info
    let mut sys = System::new_with_specifics(
        RefreshKind::new().with_processes(ProcessRefreshKind::everything())
    );
    
    // Refresh process data
    sys.refresh_processes();

    // Check if any process matches our game executable (case insensitive)
    for (_pid, process) in sys.processes() {
        if let Some(exe_name) = process.name().to_lowercase().split('.').next() {
            let target = game_executable.to_lowercase();
            // Match without extension (e.g. "eldenring" == "eldenring")
            let target_no_ext = target.split('.').next().unwrap_or(&target);
            
            if exe_name == target_no_ext {
                return true;
            }
        }
    }
    
    false
}
