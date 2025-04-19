import React, { useState, useEffect, useContext } from 'react';
import { GrindContext } from '../App';
import xIcon from '../assets/x.png';
import wwwIcon from '../assets/www.png';
import discordIcon from '../assets/discord.png';
import telegramIcon from '../assets/telegram.png';
import alphabotIcon from '../assets/alphabot.png';

function Notifications() {
  const { account } = useContext(GrindContext);
  const [notifications, setNotifications] = useState([]);
  const [wenNotifications, setWenNotifications] = useState([]);
  const [projects, setProjects] = useState([]);

  const getToday = () => new Date();
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const isToday = (date) => {
    if (!date) return false;
    const projectDate = new Date(date);
    if (isNaN(projectDate.getTime())) {
      console.log('Date invalide:', date);
      return false;
    }
    const today = getToday();
    const todayStr = today.toISOString().split('T')[0];
    const projectDateStr = projectDate.toISOString().split('T')[0];
    console.log(`Comparaison isToday: ${projectDateStr} vs ${todayStr}`);
    return projectDateStr === todayStr;
  };

  const isTomorrow = (date) => {
    if (!date) return false;
    const projectDate = new Date(date);
    if (isNaN(projectDate.getTime())) {
      console.log('Date invalide:', date);
      return false;
    }
    const tomorrow = getTomorrow();
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const projectDateStr = projectDate.toISOString().split('T')[0];
    console.log(`Comparaison isTomorrow: ${projectDateStr} vs ${tomorrowStr}`);
    return projectDateStr === tomorrowStr;
  };

  const isPassed = (date) => {
    if (!date) return false;
    const projectDate = new Date(date);
    if (isNaN(projectDate.getTime())) {
      console.log('Date invalide:', date);
      return false;
    }
    const tomorrow = getTomorrow();
    return projectDate < tomorrow;
  };

  const handleDeleteNotification = (notificationId) => {
    const confirmDelete = window.confirm('Voulez-vous supprimer cette notification ?');
    if (!confirmDelete) return;

    const updatedNotifications = notifications.filter((notif) => notif.id !== notificationId);
    console.log('Suppression notification ID:', notificationId);
    setNotifications(updatedNotifications);
    if (account) {
      localStorage.setItem(`notifications_${account}`, JSON.stringify(updatedNotifications));
    }
  };

  const handleDeleteWenNotification = (notificationId, projectId) => {
    const confirmDelete = window.confirm('Voulez-vous supprimer cette notification WEN ?');
    if (!confirmDelete) return;

    const updatedWenNotifications = wenNotifications.filter((n) => n.id !== notificationId);
    setWenNotifications(updatedWenNotifications);
    if (account) {
      localStorage.setItem(`wenNotifications_${account}`, JSON.stringify(updatedWenNotifications));
      localStorage.setItem(`wenNotificationCount_${account}`, updatedWenNotifications.length.toString());
      console.log(`Notification WEN supprimée: ${notificationId}, Projet: ${projectId}`);
    }
  };

  useEffect(() => {
    if (!account) {
      console.log('Aucun account, notifications et projets vides');
      setNotifications([]);
      setWenNotifications([]);
      setProjects([]);
      localStorage.setItem(`notificationCount_${account}`, '0');
      localStorage.setItem(`wenNotificationCount_${account}`, '0');
      return;
    }

    const savedNotifications = localStorage.getItem(`notifications_${account}`);
    const loadedNotifications = savedNotifications ? JSON.parse(savedNotifications) : [];
    console.log('Chargement notifications historiques:', loadedNotifications);
    setNotifications(loadedNotifications);

    const savedProjects = localStorage.getItem(`projects_${account}`);
    let loadedProjects = savedProjects ? JSON.parse(savedProjects) : [];
    console.log('Chargement projets:', loadedProjects);

    const savedWenNotifications = localStorage.getItem(`wenNotifications_${account}`);
    const loadedWenNotifications = savedWenNotifications ? JSON.parse(savedWenNotifications) : [];
    console.log('Chargement notifications WEN:', loadedWenNotifications);
    setWenNotifications(loadedWenNotifications);

    // Nettoyer les projets qui sont aussi dans wenNotifications
    const wenProjectIds = loadedWenNotifications.map((n) => n.project.id);
    loadedProjects = loadedProjects.filter((project) => !wenProjectIds.includes(project.id));
    console.log('Projets après nettoyage des WEN:', loadedProjects);
    setProjects(loadedProjects);
    if (account) {
      localStorage.setItem(`projects_${account}`, JSON.stringify(loadedProjects));
    }

    const todayCount = loadedProjects.filter((project) => isToday(project.mintDate)).length;
    const tomorrowCount = loadedProjects.filter((project) => isTomorrow(project.mintDate)).length;
    const todayTomorrowCount = todayCount + tomorrowCount;
    console.log(`Projets aujourd'hui: ${todayCount}, demain: ${tomorrowCount}`);
    localStorage.setItem(`notificationCount_${account}`, todayTomorrowCount.toString());
    localStorage.setItem(`wenNotificationCount_${account}`, loadedWenNotifications.length.toString());
    console.log('Mise à jour compteur notifications normales:', todayTomorrowCount);
    console.log('Mise à jour compteur notifications WEN:', loadedWenNotifications.length);
  }, [account]);

  const normalNotifications = projects
    .filter(
      (project) =>
        (isToday(project.mintDate) || isTomorrow(project.mintDate)) &&
        !wenNotifications.some((n) => n.project.id === project.id)
    )
    .map((project) => ({
      id: `normal_${project.id}`,
      project,
      date: project.mintDate,
      passed: false,
    }));

  const historicalNotifications = projects
    .filter((project) => isPassed(project.mintDate) && !isToday(project.mintDate))
    .map((project) => ({
      id: `historical_${project.id}`,
      project,
      date: project.mintDate,
      passed: true,
    }));

  const wenNotificationsList = wenNotifications
    .filter((n) => !projects.some((p) => p.id === n.project.id))
    .map((n) => ({
      ...n,
      id: n.id,
      project: n.project,
      date: n.project.provisionalDate || null,
      passed: false,
    }));

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#00DDAF' }}>
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Notifications</h1>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notifications Normales</h2>
        {normalNotifications.length === 0 ? (
          <p className="text-gray-700">Aucune notification normale à afficher.</p>
        ) : (
          <div className="space-y-4">
            {normalNotifications.map((notification) => {
              const project = notification.project;
              const isTodayNotification = isToday(notification.date);
              const isTomorrowNotification = isTomorrow(notification.date);

              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg shadow-md flex flex-col transition-all hover:shadow-lg relative ${
                    isTodayNotification
                      ? 'bg-red-100 border-2 border-red-500'
                      : isTomorrowNotification
                      ? 'bg-orange-100 border-2 border-orange-500'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => (e.target.src = 'https://placehold.co/48x48')}
                        />
                      ) : (
                        <span className="text-gray-500">Aucune image</span>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg text-blue-800 font-bold">{project.name}</span>
                          <span className="text-lg text-purple-600 italic">
                            ({project.type}
                            {project.customType && ` - ${project.customType}`})
                          </span>
                          <span className="text-lg text-gray-700">
                            - {project.mintDate || project.provisionalDate || 'N/A'}
                            {project.mintTime && ` à ${project.mintTime}`}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          <strong>Prix :</strong> {project.isFree ? 'Free' : project.price || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Note :</strong> {project.note || 'N/A'}/10
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex flex-row justify-center gap-2 flex-wrap">
                        {project.telegramLink && (
                          <a
                            href={project.telegramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien Telegram"
                          >
                            <img src={telegramIcon} alt="Telegram" className="w-10 h-10" />
                          </a>
                        )}
                        {project.xLink && (
                          <a
                            href={project.xLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien X"
                          >
                            <img src={xIcon} alt="X" className="w-10 h-10" />
                          </a>
                        )}
                        {project.discordLink && (
                          <a
                            href={project.discordLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien Discord"
                          >
                            <img src={discordIcon} alt="Discord" className="w-10 h-10" />
                          </a>
                        )}
                        {project.websiteLink && (
                          <a
                            href={project.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien site"
                          >
                            <img src={wwwIcon} alt="Site" className="w-10 h-10" />
                          </a>
                        )}
                        {project.platformLink && (
                          <a
                            href={project.platformLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien plateforme"
                          >
                            <img src={wwwIcon} alt="Plateforme" className="w-10 h-10" />
                          </a>
                        )}
                        {project.organizerLink && (
                          <a
                            href={project.organizerLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien organisateur"
                          >
                            <img src={alphabotIcon} alt="Organisateur" className="w-10 h-10" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    {isTodayNotification && (
                      <span className="bg-red-600 text-white px-4 py-2 rounded-lg text-lg animate-pulse inline-block">
                        Aujourd'hui
                      </span>
                    )}
                    {isTomorrowNotification && (
                      <span className="bg-orange-600 text-white px-4 py-2 rounded-lg text-lg animate-pulse inline-block">
                        Demain
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notifications WEN</h2>
        {wenNotificationsList.length === 0 ? (
          <p className="text-gray-700">Aucune notification WEN à afficher.</p>
        ) : (
          <div className="space-y-4">
            {wenNotificationsList.map((notification) => {
              const project = notification.project;
              return (
                <div
                  key={notification.id}
                  className="p-4 rounded-lg shadow-md flex flex-col transition-all hover:shadow-lg relative bg-blue-100 border-2 border-blue-500"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => (e.target.src = 'https://placehold.co/48x48')}
                        />
                      ) : (
                        <span className="text-gray-500">Aucune image</span>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg text-blue-800 font-bold">{project.name}</span>
                          <span className="text-lg text-purple-600 italic">
                            ({project.type}
                            {project.customType && ` - ${project.customType}`})
                          </span>
                          <span className="text-lg text-gray-700">
                            - {project.provisionalDate || 'N/A'}
                            {project.mintTime && ` à ${project.mintTime}`}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          <strong>Prix :</strong> {project.isFree ? 'Free' : project.price || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Note :</strong> {project.note || 'N/A'}/10
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex flex-row justify-center gap-2 flex-wrap">
                        {project.telegramLink && (
                          <a
                            href={project.telegramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien Telegram"
                          >
                            <img src={telegramIcon} alt="Telegram" className="w-10 h-10" />
                          </a>
                        )}
                        {project.xLink && (
                          <a
                            href={project.xLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien X"
                          >
                            <img src={xIcon} alt="X" className="w-10 h-10" />
                          </a>
                        )}
                        {project.discordLink && (
                          <a
                            href={project.discordLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien Discord"
                          >
                            <img src={discordIcon} alt="Discord" className="w-10 h-10" />
                          </a>
                        )}
                        {project.websiteLink && (
                          <a
                            href={project.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien site"
                          >
                            <img src={wwwIcon} alt="Site" className="w-10 h-10" />
                          </a>
                        )}
                        {project.platformLink && (
                          <a
                            href={project.platformLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien plateforme"
                          >
                            <img src={wwwIcon} alt="Plateforme" className="w-10 h-10" />
                          </a>
                        )}
                        {project.organizerLink && (
                          <a
                            href={project.organizerLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien organisateur"
                          >
                            <img src={alphabotIcon} alt="Organisateur" className="w-10 h-10" />
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteWenNotification(notification.id, project.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mt-2"
                      >
                        Supprimer WEN
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-lg text-lg inline-block">
                      WEN
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notifications Historiques</h2>
        {historicalNotifications.length === 0 ? (
          <p className="text-gray-700">Aucune notification historique à afficher.</p>
        ) : (
          <div className="space-y-4">
            {historicalNotifications.map((notification) => {
              const project = notification.project;
              return (
                <div
                  key={notification.id}
                  className="p-4 rounded-lg shadow-md flex flex-col transition-all hover:shadow-lg relative bg-gray-100 border-2 border-green-500"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => (e.target.src = 'https://placehold.co/48x48')}
                        />
                      ) : (
                        <span className="text-gray-500">Aucune image</span>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg text-blue-800 font-bold">{project.name}</span>
                          <span className="text-lg text-purple-600 italic">
                            ({project.type}
                            {project.customType && ` - ${project.customType}`})
                          </span>
                          <span className="text-lg text-gray-700">
                            - {project.mintDate || project.provisionalDate || 'N/A'}
                            {project.mintTime && ` à ${project.mintTime}`}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          <strong>Prix :</strong> {project.isFree ? 'Free' : project.price || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Note :</strong> {project.note || 'N/A'}/10
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex flex-row justify-center gap-2 flex-wrap">
                        {project.telegramLink && (
                          <a
                            href={project.telegramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien Telegram"
                          >
                            <img src={telegramIcon} alt="Telegram" className="w-10 h-10" />
                          </a>
                        )}
                        {project.xLink && (
                          <a
                            href={project.xLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien X"
                          >
                            <img src={xIcon} alt="X" className="w-10 h-10" />
                          </a>
                        )}
                        {project.discordLink && (
                          <a
                            href={project.discordLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien Discord"
                          >
                            <img src={discordIcon} alt="Discord" className="w-10 h-10" />
                          </a>
                        )}
                        {project.websiteLink && (
                          <a
                            href={project.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien site"
                          >
                            <img src={wwwIcon} alt="Site" className="w-10 h-10" />
                          </a>
                        )}
                        {project.platformLink && (
                          <a
                            href={project.platformLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien plateforme"
                          >
                            <img src={wwwIcon} alt="Plateforme" className="w-10 h-10" />
                          </a>
                        )}
                        {project.organizerLink && (
                          <a
                            href={project.organizerLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title="Lien organisateur"
                          >
                            <img src={alphabotIcon} alt="Organisateur" className="w-10 h-10" />
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mt-2"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <span className="bg-green-600 text-white px-4 py-2 rounded-lg text-lg inline-block">
                      Passé
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;