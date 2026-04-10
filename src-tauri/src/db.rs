use rusqlite::{Connection, Result};
use std::sync::Mutex;
use tauri::Manager;

pub struct AppState {
    pub db: Mutex<Connection>,
}

pub fn initialize_database(app_handle: &tauri::AppHandle) -> Result<Connection> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("failed to get app data dir");
    std::fs::create_dir_all(&app_dir).expect("failed to create app data dir");
    let db_path = app_dir.join("saveit_vault.db");

    let conn = Connection::open(db_path)?;

    // Create tables
    conn.execute(
        "CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            save_path TEXT NOT NULL,
            cover_url TEXT,
            total_playtime INTEGER DEFAULT 0,
            last_played DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS backups (
            id INTEGER PRIMARY KEY,
            game_id INTEGER NOT NULL,
            backup_path TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_milestone BOOLEAN DEFAULT 0,
            note TEXT,
            screenshot_path TEXT,
            FOREIGN KEY(game_id) REFERENCES games(id)
        )",
        [],
    )?;

    Ok(conn)
}
