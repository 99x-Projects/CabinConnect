import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import nbNO from '../locales/nb-NO.json';
import en from '../locales/en.json';

// CabinConnect i18n bootstrap. Delivered by U-009.
// Resolution chain per U-010 (Bolt 2): profile.locale → Accept-Language → DEFAULT_LOCALE.
// For Bolt 1 (mocks), the active locale defaults to nb-NO and is switched via the locale switcher UI.

void i18n.use(initReactI18next).init({
  resources: {
    'nb-NO': { translation: nbNO },
    en: { translation: en },
  },
  lng: 'nb-NO',
  fallbackLng: 'nb-NO',
  interpolation: { escapeValue: false }, // React already escapes
  returnNull: false,
});

export { i18n };
