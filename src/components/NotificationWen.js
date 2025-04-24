import React, { useState, useEffect, useContext } from 'react';
import { GrindContext } from '../App';
import { useTranslation } from 'react-i18next';

function NotificationWen() {
  const { t } = useTranslation();
  const { account } = useContext(GrindContext);
  const [notifications, setNotifications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [newFrequency, setNewFrequency] = useState('');
  const [nextReminderDays, setNextReminderDays] = useState(null);

  const today = new Date('2025-04-24');
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (account) {
      const savedNotifications = localStorage.getItem(`wenNotifications_${account}`);
      const savedProjects = localStorage.getItem(`projects_${account}`);
      console.log('Account dans NotificationWen:', account);
      console.log('Chargement notifications WEN:', savedNotifications);
      console.log('Chargement projets:', savedProjects);

      const projectsList = savedProjects ? JSON.parse(savedProjects) : [];
      let wenNotifications = savedNotifications ? JSON.parse(savedNotifications) : [];

      wenNotifications = wenNotifications.filter((n) => {
        const projectExists = projectsList.some((p) => p.id === n.project.id);
        const hasNoMintDate = projectExists && !projectsList.find((p) => p.id === n.project.id).mintDate;
        return projectExists && hasNoMintDate;
      });

      const projectsWithoutMintDate = projectsList.filter((project) => !project.mintDate && project.notificationFrequency);
      const newWenNotifications = projectsWithoutMintDate
        .filter((project) => !wenNotifications.some((n) => n.project.id === project.id))
        .map((project) => ({
          id: `wen_${project.id}_${Date.now()}`,
          project,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          notificationFrequency: project.notificationFrequency || '1',
        }));

      if (newWenNotifications.length > 0) {
        wenNotifications = [...wenNotifications, ...newWenNotifications];
        console.log('Notifications WEN générées:', newWenNotifications.length, newWenNotifications);
      }

      localStorage.setItem(`wenNotifications_${account}`, JSON.stringify(wenNotifications));
      setNotifications(wenNotifications);
      setProjects(projectsList);
    } else {
      console.log('Aucun account, notifications et projets vides');
      setNotifications([]);
      setProjects([]);
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      const savedHistoricalNotifications = localStorage.getItem(`notifications_${account}`);
      const historicalNotifications = savedHistoricalNotifications
        ? JSON.parse(savedHistoricalNotifications)
        : [];

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

      const validWenNotifications = notifications.filter((notif) => {
        if (!notif.notificationFrequency || notif.notificationFrequency === '') {
          console.log(`Notification WEN ignorée (pas de frequency):`, notif);
          return false;
        }

        const frequencyDays = parseInt(notif.notificationFrequency, 10);
        const createdAt = new Date(notif.createdAt);
        if (isNaN(createdAt.getTime())) {
          console.log(`Date createdAt invalide pour notification WEN:`, notif);
          return false;
        }

        const daysSinceCreation = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24));
        const notificationsPassed = Math.floor(daysSinceCreation / frequencyDays);
        const nextNotificationDate = new Date(createdAt);
        nextNotificationDate.setDate(createdAt.getDate() + (notificationsPassed + 1) * frequencyDays);

        const startDate = new Date(nextNotificationDate);
        startDate.setDate(startDate.getDate() - 1);
        const endDate = new Date(nextNotificationDate);
        endDate.setDate(endDate.getDate() + 1);

        const isInWindow = today >= startDate && today <= endDate;
        console.log(
          `Notification WEN ${notif.id}: frequency=${frequencyDays}, createdAt=${createdAt}, next=${nextNotificationDate}, inWindow=${isInWindow}`
        );
        return isInWindow;
      });

      const wenCount = validWenNotifications.length;
      const totalCount = todayTomorrowCount + wenCount;

      let minDaysUntilNextReminder = null;
      if (notifications.length > 0) {
        const daysUntilReminders = notifications
          .map((notif) => calculateDaysUntilNextReminder(notif))
          .filter((days) => days !== null && !isNaN(days) && days >= 0);
        minDaysUntilNextReminder = daysUntilReminders.length > 0 ? Math.min(...daysUntilReminders) : null;
      }
      setNextReminderDays(minDaysUntilNextReminder);

      console.log('Projets aujourd’hui + demain:', todayTomorrowCount);
      console.log('Notifications WEN comptées:', wenCount);
      console.log('Notifications historiques:', historicalNotifications.length);
      console.log('Total compteur:', totalCount);
      console.log('Prochain rappel dans (jours):', minDaysUntilNextReminder);

      localStorage.setItem(`notificationCount_${account}`, totalCount.toString());
      localStorage.setItem(`wenNotificationCount_${account}`, wenCount.toString());
      window.dispatchEvent(new CustomEvent('updateNotifications'));
    }
  }, [notifications, projects, account]);

  const calculateNextReminder = (notification) => {
    if (!notification.createdAt || !notification.notificationFrequency) {
      console.log('Données manquantes pour prochain rappel:', notification);
      return null;
    }
    const createdAt = new Date(notification.createdAt);
    createdAt.setHours(0, 0, 0, 0);
    const frequencyDays = parseInt(notification.notificationFrequency, 10);
    if (isNaN(frequencyDays) || frequencyDays <= 0) {
      console.log('Fréquence invalide:', notification.notificationFrequency);
      return null;
    }
    const daysSinceCreation = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24));
    const notificationsPassed = Math.floor(daysSinceCreation / frequencyDays);
    const nextNotificationDate = new Date(createdAt);
    nextNotificationDate.setDate(createdAt.getDate() + (notificationsPassed + 1) * frequencyDays);
    return nextNotificationDate;
  };

  const calculateRepetitions = (notification) => {
    if (!notification.createdAt || !notification.notificationFrequency) {
      console.log('Données manquantes pour calculer les répétitions:', notification);
      return 0;
    }
    const createdAt = new Date(notification.createdAt);
    createdAt.setHours(0, 0, 0, 0);
    const frequencyDays = parseInt(notification.notificationFrequency, 10);
    if (isNaN(frequencyDays) || frequencyDays <= 0) {
      console.log('Fréquence invalide:', notification.notificationFrequency);
      return 0;
    }
    const daysPassed = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24));
    const repetitions = Math.floor(daysPassed / frequencyDays);
    console.log(`Calcul répétitions pour ${notification.id}: daysPassed=${daysPassed}, frequencyDays=${frequencyDays}, repetitions=${repetitions}`);
    return repetitions;
  };

  const calculateDaysUntilNextReminder = (notification) => {
    const nextReminder = calculateNextReminder(notification);
    if (!nextReminder || isNaN(nextReminder.getTime())) {
      console.log('Date de prochain rappel invalide:', notification);
      return null;
    }
    const diffTime = nextReminder - today;
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    console.log(`Calcul jours jusqu'au prochain rappel pour ${notification.id}: daysUntil=${daysUntil}`);
    return daysUntil >= 0 ? daysUntil : 0;
  };

  const renderRepetitionText = (notif) => {
    const repetitions = calculateRepetitions(notif);
    const frequency = notif.notificationFrequency || '1';
    const daysUntil = calculateDaysUntilNextReminder(notif);
    
    if (repetitions >= 0 && frequency && daysUntil !== null) {
      // Décommenter pour réactiver les traductions une fois les chiffres confirmés
      /*
      return t('repetitions', {
        count: repetitions,
        frequency: frequency,
        daysUntil: daysUntil,
        s1: parseInt(frequency, 10) !== 1 ? 's' : '',
        s2: daysUntil !== 1 ? 's' : '',
      });
      */
      return `${repetitions} repetition${repetitions !== 1 ? 's' : ''} (every ${frequency} day${parseInt(frequency, 10) !== 1 ? 's' : ''}) - next in ${daysUntil === 0 ? 'today' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}`;
    }
    return '0 repetition(s) (every 1 day) - next in N/A day(s)';
  };

  const formatProjectName = (project) => {
    const nameEn = project.name_en || project.name;
    const nameFr = project.name_fr || project.name;
    if (nameEn && nameFr && nameEn !== nameFr) {
      return `${nameEn} (${nameFr})`;
    }
    return nameEn || nameFr || 'N/A';
  };

  const handleFrequencyClick = (notificationId) => {
    const notification = notifications.find((n) => n.id === notificationId);
    setSelectedNotificationId(notificationId);
    setNewFrequency(notification.notificationFrequency || '1');
    setShowFrequencyModal(true);
  };

  const handleFrequencyUpdate = () => {
    if (!newFrequency || isNaN(parseInt(newFrequency)) || parseInt(newFrequency) <= 0) {
      alert(t('invalid_frequency'));
      return;
    }

    const updatedNotifications = notifications.map((n) =>
      n.id === selectedNotificationId
        ? { ...n, notificationFrequency: newFrequency, createdAt: new Date().toISOString() }
        : n
    );

    const updatedProjects = projects.map((p) =>
      p.id === notifications.find((n) => n.id === selectedNotificationId).project.id
        ? { ...p, notificationFrequency: newFrequency }
        : p
    );

    localStorage.setItem(`wenNotifications_${account}`, JSON.stringify(updatedNotifications));
    localStorage.setItem(`projects_${account}`, JSON.stringify(updatedProjects));
    setNotifications(updatedNotifications);
    setProjects(updatedProjects);
    setShowFrequencyModal(false);
    window.dispatchEvent(new CustomEvent('updateNotifications'));
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#00DDAF' }}>
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        {nextReminderDays !== null
          ? t('wen_notifications_title', {
              days: nextReminderDays,
              daysS: nextReminderDays !== 1 ? 's' : '',
            })
          : t('wen_notifications_title', { days: 'N/A', daysS: '' })}
      </h1>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {nextReminderDays !== null
            ? t('wen_notifications_subtitle', {
                days: nextReminderDays,
                daysS: nextReminderDays !== 1 ? 's' : '',
              })
            : t('wen_notifications_subtitle', { days: 'N/A', daysS: '' })}
        </h2>
        {notifications.length === 0 ? (
          <p className="text-gray-700">{t('no_wen_notifications')}</p>
        ) : (
          <div className="space-y-4">
            {notifications
              .sort((a, b) => {
                const dateA = calculateNextReminder(a);
                const dateB = calculateNextReminder(b);
                return dateA && dateB ? dateA - dateB : 0;
              })
              .map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 bg-white shadow-md rounded-lg transition-all hover:shadow-lg relative"
                >
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => handleFrequencyClick(notif.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600 max-w-sm whitespace-pre-wrap text-right"
                    >
                      {renderRepetitionText(notif)}
                    </button>
                  </div>
                  <div>
                    <p className="text-gray-800">
                      {t('reminder_for_project', {
                        name: formatProjectName(notif.project),
                        date: new Date(notif.date).toLocaleString(),
                        daysUntil: calculateDaysUntilNextReminder(notif) ?? 'N/A',
                      })}
                    </p>
                    <p className="text-gray-700">
                      <strong>{t('type')} :</strong> {notif.project.type}
                      {notif.project.customType && ` (${notif.project.customType})`}
                    </p>
                    <p className="text-gray-700">
                      <strong>{t('mint_date')} :</strong> {notif.project.mintDate || t('na')}
                      {notif.project.mintTime && ` ${t('at')} ${notif.project.mintTime}`}
                    </p>
                    <p className="text-gray-700">
                      <strong>{t('note')} :</strong> {notif.project.note || t('na')}/10
                    </p>
                    <p className="text-gray-700">
                      <strong>{t('price')} :</strong>{' '}
                      {notif.project.isFree ? t('free') : notif.project.price || t('na')}
                    </p>
                    {notif.project.image && (
                      <div className="mt-2">
                        <img
                          src={notif.project.image}
                          alt={formatProjectName(notif.project)}
                          className="w-32 h-32 object-cover rounded-lg"
                          onError={() => console.log('Erreur chargement image:', notif.project.name)}
                        />
                      </div>
                    )}
                    <div className="mt-2">
                      <p className="text-gray-700 font-semibold">{t('links')} :</p>
                      <div className="flex flex-col space-y-1">
                        {notif.project.telegramLink && (
                          <a
                            href={notif.project.telegramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {t('telegram')}
                          </a>
                        )}
                        {notif.project.xLink && (
                          <a
                            href={notif.project.xLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {t('x')}
                          </a>
                        )}
                        {notif.project.discordLink && (
                          <a
                            href={notif.project.discordLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {t('discord')}
                          </a>
                        )}
                        {notif.project.websiteLink && (
                          <a
                            href={notif.project.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {t('website')}
                          </a>
                        )}
                        {notif.project.platformLink && (
                          <a
                            href={notif.project.platformLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {t('platform')}
                          </a>
                        )}
                        {notif.project.organizerLink && (
                          <a
                            href={notif.project.organizerLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {t('organizer')}
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

      {showFrequencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">{t('edit_notification_frequency')}</h2>
            <label className="block mb-2">{t('frequency_days')} :</label>
            <input
              type="number"
              value={newFrequency}
              onChange={(e) => setNewFrequency(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
              placeholder={t('frequency_placeholder')}
              min="1"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowFrequencyModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleFrequencyUpdate}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                {t('validate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationWen;