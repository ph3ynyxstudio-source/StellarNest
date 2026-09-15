// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

#[path = "../engine/mod.rs"]
mod engine;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Serialize, Deserialize, Clone)]
struct LastProject {
    name: String,
    #[serde(rename = "canvasMode")]
    canvas_mode: String,
    #[serde(rename = "openedAt")]
    opened_at: u64,
}

#[derive(Serialize, Deserialize, Default)]
struct LauncherState {
    #[serde(rename = "lastProject")]
    last_project: Option<LastProject>,
}

// `.stellarnest/` vit à la racine du projet, à côté de `src-tauri/`.
fn stellarnest_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join(".stellarnest")
}

fn launcher_file_path() -> PathBuf {
    stellarnest_dir().join("launcher.json")
}

fn canvas_file_path() -> PathBuf {
    stellarnest_dir().join("canvas.json")
}

// `src/` du projet frontend, à côté de `src-tauri/`.
fn project_src_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("src")
}

#[tauri::command]
fn get_last_project() -> Option<LastProject> {
    let content = fs::read_to_string(launcher_file_path()).ok()?;
    let state: LauncherState = serde_json::from_str(&content).ok()?;
    state.last_project
}

#[tauri::command]
fn save_last_project(name: String, canvas_mode: String) -> Result<(), String> {
    let opened_at = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs();

    let state = LauncherState {
        last_project: Some(LastProject {
            name,
            canvas_mode,
            opened_at,
        }),
    };

    let path = launcher_file_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let content = serde_json::to_string_pretty(&state).map_err(|e| e.to_string())?;
    fs::write(path, content).map_err(|e| e.to_string())
}

fn default_title() -> String {
    "Titre".to_string()
}

fn default_content() -> String {
    "Contenu".to_string()
}

fn default_background_color() -> String {
    "#141830".to_string()
}

fn default_border_color() -> String {
    "#2a2f52".to_string()
}

fn default_border_width() -> f64 {
    1.0
}

fn default_border_radius() -> f64 {
    12.0
}

#[derive(Serialize, Deserialize, Clone)]
struct CanvasElementState {
    id: String,
    #[serde(rename = "componentRef")]
    component_ref: String,
    #[serde(rename = "sourceLocation")]
    source_location: String,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    #[serde(default = "default_title")]
    title: String,
    #[serde(default = "default_content")]
    content: String,
    #[serde(rename = "backgroundColor", default = "default_background_color")]
    background_color: String,
    #[serde(rename = "borderColor", default = "default_border_color")]
    border_color: String,
    #[serde(rename = "borderWidth", default = "default_border_width")]
    border_width: f64,
    #[serde(rename = "borderRadius", default = "default_border_radius")]
    border_radius: f64,
}

#[derive(Serialize, Deserialize, Clone, Default)]
struct CanvasState {
    #[serde(rename = "projectId")]
    project_id: String,
    #[serde(rename = "canvasBackgroundColor", default)]
    canvas_background_color: Option<String>,
    #[serde(default)]
    elements: Vec<CanvasElementState>,
}

#[tauri::command]
fn get_canvas_state() -> CanvasState {
    fs::read_to_string(canvas_file_path())
        .ok()
        .and_then(|content| serde_json::from_str(&content).ok())
        .unwrap_or_default()
}

#[tauri::command]
fn save_canvas_state(state: CanvasState) -> Result<(), String> {
    let path = canvas_file_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let content = serde_json::to_string_pretty(&state).map_err(|e| e.to_string())?;
    fs::write(path, content).map_err(|e| e.to_string())
}

fn export_file_path() -> PathBuf {
    project_src_dir()
        .join("screens")
        .join("Export")
        .join("GeneratedPage.tsx")
}

#[tauri::command]
fn export_project() -> Result<String, String> {
    let state = get_canvas_state();
    let code = engine::generate_page(&state);

    let path = export_file_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    fs::write(&path, code).map_err(|e| e.to_string())?;
    Ok(path.display().to_string())
}

#[tauri::command]
fn export_exists() -> bool {
    export_file_path().exists()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_last_project,
            save_last_project,
            get_canvas_state,
            save_canvas_state,
            export_project,
            export_exists
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
