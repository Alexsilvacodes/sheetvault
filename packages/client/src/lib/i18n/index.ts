import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { translations, type Locale, type TranslationKey } from './translations';

const STORAGE_KEY = 'sheetvault_locale';

function getInitialLocale(): Locale {
  if (browser) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'es') {
      return stored;
    }
    const browserLang = navigator.language.slice(0, 2);
    if (browserLang === 'es') {
      return 'es';
    }
  }
  return 'en';
}

function createLocaleStore() {
  const { subscribe, set } = writable<Locale>(getInitialLocale());

  return {
    subscribe,
    set: (locale: Locale) => {
      if (browser) {
        localStorage.setItem(STORAGE_KEY, locale);
      }
      set(locale);
    }
  };
}

export const locale = createLocaleStore();

export const t = derived(locale, ($locale) => {
  return (key: TranslationKey, params?: Record<string, string>): string => {
    let text = translations[$locale][key] || translations.en[key] || key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }

    return text;
  };
});

export { type Locale, type TranslationKey } from './translations';
