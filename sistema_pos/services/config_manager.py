import json
import os
import sys

CONFIG_FILE = "config.json"

class ConfigManager:
    _instance = None
    _config = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ConfigManager, cls).__new__(cls)
            cls._instance.load_config()
        return cls._instance

    def load_config(self):
        """Load configuration from JSON file."""
        try:
            # Determine path relative to main.py or executable
            base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            config_path = os.path.join(base_path, CONFIG_FILE)
            
            if os.path.exists(config_path):
                with open(config_path, 'r', encoding='utf-8') as f:
                    self._config = json.load(f)
            else:
                self._config = self.get_defaults()
                self.save_config()
        except Exception as e:
            print(f"Error loading config: {e}")
            self._config = self.get_defaults()

    def get_defaults(self):
        return {
            "language": "es",
            "theme": "Dark",
            "store_id": "DEFAULT_STORE"
        }

    def save_config(self):
        """Save current configuration to JSON file."""
        try:
            base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            config_path = os.path.join(base_path, CONFIG_FILE)
            
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(self._config, f, indent=4)
        except Exception as e:
            print(f"Error saving config: {e}")

    def get(self, key, default=None):
        return self._config.get(key, default)

    def set(self, key, value):
        self._config[key] = value
        self.save_config()
