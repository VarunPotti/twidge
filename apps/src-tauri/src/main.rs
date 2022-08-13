#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::Arc;

#[tokio::main]
async fn main() {
    let client = tcore::db::migrator::new_client().await.unwrap();

    tauri::Builder::default()
        .manage(Arc::new(client))
        .invoke_handler(tauri::generate_handler![
            tcore::functions::spaces::get_spaces,
            tcore::functions::spaces::create_space,
            tcore::functions::spaces::update_space_indexes,
            tcore::functions::elements::create_element,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
