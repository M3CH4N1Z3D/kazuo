import customtkinter as ctk
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from database import init_db
from sync_worker import SyncWorker
from ui.main_window import MainWindow

def main():
    # Initialize database
    try:
        init_db()
        print("Database initialized.")
    except Exception as e:
        print(f"Error initializing database: {e}")
        return

    # Start Sync Worker
    try:
        worker = SyncWorker(interval=60) # Sync every 60 seconds
        worker.start()
        print("Sync Worker started.")
    except Exception as e:
        print(f"Error starting Sync Worker: {e}")

    # Start UI
    try:
        app = MainWindow()
        app.title("Spot-On POS")
        app.mainloop()
    except Exception as e:
        print(f"Error starting UI: {e}")
    finally:
        # Ensure worker stops if needed (daemon thread should handle it, but good practice)
        if 'worker' in locals() and worker.is_alive():
            worker.stop()

if __name__ == "__main__":
    main()
