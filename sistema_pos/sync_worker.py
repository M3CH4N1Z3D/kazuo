import threading
import time
import logging
import requests
import json
import os
from datetime import datetime
from dotenv import load_dotenv
from database import get_db_connection

# Load environment variables
load_dotenv()

API_URL = os.getenv('API_URL')
STORE_ID = os.getenv('STORE_ID')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class SyncWorker(threading.Thread):
    def __init__(self, interval=60):
        super().__init__()
        self.interval = interval
        self.running = True
        self.daemon = True # Daemon thread exits when main program exits

    def run(self):
        logging.info("SyncWorker started.")
        while self.running:
            try:
                self.sync_data()
            except Exception as e:
                logging.error(f"Error in SyncWorker: {e}")
            
            # Sleep for the interval
            for _ in range(self.interval):
                if not self.running:
                    break
                time.sleep(1)
        
        logging.info("SyncWorker stopped.")

    def sync_data(self):
        """
        Synchronization logic.
        This method will handle syncing sales, products, and email queue.
        """
        logging.info("Checking for data to sync...")
        
        self.push_sales()
        self.pull_products()
        self.process_email_queue()

    def push_sales(self):
        """Push pending sales to server."""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Select sales where sync_status=0
            cursor.execute("SELECT * FROM sales WHERE sync_status = 0")
            sales = cursor.fetchall()
            
            if not sales:
                logging.info("No pending sales to sync.")
                return

            sales_payload = []
            
            for sale in sales:
                sale_id = sale['id']
                
                # Get items for this sale with product code
                cursor.execute("""
                    SELECT si.*, p.code as product_code
                    FROM sale_items si
                    LEFT JOIN products p ON si.product_id = p.id
                    WHERE si.sale_id = ?
                """, (sale_id,))
                items = cursor.fetchall()
                
                items_payload = []
                for item in items:
                    # Prefer sending Barcode (code), fallback to ID if no code
                    prod_identifier = item['product_code'] if item['product_code'] else item['product_id']
                    
                    items_payload.append({
                        "productId": prod_identifier,
                        "quantity": item['quantity'],
                        "price": item['unit_price']
                    })
                
                sales_payload.append({
                    "posSaleId": sale_id,
                    "date": sale['date'],
                    "total": sale['total'],
                    "storeId": sale['store_id'] or STORE_ID,
                    "items": items_payload,
                    # "paymentMethod": "cash" # Default or add to schema later
                })
            
            # Send to backend
            if sales_payload:
                logging.info(f"[Sync Debug] Sending sales payload: {json.dumps(sales_payload)}")
                try:
                    response = requests.post(f"{API_URL}/sync/sales", json=sales_payload)
                    if response.status_code in (200, 201):
                        logging.info(f"Successfully synced {len(sales_payload)} sales.")
                        
                        # Update sync_status
                        for sale in sales:
                            cursor.execute("UPDATE sales SET sync_status = 1 WHERE id = ?", (sale['id'],))
                        conn.commit()
                    else:
                        logging.error(f"Failed to sync sales: {response.status_code} - {response.text}")
                except requests.RequestException as e:
                    logging.error(f"Network error syncing sales: {e}")
                    
        except Exception as e:
            logging.error(f"Error pushing sales: {e}")
        finally:
            conn.close()

    def pull_products(self):
        """Pull product updates from server."""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Get last update timestamp
            cursor.execute("SELECT value FROM config WHERE key = 'last_product_update'")
            row = cursor.fetchone()
            last_update = row['value'] if row else None
            
            params = {}
            if last_update:
                params['last_update'] = last_update
                
            try:
                url = f"{API_URL}/sync/products/{STORE_ID}"
                response = requests.get(url, params=params)
                
                if response.status_code == 200:
                    products = response.json()
                    if products:
                        logging.info(f"Received {len(products)} products update.")
                        
                        for p in products:
                            # Upsert product
                            cursor.execute('''
                                INSERT INTO products (id, code, name, price, stock, min_stock, provider_email, store_id, last_update)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                                ON CONFLICT(id) DO UPDATE SET
                                    code=excluded.code,
                                    name=excluded.name,
                                    price=excluded.price,
                                    stock=excluded.stock,
                                    min_stock=excluded.min_stock,
                                    provider_email=excluded.provider_email,
                                    store_id=excluded.store_id,
                                    last_update=excluded.last_update
                            ''', (
                                p.get('id'),
                                p.get('barcode', ''),
                                p.get('name', ''),
                                p.get('outPrice', 0),
                                p.get('quantity', 0),
                                p.get('minStock', 0), # Note: check backend DTO for field name, assuming camelCase mapping
                                p.get('providerEmail', ''),
                                p.get('storeId', STORE_ID),
                                datetime.now().isoformat()
                            ))
                        
                        # Update last_update config
                        now_iso = datetime.now().isoformat()
                        cursor.execute("INSERT INTO config (key, value) VALUES ('last_product_update', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", (now_iso,))
                        conn.commit()
                    else:
                        logging.info("No product updates available.")
                else:
                    logging.error(f"Failed to pull products: {response.status_code} - {response.text}")
            except requests.RequestException as e:
                logging.error(f"Network error pulling products: {e}")
                
        except Exception as e:
            logging.error(f"Error pulling products: {e}")
        finally:
            conn.close()

    def process_email_queue(self):
        """Process email queue."""
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("SELECT * FROM email_queue WHERE sync_status = 0")
            emails = cursor.fetchall()
            
            if emails:
                logging.info(f"Processing {len(emails)} emails from queue.")
                for email in emails:
                    try:
                        # Placeholder for email sending logic
                        # In a real app, use smtplib or an email service API
                        logging.info(f"Sending email to {email['provider_email']} about product {email['product_id']}")
                        
                        # Mark as sent
                        cursor.execute("UPDATE email_queue SET sync_status = 1 WHERE id = ?", (email['id'],))
                    except Exception as e:
                        logging.error(f"Failed to send email id {email['id']}: {e}")
                
                conn.commit()
                
        except Exception as e:
            logging.error(f"Error processing email queue: {e}")
        finally:
            conn.close()

    def stop(self):
        self.running = False

if __name__ == "__main__":
    # Test execution
    worker = SyncWorker(interval=5)
    worker.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        worker.stop()
        worker.join()
