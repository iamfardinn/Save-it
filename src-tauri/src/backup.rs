use std::fs;
use std::path::{Path, PathBuf};
use chrono::Local;
use tauri::Manager;

#[tauri::command]
pub fn backup_save_folder(app_handle: tauri::AppHandle, source_path: String, game_name: String) -> Result<String, String> {
    let vault_dir = app_handle.path().app_data_dir().unwrap().join("Vault").join(&game_name);
    
    // Create timestamped folder 
    let timestamp = Local::now().format("%Y-%m-%d_%H-%M-%S").to_string();
    let backup_dir = vault_dir.join(&timestamp);
    
    if let Err(e) = fs::create_dir_all(&backup_dir) {
        return Err(format!("Failed to create backup directory: {}", e));
    }

    // Recursively copy source to backup directory
    let src = Path::new(&source_path);
    if !src.exists() {
        return Err("Source path does not exist".to_string());
    }

    match copy_recursively(src, &backup_dir) {
        Ok(_) => Ok(backup_dir.to_string_lossy().to_string()),
        Err(e) => Err(format!("Failed to copy files: {}", e))
    }
}

fn copy_recursively(source: &Path, destination: &Path) -> std::io::Result<()> {
    fs::create_dir_all(destination)?;
    for entry in fs::read_dir(source)? {
        let entry = entry?;
        let entry_path = entry.path();
        let file_name = entry_path.file_name().unwrap();
        
        let dest_path = destination.join(file_name);
        
        if entry_path.is_dir() {
            copy_recursively(&entry_path, &dest_path)?;
        } else {
            fs::copy(&entry_path, &dest_path)?;
        }
    }
    Ok(())
}
