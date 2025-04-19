import React, { useState, useEffect, useContext } from 'react';
import { GrindContext } from '../App';

function NotificationWen() {
  const { account } = useContext(GrindContext);
  const [notifications, setNotifications] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (account) {
      const savedNotifications = localStorage.getItem(`wenNotifications_${account}`);
      const savedProjects = localStorage.getItem(`projects_${account}`);
      console.log('Account dans NotificationWen:', account);
      console.log('Chargement notifications WEN:', savedNotifications);
      console.log('Chargement projets:', savedProjects);
      setNotifications(savedNotifications ? JSON.parse(savedNotifications) : []);
      setProjects(savedProjects ? JSON.parse(savedProjects) : []);
    } else {
      console.log('Aucun account, notifications et projets vides');
      setNotifications([]);
      setProjects([]);
    }
  }, [account]);

  // Générer automatiquement des notifications WEN pour les projets sans mintDate
  useEffect(() => {
    if (!account || notifications.length > 0) return;

    const savedProjects = localStorage.getItem(`projects_${account}`);
    if (!savedProjects) return;

    try {
      const projects = JSON.parse(savedProjects);
      const projectsWithoutMintDate = projects.filter((project) => !project.mintDate);

      if (projectsWithoutMintDate.length > 0) {
        console.log('Projets sans mintDate trouvés:', projectsWithoutMintDate.length);
        const newWenNotifications = projectsWithoutMintDate.map((project) => ({
          id: `wen_${project.id}_${Date.now()}`,
          project,
          date: new Date().toISOString(),
        }));

        localStorage.setItem(`wenNotifications_${account}`, JSON.stringify(newWenNotifications));
        setNotifications(newWenNotifications);
        console.log('Notifications WEN générées:', newWenNotifications.length);
      }
    } catch (error) {
      console.error('Erreur lors de la génération des notifications WEN:', error);
    }
  }, [account, notifications.length]);

  // Mettre à jour le compteur
  useEffect(() => {
    if (account) {
      const savedHistoricalNotifications = localStorage.getItem(`notifications_${account}`);
      const historicalNotifications = savedHistoricalNotifications
        ? JSON.parse(savedHistoricalNotifications)
        : [];
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const isToday = (date) => {
        if (!date) return false;
        const projectDate = new Date(date);
        if (isNaN(projectDate.getTime())) return false;
        const todayStr = today.toISOString().split('T')[0];
        const projectDateStr = projectDate.toISOString().split('T')[0];
        return projectDateStr === todayStr;
      };

      const isTomorrow = (date) => {
        if (!date) return false;
        const projectDate = new Date(date);
        if (isNaN(projectDate.getTime())) return false;
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const projectDateStr = projectDate.toISOString().split('T')[0];
        return projectDateStr === tomorrowStr;
      };

      const todayTomorrowCount = projects.filter(
        (project) => isToday(project.mintDate) || isTomorrow(project.mintDate)
      ).length;
      const totalCount = notifications.length + historicalNotifications.length + todayTomorrowCount;
      console.log('Mise à jour compteur dans NotificationWen:', totalCount);
      localStorage.setItem(`notificationCount_${account}`, totalCount.toString());
    }
  }, [notifications, projects, account]);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#00DDAF' }}>
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Notifications WEN</h1>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notifications WEN</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-700">Aucune notification WEN.</p>
        ) : (
          <div className="space-y-4">
            {notifications
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 bg-white shadow-md rounded-lg transition-all hover:shadow-lg"
                >
                  <div>
                    <p className="text-gray-800">
                      Rappel pour le projet{' '}
                      <span className="font-semibold">{notif.project.name}</span> (
                      {new Date(notif.date).toLocaleString()}).
                    </p>
                    <p className="text-gray-700">
                      <strong>Type :</strong> {notif.project.type}
                      {notif.project.customType && ` (${notif.project.customType})`}
                    </p>
                    <p className="text-gray-700">
                      <strong>Date de mint :</strong> {notif.project.mintDate || 'N/A'}{' '}
                      {notif.project.mintTime || ''}
                    </p>
                    <p className="text-gray-700">
                      <strong>Note :</strong> {notif.project.note || 'N/A'}/10
                    </p>
                    <p className="text-gray-700">
                      <strong>Prix :</strong>{' '}
                      {notif.project.isFree ? 'Free' : notif.project.price || 'N/A'}
                    </p>
                    {notif.project.image && (
                      <div className="mt-2">
                        <img
                          src={notif.project.image}
                          alt={notif.project.name}
                          className="w-32 h-32 object-cover rounded-lg"
                          onError={() => console.log('Erreur chargement image:', notif.project.name)}
                        />
                      </div>
                    )}
                    <div className="mt-2">
                      <p className="text-gray-700 font-semibold">Liens :</p>
                      <div className="flex flex-col space-y-1">
                        {notif.project.telegramLink && (
                          <a
                            href={notif.project.telegramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Telegram
                          </a>
                        )}
                        {notif.project.xLink && (
                          <a
                            href={notif.project.xLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            X
                          </a>
                        )}
                        {notif.project.discordLink && (
                          <a
                            href={notif.project.discordLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Discord
                          </a>
                        )}
                        {notif.project.websiteLink && (
                          <a
                            href={notif.project.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Site
                          </a>
                        )}
                        {notif.project.platformLink && (
                          <a
                            href={notif.project.platformLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Plateforme
                          </a>
                        )}
                        {notif.project.organizerLink && (
                          <a
                            href={notif.project.organizerLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Organisateur
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationWen;