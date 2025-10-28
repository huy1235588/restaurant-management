// src-tauri/src/main.rs
// Minimal Tauri application entrypoint. This file is intentionally small and well-commented
// to serve as a scaffold for the migration from the Next.js web app to a desktop app.

#![allow(unused)]

use tauri::{generate_context, Builder};

fn main() {
    // The app builder is left minimal. Add commands, state, or plugin setup here as needed.
    Builder::default()
        .setup(|app| {
            // Called once when the Tauri runtime initializes. Good place to attach state,
            // initialize logging, or perform small bootstrap tasks.
            println!("Tauri scaffold initialized (desktop migration starting).");
            Ok(())
        })
        // run the application with generated context (reads tauri.conf.json)
        .run(generate_context!("..").expect("failed to generate context"))
        .expect("error while running Tauri application");
}
