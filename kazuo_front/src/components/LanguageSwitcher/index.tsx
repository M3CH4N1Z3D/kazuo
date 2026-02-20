"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown, Check } from "lucide-react";

export default function LanguageSwitcher({ mobile = false }: { mobile?: boolean }) {
  const { i18n } = useTranslation("global");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "es", label: "Español" },
    { code: "en", label: "English" },
    { code: "pt", label: "Português" },
    { code: "fr", label: "Français" },
  ];

  // Safely access i18n.language, falling back to 'es' if undefined
  const currentLangCode = i18n.language || "es";
  const currentLanguage = languages.find((lang) => lang.code === currentLangCode) || languages[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (mobile) {
    return (
      <div className="flex flex-col space-y-2 mt-4 border-t pt-4">
        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 px-3 py-2">
          <Globe size={18} /> Idioma
        </div>
        <div className="pl-8 flex flex-col space-y-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                currentLangCode === lang.code
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {lang.label}
              {currentLangCode === lang.code && <Check size={16} />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
        aria-label="Seleccionar idioma"
      >
        <Globe size={18} />
        <span className="hidden xl:inline">{currentLanguage.label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border rounded-md shadow-lg py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-muted transition-colors ${
                currentLangCode === lang.code
                  ? "font-bold text-primary"
                  : "text-foreground"
              }`}
            >
              {lang.label}
              {currentLangCode === lang.code && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
