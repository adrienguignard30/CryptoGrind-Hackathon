// src/i18n/i18n.js
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Fichiers de traduction
const resources = {
  en: {
    translation: {
      // Textes en anglais
      appName: 'CryptoGrind',
      home: 'Home',
      profile: 'Profile',
      coffee: 'Coffee',
      missions: 'Missions',
      notifications: 'Notifications',
      notificationWen: 'WEN Notification',
      connectWallet: 'Connect Wallet',
      disconnectWallet: 'Disconnect Wallet',
      connectX: 'Connect X',
      disconnectX: 'Disconnect X',
      resetLocalStorage: 'Reset LocalStorage',
      // Ajoutez d'autres textes ici
    },
  },
  fr: {
    translation: {
      // Textes en français
      appName: 'CryptoGrind',
      home: 'Accueil',
      profile: 'Profil',
      coffee: 'Coffee',
      missions: 'Missions',
      notifications: 'Notifications',
      notificationWen: 'Notification WEN',
      connectWallet: 'Connexion Wallet',
      disconnectWallet: 'Déconnexion Wallet',
      connectX: 'Connexion X',
      disconnectX: 'Déconnexion X',
      resetLocalStorage: 'Réinitialiser localStorage',
      // Ajoutez d'autres textes ici
    },
  },
};

i18next
  .use(LanguageDetector) // Détecte la langue du navigateur
  .use(initReactI18next) // Intègre avec React
  .init({
    resources,
    fallbackLng: 'en', // Langue par défaut : anglais
    interpolation: {
      escapeValue: false, // React échappe déjà les valeurs
    },
  });

export default i18next;