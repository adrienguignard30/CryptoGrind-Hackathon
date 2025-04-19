import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import grindcoin from '../assets/grindcoin.gif';
import { GrindContext } from '../App';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

function Header() {
  const { account } = useContext(GrindContext);
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [notificationCount, setNotificationCount] = useState(0);
  const [wenNotificationCount, setWenNotificationCount] = useState(0);
  const [xAccount, setXAccount] = useState(null);

  const updateNotificationCounts = () => {
    if (!account) {
      console.log('Aucun account, compteurs à 0');
      setNotificationCount(0);
      setWenNotificationCount(0);
      localStorage.setItem(`notificationCount_${account}`, '0');
      localStorage.setItem(`wenNotificationCount_${account}`, '0');
      return;
    }

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

    const savedWenNotifications = localStorage.getItem(`wenNotifications_${account}`);
    const wenNotifications = savedWenNotifications ? JSON.parse(savedWenNotifications) : [];
    console.log('Notifications WEN chargées:', wenNotifications.length);
    localStorage.setItem(`wenNotificationCount_${account}`, wenNotifications.length.toString());
    setWenNotificationCount(wenNotifications.length);
  };

  useEffect(() => {
    updateNotificationCounts();
  }, [account]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (
        event.key === `wenNotifications_${account}` ||
        event.key === `projects_${account}`
      ) {
        console.log('Changement détecté dans localStorage, mise à jour compteurs');
        updateNotificationCounts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [account]);

  const handleConnect = async () => {
    try {
      connect({ connector: connectors[0] });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      alert('Connexion non disponible.');
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
    const username = prompt('Entrez votre pseudo X :');
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
        <img src={grindcoin} alt="Grind Coin" className="h-8 mr-2" />
        <span>CryptoGrind</span>
      </div>
      <div className="flex flex-wrap space-x-4 items-center">
        <Link to="/" className="hover:underline">
          Accueil
        </Link>
        <Link to="/profile" className="hover:underline">
          Profil
        </Link>
        <a
          href="https://www.makingcoffee.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Coffee
        </a>
        <Link to="/missions" className="hover:underline">
          Missions
        </Link>
        <Link to="/lottery" className="relative hover:underline flex items-center">
          <i
            className={`fas fa-envelope mr-1 ${
              wenNotificationCount > 0 && isConnected ? 'text-blue-500 animate-pulse' : ''
            }`}
          ></i>
          Notification WEN
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
          Notifications
          {notificationCount > 0 && isConnected && (
            <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs animate-pulse">
              {notificationCount}
            </span>
          )}
        </Link>
        {isConnected ? (
          <div className="flex items-center space-x-2">
            <span>{account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connecté'}</span>
            <button
              onClick={handleDisconnect}
              className="bg-red-500 px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              Déconnexion Wallet
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
          >
            Connexion Wallet
          </button>
        )}
        {xAccount ? (
          <div className="flex items-center space-x-2">
            <span>Compte X : @{xAccount}</span>
            <button
              onClick={disconnectXAccount}
              className="bg-red-500 px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              Déconnexion X
            </button>
          </div>
        ) : (
          <button
            onClick={connectXAccount}
            className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
          >
            Connexion X
          </button>
        )}
      </div>
    </nav>
  );
}

export default Header;