use tauri::Manager;

#[tauri::command]
fn check_backend() -> bool {
    std::net::TcpStream::connect("127.0.0.1:3001").is_ok()
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![check_backend])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
