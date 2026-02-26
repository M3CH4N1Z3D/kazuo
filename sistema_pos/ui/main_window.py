import customtkinter as ctk
import tkinter as tk
from tkinter import ttk, messagebox
import uuid
from datetime import datetime
import os
import sys
from PIL import Image

# Add parent directory to path to import database and services
# current file is in sistema_pos/ui/main_window.py
# parent is sistema_pos/ui
# grandparent is sistema_pos
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from database import get_db_connection
from services.i18n import TranslationService
from services.config_manager import ConfigManager

class MainWindow(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.i18n = TranslationService()
        self.config = ConfigManager()

        self.title("Spot-On POS")
        self.geometry("1000x600")
        
        # Set theme from config
        ctk.set_appearance_mode(self.config.get("theme", "Dark"))
        ctk.set_default_color_theme("blue")

        self.cart = [] # List of dictionaries: {id, code, name, price, quantity, total}
        
        # Main Layout: TabView
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)

        self.tabview = ctk.CTkTabview(self)
        self.tabview.grid(row=0, column=0, sticky="nsew", padx=10, pady=10)

        # Create Tabs
        self.tab_pos = self.tabview.add("POS")
        self.tab_settings = self.tabview.add("Settings") # Initial name, updated later

        # Configure POS Tab Grid
        self.tab_pos.grid_columnconfigure(1, weight=1)
        self.tab_pos.grid_rowconfigure(1, weight=1)
        
        self.create_pos_widgets()
        self.create_settings_widgets()
        
        self.bind_events()
        
        # Start periodic sync status check
        self.check_sync_status()

        # Update texts to initial language
        self.update_ui_texts()

    def create_pos_widgets(self):
        # --- Top Section: Header & Sync Status ---
        self.top_frame = ctk.CTkFrame(self.tab_pos, height=50, corner_radius=0)
        self.top_frame.grid(row=0, column=0, columnspan=3, sticky="ew")
        
        self.sync_indicator = ctk.CTkLabel(self.top_frame, text="Sync Status: ●", text_color="gray", font=ctk.CTkFont(size=14, weight="bold"))
        self.sync_indicator.pack(side="right", padx=20, pady=10)

        # --- Left Section: Product Input ---
        self.left_frame = ctk.CTkFrame(self.tab_pos, width=250, corner_radius=0)
        self.left_frame.grid(row=1, column=0, sticky="ns")
        self.left_frame.grid_propagate(False) # Fixed width

        # Load logo image
        try:
            # Re-calculate path since we are in ui/main_window.py
            logo_path = os.path.join(parent_dir, "resources", "logo.png")
            
            # Load image and calculate size
            if os.path.exists(logo_path):
                pil_image = Image.open(logo_path)
                # Calculate size maintaining aspect ratio for width ~220
                base_width = 220
                w_percent = (base_width / float(pil_image.size[0]))
                h_size = int((float(pil_image.size[1]) * float(w_percent)))
                
                self.logo_image = ctk.CTkImage(light_image=pil_image,
                                             dark_image=pil_image,
                                             size=(base_width, h_size))
                self.logo_label = ctk.CTkLabel(self.left_frame, text="", image=self.logo_image)
                self.logo_label.pack(pady=(20, 10), padx=15)
            else:
                raise FileNotFoundError("Logo not found")
        except Exception as e:
            print(f"Error loading logo: {e}")
            self.logo_label = ctk.CTkLabel(self.left_frame, text="Spot-On POS", font=ctk.CTkFont(size=20, weight="bold"))
            self.logo_label.pack(pady=20, padx=10)

        self.input_label = ctk.CTkLabel(self.left_frame, text="Product Code / Barcode", font=ctk.CTkFont(size=14))
        self.input_label.pack(pady=(20, 5), padx=10)

        self.product_entry = ctk.CTkEntry(self.left_frame, placeholder_text="Scan or type code...")
        self.product_entry.pack(pady=5, padx=10, fill="x")
        self.product_entry.focus_set() # Auto-focus

        self.search_btn = ctk.CTkButton(self.left_frame, text="Add to Cart", command=self.on_add_product)
        self.search_btn.pack(pady=10, padx=10, fill="x")

        # --- Center Section: Cart Table ---
        self.center_frame = ctk.CTkFrame(self.tab_pos, corner_radius=0)
        self.center_frame.grid(row=1, column=1, sticky="nsew")
        
        # Treeview Style
        style = ttk.Style()
        style.theme_use("default")
        style.configure("Treeview", 
                        background="#2b2b2b", 
                        foreground="white", 
                        fieldbackground="#2b2b2b", 
                        rowheight=30)
        style.map("Treeview", background=[('selected', '#1f538d')])
        style.configure("Treeview.Heading", background="#333333", foreground="white", font=('Arial', 10, 'bold'))

        self.columns = ("code", "name", "price", "qty", "total")
        self.cart_tree = ttk.Treeview(self.center_frame, columns=self.columns, show="headings", selectmode="browse")
        
        # Headings are set in update_ui_texts
        self.cart_tree.column("code", width=100)
        self.cart_tree.column("name", width=250)
        self.cart_tree.column("price", width=80, anchor="e")
        self.cart_tree.column("qty", width=50, anchor="center")
        self.cart_tree.column("total", width=80, anchor="e")

        self.cart_tree.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Delete item binding
        self.cart_tree.bind("<Delete>", self.on_delete_item)

        # --- Right Section: Totals & Pay ---
        self.right_frame = ctk.CTkFrame(self.tab_pos, width=250, corner_radius=0)
        self.right_frame.grid(row=1, column=2, sticky="ns")
        self.right_frame.grid_propagate(False)

        self.total_label_title = ctk.CTkLabel(self.right_frame, text="Total Amount", font=ctk.CTkFont(size=16))
        self.total_label_title.pack(pady=(40, 5), padx=10)

        self.total_value_label = ctk.CTkLabel(self.right_frame, text="$0.00", font=ctk.CTkFont(size=32, weight="bold"), text_color="#2CC985")
        self.total_value_label.pack(pady=5, padx=10)

        self.pay_btn = ctk.CTkButton(self.right_frame, text="PAY / CHECKOUT", command=self.on_pay, height=50, fg_color="#2CC985", hover_color="#25A970")
        self.pay_btn.pack(pady=40, padx=20, fill="x")
        
        self.clear_btn = ctk.CTkButton(self.right_frame, text="Clear Cart", command=self.clear_cart, fg_color="#C0392B", hover_color="#A93226")
        self.clear_btn.pack(side="bottom", pady=20, padx=20, fill="x")

    def create_settings_widgets(self):
        self.settings_frame = ctk.CTkFrame(self.tab_settings)
        self.settings_frame.pack(fill="both", expand=True, padx=20, pady=20)

        self.settings_title = ctk.CTkLabel(self.settings_frame, text="Settings", font=ctk.CTkFont(size=24, weight="bold"))
        self.settings_title.pack(pady=(20, 20))

        # Language Selector
        self.lang_label = ctk.CTkLabel(self.settings_frame, text="Language", font=ctk.CTkFont(size=16))
        self.lang_label.pack(pady=(10, 5))

        self.lang_map = {
            "Español": "es",
            "English": "en",
            "Français": "fr",
            "Português": "pt"
        }
        self.reverse_lang_map = {v: k for k, v in self.lang_map.items()}
        
        current_lang_code = self.config.get("language", "es")
        current_lang_display = self.reverse_lang_map.get(current_lang_code, "Español")

        self.lang_combo = ctk.CTkOptionMenu(self.settings_frame, 
                                            values=list(self.lang_map.keys()),
                                            command=self.change_language)
        self.lang_combo.set(current_lang_display)
        self.lang_combo.pack(pady=5)

        # Store ID
        self.store_id_label = ctk.CTkLabel(self.settings_frame, text="Store ID (Restart to apply)", font=ctk.CTkFont(size=16))
        self.store_id_label.pack(pady=(20, 5))
        
        current_store_id = self.config.get("store_id", "DEFAULT_STORE")
        self.store_id_entry = ctk.CTkEntry(self.settings_frame)
        self.store_id_entry.insert(0, current_store_id)
        self.store_id_entry.pack(pady=5)
        
        self.save_settings_btn = ctk.CTkButton(self.settings_frame, text="Save Settings", command=self.save_settings)
        self.save_settings_btn.pack(pady=20)

    def change_language(self, choice):
        lang_code = self.lang_map[choice]
        self.i18n.set_language(lang_code)
        self.update_ui_texts()

    def save_settings(self):
        store_id = self.store_id_entry.get()
        self.config.set("store_id", store_id)
        messagebox.showinfo("Settings Saved", "Settings saved successfully. Please restart application if needed.")

    def update_ui_texts(self):
        _ = self.i18n.get
        
        # Tabs
        # Note: CTkTabview doesn't expose easy way to rename tabs dynamically via configure?
        # We can try referencing the buttons directly if possible, or just accept static names for now.
        # But actually we can do self.tabview._segmented_button.configure(values=[...]) but that resets content.
        # Easier: Just don't update tab titles dynamically for now, or use a workaround.
        # Actually, self.tabview._segmented_button._buttons_dict["POS"].configure(text="...")
        try:
            # This is internal API usage, might break in future versions of CTk
            self.tabview._segmented_button._buttons_dict["POS"].configure(text="POS") # Static for now or find localized key
            # self.tabview._segmented_button._buttons_dict["Settings"].configure(text=_("settings.title")) 
            # Let's keep tabs simple "POS" and "Config"
            self.tabview._segmented_button._buttons_dict["Settings"].configure(text=_("settings.title"))
        except:
            pass

        # Top Frame
        # self.sync_indicator.configure(text=...) # Handled by check_sync_status

        # Left Frame
        self.input_label.configure(text=_("pos.input_label"))
        self.product_entry.configure(placeholder_text=_("pos.input_placeholder"))
        self.search_btn.configure(text=_("pos.add_to_cart"))

        # Center Frame (Treeview)
        self.cart_tree.heading("code", text=_("pos.table.code"))
        self.cart_tree.heading("name", text=_("pos.table.name"))
        self.cart_tree.heading("price", text=_("pos.table.price"))
        self.cart_tree.heading("qty", text=_("pos.table.qty"))
        self.cart_tree.heading("total", text=_("pos.table.total"))

        # Right Frame
        self.total_label_title.configure(text=_("pos.total_amount"))
        self.pay_btn.configure(text=_("pos.pay_checkout"))
        self.clear_btn.configure(text=_("pos.clear_cart"))

        # Settings
        self.settings_title.configure(text=_("settings.title"))
        self.lang_label.configure(text=_("settings.language"))
        
        # Force sync status update to refresh text
        self.check_sync_status()

    def bind_events(self):
        self.product_entry.bind("<Return>", lambda event: self.on_add_product())

    def on_add_product(self):
        code = self.product_entry.get().strip()
        if not code:
            return

        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Search by code or exact name
        cursor.execute("SELECT * FROM products WHERE code = ? OR name = ?", (code, code))
        product = cursor.fetchone()
        conn.close()

        if product:
            self.add_to_cart(product)
            self.product_entry.delete(0, 'end')
        else:
            msg = self.i18n.get("pos.alerts.not_found_msg", code=code)
            title = self.i18n.get("pos.alerts.not_found_title")
            messagebox.showwarning(title, msg)
            self.product_entry.select_range(0, 'end')

    def add_to_cart(self, product):
        # Check if already in cart
        current_qty_in_cart = 0
        for item in self.cart:
            if item['id'] == product['id']:
                current_qty_in_cart = item['quantity']
                break
        
        # Check stock availability
        available_stock = product['stock']
        if current_qty_in_cart + 1 > available_stock:
            msg = self.i18n.get("pos.alerts.insufficient_stock_msg", stock=available_stock)
            title = self.i18n.get("pos.alerts.insufficient_stock_title")
            messagebox.showwarning(title, msg)
            return

        for item in self.cart:
            if item['id'] == product['id']:
                item['quantity'] += 1
                item['total'] = item['quantity'] * item['price']
                self.update_cart_display()
                return

        # Add new item
        self.cart.append({
            'id': product['id'],
            'code': product['code'],
            'name': product['name'],
            'price': product['price'],
            'stock': product['stock'], # Keep track of stock
            'min_stock': product['min_stock'], # Keep track of min_stock
            'provider_email': product['provider_email'], # Keep track for email notifications
            'quantity': 1,
            'total': product['price']
        })
        self.update_cart_display()

    def on_delete_item(self, event):
        selected_item = self.cart_tree.selection()
        if not selected_item:
            return
        
        # Determine index
        item_values = self.cart_tree.item(selected_item)['values']
        
        for i, item in enumerate(self.cart):
            if item['code'] == str(item_values[0]): # treeview converts to string
                del self.cart[i]
                break
        
        self.update_cart_display()

    def update_cart_display(self):
        # Clear treeview
        for item in self.cart_tree.get_children():
            self.cart_tree.delete(item)
        
        total_amount = 0
        
        for item in self.cart:
            self.cart_tree.insert("", "end", values=(
                item['code'],
                item['name'],
                f"${item['price']:.2f}",
                item['quantity'],
                f"${item['total']:.2f}"
            ))
            total_amount += item['total']
            
        self.total_value_label.configure(text=f"${total_amount:.2f}")

    def clear_cart(self):
        self.cart = []
        self.update_cart_display()
        self.product_entry.focus_set()

    def on_pay(self):
        if not self.cart:
            msg = self.i18n.get("pos.alerts.empty_cart_msg")
            title = self.i18n.get("pos.alerts.empty_cart_title")
            messagebox.showinfo(title, msg)
            return
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Create Sale
            sale_id = str(uuid.uuid4())
            total_amount = sum(item['total'] for item in self.cart)
            date_now = datetime.now().isoformat()
            
            # Use ConfigManager for store_id, fallback to env/default
            store_id = self.config.get("store_id", os.getenv('STORE_ID', "DEFAULT_STORE"))
            
            cursor.execute('''
                INSERT INTO sales (id, date, total, sync_status, store_id)
                VALUES (?, ?, ?, 0, ?)
            ''', (sale_id, date_now, total_amount, store_id))
            
            # Insert Items
            for item in self.cart:
                cursor.execute('''
                    INSERT INTO sale_items (sale_id, product_id, quantity, unit_price)
                    VALUES (?, ?, ?, ?)
                ''', (sale_id, item['id'], item['quantity'], item['price']))
                
                # Update stock
                cursor.execute("UPDATE products SET stock = stock - ? WHERE id = ?", (item['quantity'], item['id']))
                
                # Check for low stock and queue email
                cursor.execute("SELECT stock, min_stock, provider_email FROM products WHERE id = ?", (item['id'],))
                prod_row = cursor.fetchone()
                
                if prod_row:
                    new_stock = prod_row['stock']
                    min_stock = prod_row['min_stock']
                    provider_email = prod_row['provider_email']
                    
                    if new_stock <= min_stock and provider_email:
                         # Queue email notification
                         cursor.execute('''
                            INSERT INTO email_queue (provider_email, product_id, date, sync_status)
                            VALUES (?, ?, ?, 0)
                         ''', (provider_email, item['id'], date_now))

            conn.commit()
            
            msg = self.i18n.get("pos.alerts.success_msg", total=f"{total_amount:.2f}")
            title = self.i18n.get("pos.alerts.success_title")
            messagebox.showinfo(title, msg)
            self.clear_cart()
            
        except Exception as e:
            conn.rollback()
            msg = self.i18n.get("pos.alerts.transaction_failed", error=str(e))
            title = self.i18n.get("pos.alerts.error_title")
            messagebox.showerror(title, msg)
        finally:
            conn.close()

    def check_sync_status(self):
        """Check if there are unsynced sales and update indicator."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Check unsynced sales
            cursor.execute("SELECT COUNT(*) as count FROM sales WHERE sync_status = 0")
            row = cursor.fetchone()
            unsynced_count = row['count'] if row else 0
            
            if unsynced_count > 0:
                text = self.i18n.get("pos.sync_pending", count=unsynced_count)
                self.sync_indicator.configure(text=text, text_color="orange")
            else:
                text = self.i18n.get("pos.sync_ok")
                self.sync_indicator.configure(text=text, text_color="#2CC985") # Green
            
            conn.close()
        except Exception as e:
            text = self.i18n.get("pos.sync_error")
            self.sync_indicator.configure(text=text, text_color="red")
            print(f"Sync check error: {e}")

        # Schedule next check in 5 seconds
        self.after(5000, self.check_sync_status)

if __name__ == "__main__":
    app = MainWindow()
    app.mainloop()
