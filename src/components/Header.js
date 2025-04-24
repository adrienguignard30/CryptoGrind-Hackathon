import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import grindcoin from '../assets/grindcoin.gif';
import { GrindContext } from '../App';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useTranslation } from 'react-i18next';

function Header() {
  const { t, i18n } = useTranslation();
  const { account } = useContext(GrindContext);
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [notificationCount, setNotificationCount] = useState(0);
  const [wenNotificationCount, setWenNotificationCount] = useState(0);
  const [xAccount, setXAccount] = useState(null);

  // Charger la langue depuis localStorage au démarrage
  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    const validLangs = ['en', 'fr'];
    if (savedLang && validLangs.includes(savedLang)) {
      i18n.changeLanguage(savedLang);
    } else {
      i18n.changeLanguage('en');
      localStorage.setItem('language', 'en');
    }
  }, [i18n]);

  // Gérer le changement de langue
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  console.log('Connecteurs disponibles:', connectors);
  console.log('window.ethereum disponible:', !!window.ethereum);
  console.log('MetaMask détecté:', window.ethereum?.isMetaMask);

  const updateNotificationCounts = () => {
    if (!account) {
      console.log('Aucun account, compteurs à 0');
      setNotificationCount(0);
      setWenNotificationCount(0);
      localStorage.setItem(`notificationCount_${account}`, '0');
      localStorage.setItem(`wenNotificationCount_${account}`, '0');
      return;
    }

    // Logique pour notifications normales (inchangée)
    const savedProjects = localStorage.getItem(`projects_${account}`);
    const projects = savedProjects ? JSON.parse(savedProjects) : [];
    console.log('Projets chargés:', projects.length);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const todayProjects = projects.filter((project) => project.mintDate === todayStr).length;
    const tomorrowProjects = projects.filter((project) => project.mintDate === tomorrowStr).length;
    console.log(`Projets aujourd'hui: ${todayProjects}, demain: ${tomorrowProjects}`);

    const totalNotificationCount = todayProjects + tomorrowProjects;
    console.log('Calcul compteur notifications normales:', totalNotificationCount);
    localStorage.setItem(`notificationCount_${account}`, totalNotificationCount.toString());
    setNotificationCount(totalNotificationCount);

    // Logique pour notifications WEN
    const savedWenNotifications = localStorage.getItem(`wenNotifications_${account}`);
    const wenNotifications = savedWenNotifications ? JSON.parse(savedWenNotifications) : [];
    console.log('Notifications WEN chargées:', wenNotifications);

    // Filtrer les notifications WEN valides
    const validWenNotifications = wenNotifications.filter((notif) => {
      if (!notif.notificationFrequency || notif.notificationFrequency === '') {
        console.log(`Notification WEN ignorée (pas de frequency):`, notif);
        return false;
      }

      // Calculer la prochaine date de notification
      const frequencyDays = parseInt(notif.notificationFrequency, 10);
      const createdAt = new Date(notif.createdAt);
      if (isNaN(createdAt.getTime())) {
        console.log(`Date createdAt invalide pour notification WEN:`, notif);
        return false;
      }

      const today = new Date();
      const daysSinceCreation = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24));
      const notificationsPassed = Math.floor(daysSinceCreation / frequencyDays);
      const nextNotificationDate = new Date(createdAt);
      nextNotificationDate.setDate(createdAt.getDate() + (notificationsPassed + 1) * frequencyDays);

      // Vérifier la fenêtre de temps (1 jour avant/après)
      const startDate = new Date(nextNotificationDate);
      startDate.setDate(startDate.getDate() - 1); // 1 jour avant
      const endDate = new Date(nextNotificationDate);
      endDate.setDate(endDate.getDate() + 1); // 1 jour après

      const isInWindow = today >= startDate && today <= endDate;
      console.log(
        `Notification WEN ${notif.id}: frequency=${frequencyDays}, createdAt=${createdAt}, next=${nextNotificationDate}, inWindow=${isInWindow}`
      );
      return isInWindow;
    });

    console.log('Notifications WEN valides:', validWenNotifications.length);
    localStorage.setItem(`wenNotificationCount_${account}`, validWenNotifications.length.toString());
    setWenNotificationCount(validWenNotifications.length);
  };

  // Mettre à jour les compteurs au changement de compte
  useEffect(() => {
    updateNotificationCounts();
  }, [account]);

  // Écouteur pour événement storage (compatibilité avec Home.js et NotificationWen.js)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (
        event.key === `wenNotifications_${account}` ||
        event.key === `projects_${account}` ||
        event.key === null // Événement manuel via dispatchEvent
      ) {
        console.log('Événement storage reçu, mise à jour compteurs');
        updateNotificationCounts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Garder updateNotifications pour compatibilité future
    const handleNotificationUpdate = () => {
      console.log('Événement updateNotifications reçu, mise à jour compteurs');
      updateNotificationCounts();
    };
    window.addEventListener('updateNotifications', handleNotificationUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('updateNotifications', handleNotificationUpdate);
    };
  }, [account]);

  const handleConnectMetaMask = async () => {
    try {
      console.log('Tentative de connexion MetaMask');
      const metaMaskConnector = connectors.find((c) => c.id === 'injected');
      if (metaMaskConnector) {
        console.log('Connecteur injected trouvé:', metaMaskConnector);
        connect({ connector: metaMaskConnector });
      } else if (window.ethereum && window.ethereum.isMetaMask) {
        console.log('Connecteur injected non trouvé, tentative directe via window.ethereum');
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          console.log('Connexion MetaMask réussie:', accounts[0]);
        }
      } else {
        console.error('MetaMask non détecté');
        alert(t('metaMaskNotFound'));
      }
    } catch (error) {
      console.error('Erreur lors de la connexion MetaMask:', error);
      alert(t('connectionError'));
    }
  };

  const handleConnectWalletConnect = async () => {
    try {
      console.log('Tentative de connexion WalletConnect');
      const walletConnectConnector = connectors.find((c) => c.id === 'walletConnect');
      if (walletConnectConnector) {
        console.log('Connecteur walletConnect trouvé:', walletConnectConnector);
        connect({ connector: walletConnectConnector });
      } else {
        console.error('WalletConnect non détecté');
        alert(t('walletConnectNotFound'));
      }
    } catch (error) {
      console.error('Erreur lors de la connexion WalletConnect:', error);
      alert(t('connectionError'));
    }
  };

  const handleDisconnect = () => {
    console.log('Déconnexion, nettoyage compteurs pour:', account);
    disconnect();
    setNotificationCount(0);
    setWenNotificationCount(0);
    if (account) {
      localStorage.removeItem(`notificationCount_${account}`);
      localStorage.removeItem(`wenNotificationCount_${account}`);
    }
  };

  const connectXAccount = () => {
    const username = prompt(t('enterXUsername'));
    if (username) {
      setXAccount(username);
    }
  };

  const disconnectXAccount = () => {
    setXAccount(null);
  };

  console.log('Account dans Header:', account);
  console.log('isConnected:', isConnected);
  console.log('Compteur notifications normales:', notificationCount);
  console.log('Compteur notifications WEN:', wenNotificationCount);

  return (
    <nav className="bg-gray-800 p-4 text-white flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
      <div className="flex items-center">
        <img src={grindcoin} alt={t('appName')} className="h-8 mr-2" />
        <span>{t('appName')}</span>
      </div>
      <div className="flex flex-wrap space-x-4 items-center">
        <Link to="/" className="hover:underline">
          {t('home')}
        </Link>
        <Link to="/profile" className="hover:underline">
          {t('profile')}
        </Link>
        <a
          href="https://www.makingcoffee.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {t('coffee')}
        </a>
        <Link to="/missions" className="hover:underline">
          {t('missions')}
        </Link>
        <Link to="/lottery" className="relative hover:underline flex items-center">
          <i
            className={`fas fa-envelope mr-1 ${
              wenNotificationCount > 0 && isConnected ? 'text-blue-500 animate-pulse' : ''
            }`}
          ></i>
          {t('notificationWen')}
          {wenNotificationCount > 0 && isConnected && (
            <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs animate-pulse">
              {wenNotificationCount}
            </span>
          )}
        </Link>
        <Link to="/notifications" className="relative hover:underline flex items-center">
          <i
            className={`fas fa-envelope mr-1 ${
              notificationCount > 0 && isConnected ? 'text-red-500 animate-pulse' : ''
            }`}
          ></i>
          {t('notifications')}
          {notificationCount > 0 && isConnected && (
            <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs animate-pulse">
              {notificationCount}
            </span>
          )}
        </Link>
        {/* Boutons de langue avec drapeaux */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`p-2 rounded ${i18n.language === 'en' ? 'bg-blue-500' : 'bg-gray-600'} hover:bg-blue-600`}
            title="English"
          >
            🇬🇧
          </button>
          <button
            onClick={() => handleLanguageChange('fr')}
            className={`p-2 rounded ${i18n.language === 'fr' ? 'bg-blue-500' : 'bg-gray-600'} hover:bg-blue-600`}
            title="Français"
          >
            🇫🇷
          </button>
        </div>
        {isConnected ? (
          <div className="flex items-center space-x-2">
            <span>{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : t('connected')}</span>
            <button
              onClick={handleDisconnect}
              className="bg-red-500 px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              {t('disconnectWallet')}
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleConnectMetaMask}
              className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
            >
              {t('connectMetaMask')}
            </button>
            <button
              onClick={handleConnectWalletConnect}
              className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
            >
              {t('connectWalletConnect')}
            </button>
          </div>
        )}
        {xAccount ? (
          <div className="flex items-center space-x-2">
            <span>{t('xAccount', { username: xAccount })}</span>
            <button
              onClick={disconnectXAccount}
              className="bg-red-500 px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              {t('disconnectX')}
            </button>
          </div>
        ) : (
          <button
            onClick={connectXAccount}
            className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
          >
            {t('connectX')}
          </button>
        )}
      </div>
    </nav>
  );
}

export default Header;