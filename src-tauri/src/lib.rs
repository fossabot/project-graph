use std::fs::File;
use std::io::Read;
use std::io::Write;

use base64::{decode, encode};
use std::env;
use std::fs::read; // 引入 read 函数用于读取文件
use tauri::Manager; // 引入 base64 编码函数
use tauri_plugin_fs::FsExt;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn is_env_exist(env_name: &str) -> bool {
    env::var_os(env_name).is_some()
}

#[tauri::command]
fn get_env_value(env_name: &str) -> Option<String> {
    env::var_os(env_name).map(|v| v.to_string_lossy().to_string())
}

#[tauri::command]
fn set_env_value(env_name: &str, env_value: &str) -> Result<bool, String> {
    env::set_var(env_name, env_value);
    Ok(true)
}

/// 通过路径打开json文件，返回json字符串
/// (应该叫save_json_by_path更合适)
#[tauri::command]
fn open_json_by_path(path: String) -> String {
    let mut file = std::fs::File::open(path).unwrap();
    let mut contents = String::new();
    file.read_to_string(&mut contents).unwrap();
    contents
}

/// 保存json字符串到指定路径
///  (应该叫save_file_by_path更合适)
#[tauri::command]
fn save_json_by_path(path: String, content: String) -> Result<bool, String> {
    let mut file = std::fs::File::create(path).unwrap();
    file.write_all(content.as_bytes()).unwrap();
    Ok(true)
}

/// 检查json文件是否存在
/// 返回true表示存在，false表示不存在
#[tauri::command]
fn check_json_exist(path: String) -> bool {
    std::path::Path::new(&path).exists()
}

#[tauri::command]
fn expand_scope(app_handle: tauri::AppHandle, folder_path: std::path::PathBuf) {
  // If possible, verify your path if it comes from your frontend.

  // true means that we want inner directories allowed too
  app_handle.fs_scope().allow_directory(&folder_path, true);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    println!("程序运行了！");

    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            is_env_exist,
            get_env_value,
            set_env_value,
            open_json_by_path,
            save_json_by_path,
            check_json_exist, // open_dev_tools
            expand_scope
        ])
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
