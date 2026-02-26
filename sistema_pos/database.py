import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'pos.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create products table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            code TEXT,
            name TEXT,
            price REAL,
            stock INTEGER,
            min_stock INTEGER,
            provider_email TEXT,
            store_id TEXT,
            last_update TEXT
        )
    ''')
    
    # Create sales table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sales (
            id TEXT PRIMARY KEY,
            date TEXT,
            total REAL,
            sync_status INTEGER DEFAULT 0,
            store_id TEXT
        )
    ''')
    
    # Create sale_items table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sale_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id TEXT,
            product_id TEXT,
            quantity INTEGER,
            unit_price REAL,
            FOREIGN KEY (sale_id) REFERENCES sales (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
        )
    ''')
    
    # Create email_queue table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS email_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider_email TEXT,
            product_id TEXT,
            date TEXT,
            sync_status INTEGER DEFAULT 0
        )
    ''')
    
    # Create config table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS config (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
