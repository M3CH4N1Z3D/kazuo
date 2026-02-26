import json
import os
from .config_manager import ConfigManager

class TranslationService:
    _instance = None
    _translations = {}
    _current_lang = "es"

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TranslationService, cls).__new__(cls)
            cls._instance.load_current_language()
        return cls._instance

    def load_current_language(self):
        config = ConfigManager()
        self._current_lang = config.get("language", "es")
        self.load_translations(self._current_lang)

    def load_translations(self, lang_code):
        try:
            base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            file_path = os.path.join(base_path, "translations", f"{lang_code}.json")
            
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    self._translations = json.load(f)
            else:
                print(f"Translation file not found: {file_path}")
                # Fallback to empty or default if needed
                self._translations = {}
        except Exception as e:
            print(f"Error loading translations for {lang_code}: {e}")
            self._translations = {}

    def set_language(self, lang_code):
        self._current_lang = lang_code
        self.load_translations(lang_code)
        # Persist change
        ConfigManager().set("language", lang_code)

    def get(self, key, **kwargs):
        """
        Get translation for a key (dot notation supported).
        Example: get("pos.table.code")
        Supports placeholders: get("pos.sync_pending", count=5) -> "Sync: 5 pending"
        """
        keys = key.split('.')
        value = self._translations
        
        try:
            for k in keys:
                value = value[k]
            
            if isinstance(value, str):
                # Replace placeholders
                for k, v in kwargs.items():
                    value = value.replace(f"{{{{{k}}}}}", str(v))
                return value
            return value
        except (KeyError, TypeError):
            return key # Return key if not found
