import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import en from './en.json';
import es from './es.json';

const device = RNLocalize.getLocales()?.[0]?.languageCode || 'en'; // 'es' en Honduras, 'en' en EE.UU., etc.

i18n
  .use(initReactI18next)
  .init({
    lng: device,              // idioma por defecto según país/telefono
    fallbackLng: ['en', 'es'],
    resources: { en:{translation: en}, es:{translation: es} },
    interpolation: { escapeValue: false },
  });

export default i18n;