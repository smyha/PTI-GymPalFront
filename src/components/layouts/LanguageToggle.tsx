'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { settingsApi } from '@/features/settings/api/api';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ca', name: 'Català', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = async (langCode: string) => {
    try {
      // Change language in the app
      i18n.changeLanguage(langCode);

      // Store language preference in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', langCode);
      }

      // Update language preference in backend
      try {
        await settingsApi.updateSettings({ language: langCode });
      } catch (err) {
        console.error('Error updating language in backend:', err);
        // Still change the language locally even if backend update fails
      }

      setIsOpen(false);
    } catch (err) {
      console.error('Error changing language:', err);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative h-9 w-9 p-0"
        aria-label="Change language"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="h-5 w-5" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Language selector dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-[999]">
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${
                    i18n.language === lang.code
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="flex-1">{lang.name}</span>
                  {i18n.language === lang.code && (
                    <span className="text-emerald-500">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

