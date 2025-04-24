import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import AddProject from '../components/AddProject';
import { GrindContext } from '../App';
import dancinghamster from '../assets/dancinghamster.gif';
import xIcon from '../assets/x.png';
import wwwIcon from '../assets/www.png';
import discordIcon from '../assets/discord.png';
import telegramIcon from '../assets/telegram.png';
import alphabotIcon from '../assets/alphabot.png';
import { useTranslation } from 'react-i18next';

function Home({ projects, setProjects, handleAddProject }) {
  const { t, i18n } = useTranslation();
  console.log('Langue actuelle dans Home.js :', i18n.language);
  console.log('Projets reçus dans Home:', projects);
  const { grindBalance, account } = useContext(GrindContext);
  const [filterNote, setFilterNote] = useState(null);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [filterType, setFilterType] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [editingLinks, setEditingLinks] = useState({});
  const tableRef = useRef(null);
  const projectListRef = useRef(null);

  console.log('Projets dans Home:', projects);

  const today = new Date('2025-04-24'); // Date forcée pour correspondre aux logs
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isToday = (date) => {
    if (!date) return false;
    const projectDate = new Date(date);
    if (isNaN(projectDate.getTime())) {
      console.log('Date invalide dans isToday:', date);
      return false;
    }
    const todayStr = today.toISOString().split('T')[0];
    const projectDateStr = projectDate.toISOString().split('T')[0];
    console.log(`Comparaison isToday: ${projectDateStr} vs ${todayStr}`);
    return projectDateStr === todayStr;
  };

  const isTomorrow = (date) => {
    if (!date) return false;
    const projectDate = new Date(date);
    if (isNaN(projectDate.getTime())) {
      console.log('Date invalide dans isTomorrow:', date);
      return false;
    }
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const projectDateStr = projectDate.toISOString().split('T')[0];
    console.log(`Comparaison isTomorrow: ${projectDateStr} vs ${tomorrowStr}`);
    return projectDateStr === tomorrowStr;
  };

  const isPast = (date) => {
    if (!date) return false;
    const projectDate = new Date(date);
    if (isNaN(projectDate.getTime())) {
      console.log('Date invalide dans isPast:', date);
      return false;
    }
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return projectDate < startOfToday;
  };

  const generateWenNotifications = useCallback(() => {
    if (!account) return;

    const savedWenNotifications = localStorage.getItem(`wenNotifications_${account}`);
    let wenNotifications = savedWenNotifications ? JSON.parse(savedWenNotifications) : [];

    // Nettoyer les notifications WEN orphelines
    wenNotifications = wenNotifications.filter((n) => {
      const projectExists = projects.some((p) => p.id === n.project.id);
      const hasNoMintDate = projectExists && !projects.find((p) => p.id === n.project.id).mintDate;
      return projectExists && hasNoMintDate;
    });

    const projectsWithoutMintDate = projects.filter((project) => !project.mintDate && project.notificationFrequency);

    const newWenNotifications = projectsWithoutMintDate
      .filter((project) => !wenNotifications.some((n) => n.project.id === project.id))
      .map((project) => ({
        id: `wen_${project.id}_${Date.now()}`,
        project,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        notificationFrequency: project.notificationFrequency,
      }));

    if (newWenNotifications.length > 0) {
      wenNotifications = [...wenNotifications, ...newWenNotifications];
      console.log('Notifications WEN générées:', newWenNotifications.length, newWenNotifications);
      localStorage.setItem(`wenNotifications_${account}`, JSON.stringify(wenNotifications));
      window.dispatchEvent(new CustomEvent('updateNotifications'));
    } else {
      console.log('Aucune nouvelle notification WEN générée');
    }
  }, [account, projects]);

  const updateNotificationCounts = useCallback(() => {
    if (!account) {
      console.log('Aucun account, compteurs à 0 dans Home');
      localStorage.setItem(`notificationCount_${account}`, '0');
      localStorage.setItem(`wenNotificationCount_${account}`, '0');
      window.dispatchEvent(new CustomEvent('updateNotifications'));
      return;
    }

    const savedWenNotifications = localStorage.getItem(`wenNotifications_${account}`);
    const wenNotifications = savedWenNotifications ? JSON.parse(savedWenNotifications) : [];
    const savedHistoricalNotifications = localStorage.getItem(`notifications_${account}`);
    const historicalNotifications = savedHistoricalNotifications
      ? JSON.parse(savedHistoricalNotifications)
      : [];

    // Compter les projets aujourd'hui/demain
    const todayTomorrowCount = projects.filter(
      (project) => isToday(project.mintDate) || isTomorrow(project.mintDate)
    ).length;

    // Filtrer les notifications WEN valides (fenêtre de temps)
    const validWenNotifications = wenNotifications.filter((notif) => {
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

    console.log('Projets aujourd’hui + demain:', todayTomorrowCount);
    console.log('Notifications WEN comptées:', wenCount);
    console.log('Notifications historiques:', historicalNotifications.length);
    console.log('Total compteur:', totalCount);

    localStorage.setItem(`notificationCount_${account}`, totalCount.toString());
    localStorage.setItem(`wenNotificationCount_${account}`, wenCount.toString());
    window.dispatchEvent(new CustomEvent('updateNotifications'));
  }, [account, projects]);

  useEffect(() => {
    if (account) {
      const savedNotifications = localStorage.getItem(`notifications_${account}`);
      let notifications = savedNotifications ? JSON.parse(savedNotifications) : [];
      const now = new Date('2025-04-24');
      let updatedProjects = projects;
      let hasChanges = false;

      updatedProjects = projects.map((project) => {
        if (project.mintDate && new Date(project.mintDate) < now && !project.passed) {
          const existingNotification = notifications.find((n) => n.project.id === project.id);
          if (!existingNotification) {
            const newNotification = {
              id: `${project.id}-${Date.now()}`,
              project,
              date: project.mintDate,
              passed: true,
            };
            notifications.push(newNotification);
            console.log('Notification historique générée pour projet:', project.id, project.name);
            hasChanges = true;
          }
          return { ...project, passed: true };
        } else if (project.mintDate && new Date(project.mintDate) >= now && project.passed) {
          return { ...project, passed: false };
        }
        return project;
      });

      if (hasChanges) {
        console.log('Mise à jour projets avec passed:', updatedProjects);
        setProjects(updatedProjects);
        localStorage.setItem(`projects_${account}`, JSON.stringify(updatedProjects));
      }

      if (hasChanges && notifications.length > 0) {
        console.log('Sauvegarde notifications historiques:', notifications);
        localStorage.setItem(`notifications_${account}`, JSON.stringify(notifications));
      }

      generateWenNotifications();
      updateNotificationCounts();
    }
  }, [account, projects, generateWenNotifications, setProjects, updateNotificationCounts]);

  const activeProjects = projects.filter((project) => !isPast(project.mintDate));
  const pastProjects = projects.filter((project) => isPast(project.mintDate));

  const compressImage = (file, maxWidth = 300, maxHeight = 300, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (error) => reject(error);
    });
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const isValidImageUrl = (url) => {
    if (typeof url !== 'string') return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    try {
      const urlObj = new URL(url);
      return imageExtensions.some((ext) => urlObj.pathname.toLowerCase().endsWith(ext));
    } catch {
      return false;
    }
  };

  const handleDeleteProject = (projectId) => {
    const confirmDelete = window.confirm(t('confirm_delete_project'));
    if (!confirmDelete) return;

    const updatedProjects = projects.filter((project) => project.id !== projectId);
    console.log('Suppression projet ID:', projectId);
    setProjects(updatedProjects);
    localStorage.setItem(`projects_${account}`, JSON.stringify(updatedProjects));
    if (selectedProjectId === projectId) setSelectedProjectId(null);

    const savedWenNotifications = localStorage.getItem(`wenNotifications_${account}`);
    if (savedWenNotifications) {
      const wenNotifications = JSON.parse(savedWenNotifications).filter(
        (n) => n.project.id !== projectId
      );
      localStorage.setItem(`wenNotifications_${account}`, JSON.stringify(wenNotifications));
      console.log('Notifications WEN supprimées pour projet ID:', projectId);
    }

    updateNotificationCounts();
  };

  const updateProjectField = async (projectId, field, value) => {
    let updatedProjects = projects.map((project) =>
      project.id === projectId ? { ...project, [field]: value } : project
    );

    let notifications = [];
    let wenNotifications = [];
    let hasChanges = false;

    const savedNotifications = localStorage.getItem(`notifications_${account}`);
    const savedWenNotifications = localStorage.getItem(`wenNotifications_${account}`);
    notifications = savedNotifications ? JSON.parse(savedNotifications) : [];
    wenNotifications = savedWenNotifications ? JSON.parse(savedWenNotifications) : [];

    if (field === 'mintDate') {
      const normalizedDate = value ? new Date(value).toISOString().split('T')[0] : null;
      updatedProjects = projects.map((project) =>
        project.id === projectId
          ? { ...project, [field]: normalizedDate, passed: isPast(normalizedDate), provisionalDate: null }
          : project
      );

      if (normalizedDate) {
        const wenNotif = wenNotifications.find((n) => n.project.id === projectId);
        if (wenNotif) {
          const newNotification = {
            id: `${projectId}-${Date.now()}`,
            project: updatedProjects.find((p) => p.id === projectId),
            date: normalizedDate,
            passed: isPast(normalizedDate),
          };
          notifications.push(newNotification);
          wenNotifications = wenNotifications.filter((n) => n.project.id !== projectId);
          hasChanges = true;
          console.log('Notification WEN convertie en normale pour projet ID:', projectId);
        }
      } else {
        if (!wenNotifications.some((n) => n.project.id === projectId)) {
          const project = updatedProjects.find((p) => p.id === projectId);
          const newWenNotification = {
            id: `wen_${projectId}_${Date.now()}`,
            project,
            date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            notificationFrequency: project.notificationFrequency || '1', // Respecte la fréquence existante ou 1 par défaut
          };
          wenNotifications.push(newWenNotification);
          hasChanges = true;
          console.log('Nouvelle notification WEN générée pour projet ID:', projectId, newWenNotification);
        }
        notifications = notifications.filter((n) => n.project.id !== projectId);
        hasChanges = true;
      }
    } else if (field === 'image') {
      if (value instanceof File) {
        if (value.size > 5 * 1024 * 1024) {
          alert(t('image_too_large'));
          return;
        }
        try {
          const compressedImage = await compressImage(value);
          const base64Image = await convertFileToBase64(compressedImage);
          updatedProjects = projects.map((project) =>
            project.id === projectId ? { ...project, [field]: base64Image } : project
          );
        } catch (error) {
          console.error('Erreur traitement image:', error);
          alert(t('image_processing_error'));
          return;
        }
      } else if (typeof value === 'string') {
        if (value && !isValidImageUrl(value)) {
          alert(t('invalid_image_url'));
          return;
        }
      } else {
        updatedProjects = projects.map((project) =>
          project.id === projectId ? { ...project, [field]: null } : project
        );
      }
    } else if (
      ['telegramLink', 'xLink', 'discordLink', 'websiteLink', 'platformLink', 'organizerLink'].includes(
        field
      )
    ) {
      let cleanedValue = value;
      if (typeof value === 'string') {
        cleanedValue = value.replace(/^https:\/\/https:\/\//i, 'https://');
      }
      updatedProjects = projects.map((project) =>
        project.id === projectId ? { ...project, [field]: cleanedValue } : project
      );
    } else if (field === 'notificationFrequency') {
      if (!value || isNaN(parseInt(value)) || parseInt(value) <= 0) {
        alert(t('invalid_frequency'));
        return;
      }
      updatedProjects = projects.map((project) =>
        project.id === projectId ? { ...project, [field]: value.toString() } : project
      );
      wenNotifications = wenNotifications.map((n) =>
        n.project.id === projectId
          ? { ...n, notificationFrequency: value.toString(), createdAt: new Date().toISOString() }
          : n
      );
      if (!wenNotifications.some((n) => n.project.id === projectId) && !updatedProjects.find((p) => p.id === projectId).mintDate) {
        const project = updatedProjects.find((p) => p.id === projectId);
        const newWenNotification = {
          id: `wen_${projectId}_${Date.now()}`,
          project,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          notificationFrequency: value.toString(),
        };
        wenNotifications.push(newWenNotification);
        console.log('Nouvelle notification WEN générée pour modification frequency projet ID:', projectId, newWenNotification);
      }
      hasChanges = true;
    }

    console.log(`Mise à jour champ ${field} projet ID ${projectId}:`, value);
    setProjects(updatedProjects);
    localStorage.setItem(`projects_${account}`, JSON.stringify(updatedProjects));

    if (hasChanges) {
      localStorage.setItem(`notifications_${account}`, JSON.stringify(notifications));
      localStorage.setItem(`wenNotifications_${account}`, JSON.stringify(wenNotifications));
      console.log('Notifications mises à jour:', notifications);
      console.log('Notifications WEN mises à jour:', wenNotifications);
      window.dispatchEvent(new CustomEvent('updateNotifications'));
    }

    updateNotificationCounts();
  };

  const toggleLinkEdit = (projectId, field) => {
    setEditingLinks((prev) => ({
      ...prev,
      [`${projectId}-${field}`]: !prev[`${projectId}-${field}`],
    }));
  };

  const confirmedDateProjects = activeProjects
    .filter((project) => project.mintDate)
    .sort((a, b) => new Date(a.mintDate) - new Date(b.mintDate));

  const provisionalDateProjects = activeProjects.filter((project) => !project.mintDate);

  const filterByDate = (projects) => {
    if (!filterDate) return projects;
    const now = new Date('2025-04-24');
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return projects.filter((project) => {
      if (!project.mintDate) return false;
      const mintDate = new Date(project.mintDate);
      if (filterDate === 'today') {
        return mintDate.toDateString() === today.toDateString();
      } else if (filterDate === 'this-week') {
        return mintDate >= startOfWeek && mintDate <= endOfWeek;
      } else if (filterDate === 'this-month') {
        return mintDate >= startOfMonth && mintDate <= endOfMonth;
      }
      return true;
    });
  };

  const filteredConfirmedProjects = filterByDate(
    confirmedDateProjects.filter((project) => {
      const matchesNote = filterNote ? project.note === parseInt(filterNote) : true;
      const matchesFree = showFreeOnly ? project.isFree : true;
      const matchesType = filterType ? project.type === filterType : true;
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesNote && matchesFree && matchesType && matchesSearch;
    })
  );

  const filteredProvisionalProjects = provisionalDateProjects.filter((project) => {
    const matchesNote = filterNote ? project.note === parseInt(filterNote) : true;
    const matchesFree = showFreeOnly ? project.isFree : true;
    const matchesType = filterType ? project.type === filterType : true;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesNote && matchesFree && matchesType && matchesSearch;
  });

  const allFilteredProjects = [...filteredConfirmedProjects, ...filteredProvisionalProjects];

  const handleEditClick = (projectId) => {
    setSelectedProjectId(projectId);
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleValidate = () => {
    setSelectedProjectId(null);
    setEditingLinks({});
    setTimeout(() => {
      projectListRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const isValidFile = (file) => {
    return file instanceof File || file instanceof Blob;
  };

  const handleAddProjectOverride = (project) => {
    const newProject = {
      ...project,
      id: Date.now().toString(),
      notificationFrequency: project.notificationFrequency || '1', // Défaut à 1 jour
    };
    handleAddProject(newProject);
    console.log('Nouveau projet ajouté:', newProject);

    if (!newProject.mintDate && newProject.notificationFrequency) {
      const savedWenNotifications = localStorage.getItem(`wenNotifications_${account}`);
      let wenNotifications = savedWenNotifications ? JSON.parse(savedWenNotifications) : [];
      const newWenNotification = {
        id: `wen_${newProject.id}_${Date.now()}`,
        project: newProject,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        notificationFrequency: newProject.notificationFrequency,
      };
      wenNotifications.push(newWenNotification);
      console.log('Notification WEN générée pour nouveau projet:', newWenNotification);
      localStorage.setItem(`wenNotifications_${account}`, JSON.stringify(wenNotifications));
      window.dispatchEvent(new CustomEvent('updateNotifications'));
      updateNotificationCounts();
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#00DDAF' }}>
      <div
        className={`${
          showFilters ? 'w-64' : 'w-0'
        } bg-gray-100 p-4 transition-all duration-300 overflow-hidden`}
      >
        {showFilters && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('filters')}</h2>
            <div>
              <label className="text-gray-800 font-semibold">{t('search_by_name')}</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('search_project')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
              />
            </div>
            <div>
              <label className="text-gray-800 font-semibold">{t('filter_by_note')}</label>
              <div className="space-y-1 mt-1">
                {[...Array(10)].map((_, i) => (
                  <label key={i + 1} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterNote === (i + 1).toString()}
                      onChange={() =>
                        setFilterNote(filterNote === (i + 1).toString() ? null : (i + 1).toString())
                      }
                      className="mr-2"
                    />
                    {i + 1}/10
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center text-gray-800 font-semibold">
                <input
                  type="checkbox"
                  checked={showFreeOnly}
                  onChange={(e) => setShowFreeOnly(e.target.checked)}
                  className="mr-2"
                />
                {t('free_mints_only')}
              </label>
            </div>
            <div>
              <label className="text-gray-800 font-semibold">{t('filter_by_type')}</label>
              <div className="space-y-1 mt-1">
                {[
                  'TGE',
                  'WL',
                  'OG',
                  'Waitlist',
                  'Interested',
                  'Airdrop',
                  'Launch',
                  'Custom',
                ].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterType === type}
                      onChange={() => setFilterType(filterType === type ? null : type)}
                      className="mr-2"
                    />
                    {t(`project_type_${type.toLowerCase()}`)}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-gray-800 font-semibold">{t('filter_by_date')}</label>
              <div className="space-y-1 mt-1">
                {['today', 'this-week', 'this-month'].map((date) => (
                  <label key={date} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterDate === date}
                      onChange={() => setFilterDate(filterDate === date ? null : date)}
                      className="mr-2"
                    />
                    {t(`date_filter_${date}`)}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 p-6">
        <div className="flex flex-col items-center mb-12 w-full">
          <img src={dancinghamster} alt={t('dancing_hamster_alt')} className="w-48 h-48 object-contain" />
          <h1
            className="text-[80px] md:text-[120px] font-extrabold mt-16 text-center max-w-screen-lg"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              lineHeight: '1',
              fontSize: '80px !important',
              overflowWrap: 'break-word',
            }}
          >
            CRYPTOGRIND
          </h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showFilters ? t('hide_filters') : t('show_filters')}
          </button>
        </div>

        <div className="mb-6" ref={projectListRef}>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('my_projects_list')}</h2>
          {allFilteredProjects.length === 0 ? (
            <p className="text-gray-700">{t('no_projects_to_display')}</p>
          ) : (
            <div className="space-y-4">
              {allFilteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 bg-white shadow-md rounded-lg flex flex-col transition-all hover:shadow-lg relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      {project.image ? (
                        <img
                          src={
                            typeof project.image === 'string'
                              ? project.image
                              : isValidFile(project.image)
                              ? URL.createObjectURL(project.image)
                              : 'https://placehold.co/48x48'
                          }
                          alt={project.name || t('project_image_alt')}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => (e.target.src = 'https://placehold.co/48x48')}
                        />
                      ) : (
                        <span className="text-gray-500">{t('no_image')}</span>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg text-blue-800 font-bold">{project.name}</span>
                          <span className="text-lg text-purple-600 italic">
                            ({project.type}
                            {project.customType && ` - ${project.customType}`})
                          </span>
                          <span className="text-lg text-gray-700">
                            - {project.mintDate || project.provisionalDate || t('date_na')}
                            {project.mintTime && ` ${t('at')} ${project.mintTime}`}
                          </span>
                          {!project.mintDate && (
                            <span className="bg-blue-500 text-white px-2 py-1 rounded-lg text-sm animate-pulse">
                              {t('wen')}
                            </span>
                          )}
                        </div>
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
                            title={t('telegram_link')}
                          >
                            <img src={telegramIcon} alt={t('telegram_alt')} className="w-10 h-10" />
                          </a>
                        )}
                        {project.xLink && (
                          <a
                            href={project.xLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title={t('x_link')}
                          >
                            <img src={xIcon} alt={t('x_alt')} className="w-10 h-10" />
                          </a>
                        )}
                        {project.discordLink && (
                          <a
                            href={project.discordLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title={t('discord_link')}
                          >
                            <img src={discordIcon} alt={t('discord_alt')} className="w-10 h-10" />
                          </a>
                        )}
                        {project.websiteLink && (
                          <a
                            href={project.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title={t('website_link')}
                          >
                            <img src={wwwIcon} alt={t('website_alt')} className="w-10 h-10" />
                          </a>
                        )}
                        {project.platformLink && (
                          <a
                            href={project.platformLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title={t('platform_link')}
                          >
                            <img src={wwwIcon} alt={t('platform_alt')} className="w-10 h-10" />
                          </a>
                        )}
                        {project.organizerLink && (
                          <a
                            href={project.organizerLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title={t('organizer_link')}
                          >
                            <img src={alphabotIcon} alt={t('organizer_alt')} className="w-10 h-10" />
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleEditClick(project.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-2"
                      >
                        {t('edit')}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    {isToday(project.mintDate) && (
                      <span className="bg-red-600 text-white px-4 py-2 rounded-lg text-lg animate-pulse inline-block">
                        {t('today')}
                      </span>
                    )}
                    {isTomorrow(project.mintDate) && (
                      <span
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg text-lg animate-pulse inline-block"
                        style={{ position: 'relative', zIndex: 10 }}
                      >
                        {t('tomorrow')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6 flex justify-center">
          <AddProject onAddProject={handleAddProjectOverride} />
        </div>

        {selectedProjectId && (
          <div ref={tableRef}>
            {confirmedDateProjects
              .filter((project) => project.id === selectedProjectId)
              .map((project) => (
                <div key={project.id} className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    {t('edit_project', { name: project.name })}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse rounded-lg shadow-lg bg-white">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('name')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('type')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('mint_date')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('mint_time')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('note')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('price')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('image')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('links')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('notification_frequency')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-gray-100">
                          <td className="border border-gray-300 p-3">
                            <input
                              type="text"
                              value={project.name}
                              onChange={(e) =>
                                updateProjectField(project.id, 'name', e.target.value)
                              }
                              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 p-3">
                            <select
                              value={project.type}
                              onChange={(e) =>
                                updateProjectField(project.id, 'type', e.target.value)
                              }
                              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="TGE">{t('project_type_tge')}</option>
                              <option value="WL">{t('project_type_wl')}</option>
                              <option value="OG">{t('project_type_og')}</option>
                              <option value="Waitlist">{t('project_type_waitlist')}</option>
                              <option value="Interested">{t('project_type_interested')}</option>
                              <option value="Airdrop">{t('project_type_airdrop')}</option>
                              <option value="Launch">{t('project_type_launch')}</option>
                              <option value="Custom">{t('project_type_custom')}</option>
                            </select>
                            {project.type === 'Custom' && (
                              <input
                                type="text"
                                value={project.customType || ''}
                                onChange={(e) =>
                                  updateProjectField(project.id, 'customType', e.target.value)
                                }
                                className="w-full p-2 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={t('custom_type_placeholder')}
                              />
                            )}
                          </td>
                          <td className="border border-gray-300 p-3">
                            <input
                              type="date"
                              value={project.mintDate || ''}
                              onChange={(e) =>
                                updateProjectField(project.id, 'mintDate', e.target.value)
                              }
                              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 p-3">
                            <input
                              type="time"
                              value={project.mintTime || ''}
                              onChange={(e) =>
                                updateProjectField(project.id, 'mintTime', e.target.value)
                              }
                              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 p-3">
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={project.note || ''}
                              onChange={(e) =>
                                updateProjectField(project.id, 'note', parseInt(e.target.value))
                              }
                              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 p-3">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={project.isFree || false}
                                onChange={(e) =>
                                  updateProjectField(project.id, 'isFree', e.target.checked)
                                }
                                className="mr-2"
                              />
                              <span>{t('free')}</span>
                              {!project.isFree && (
                                <input
                                  type="text"
                                  value={project.price || ''}
                                  onChange={(e) =>
                                    updateProjectField(project.id, 'price', e.target.value)
                                  }
                                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder={t('price_placeholder')}
                                />
                              )}
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3">
                            {project.image ? (
                              <img
                                src={
                                  typeof project.image === 'string'
                                    ? project.image
                                    : isValidFile(project.image)
                                    ? URL.createObjectURL(project.image)
                                    : 'https://placehold.co/80x80'
                                }
                                alt={project.name || t('project_image_alt')}
                                className="w-20 h-20 object-cover rounded-lg"
                                onError={(e) => (e.target.src = 'https://placehold.co/80x80')}
                              />
                            ) : (
                              <span className="text-gray-500">{t('no_image')}</span>
                            )}
                            <div className="mt-2">
                              <label className="block text-gray-700">{t('upload_image')}</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  updateProjectField(project.id, 'image', e.target.files[0])
                                }
                                className="w-full p-2 mt-1"
                              />
                            </div>
                            <div className="mt-2">
                              <label className="block text-gray-700">{t('image_url')}</label>
                              <input
                                type="text"
                                value={typeof project.image === 'string' ? project.image : ''}
                                onChange={(e) =>
                                  updateProjectField(project.id, 'image', e.target.value)
                                }
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center space-x-2">
                                {project.telegramLink ? (
                                  <a
                                    href={project.telegramLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {t('telegram')}
                                  </a>
                                ) : (
                                  <span className="text-gray-500">{t('no_telegram_link')}</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'telegramLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.telegramLink ? t('edit') : t('add')}
                                </button>
                                {editingLinks[`${project.id}-telegramLink`] && (
                                  <input
                                    type="text"
                                    value={project.telegramLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'telegramLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={t('telegram_link_placeholder')}
                                  />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {project.xLink ? (
                                  <a
                                    href={project.xLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {t('x')}
                                  </a>
                                ) : (
                                  <span className="text-gray-500">{t('no_x_link')}</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'xLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.xLink ? t('edit') : t('add')}
                                </button>
                                {editingLinks[`${project.id}-xLink`] && (
                                  <input
                                    type="text"
                                    value={project.xLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'xLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={t('x_link_placeholder')}
                                  />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {project.discordLink ? (
                                  <a
                                    href={project.discordLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {t('discord')}
                                  </a>
                                ) : (
                                  <span className="text-gray-500">{t('no_discord_link')}</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'discordLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.discordLink ? t('edit') : t('add')}
                                </button>
                                {editingLinks[`${project.id}-discordLink`] && (
                                  <input
                                    type="text"
                                    value={project.discordLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'discordLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={t('discord_link_placeholder')}
                                  />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {project.websiteLink ? (
                                  <a
                                    href={project.websiteLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {t('website')}
                                  </a>
                                ) : (
                                  <span className="text-gray-500">{t('no_website_link')}</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'websiteLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.websiteLink ? t('edit') : t('add')}
                                </button>
                                {editingLinks[`${project.id}-websiteLink`] && (
                                  <input
                                    type="text"
                                    value={project.websiteLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'websiteLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={t('website_link_placeholder')}
                                  />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {project.platformLink ? (
                                  <a
                                    href={project.platformLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {t('platform')}
                                  </a>
                                ) : (
                                  <span className="text-gray-500">{t('no_platform_link')}</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'platformLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.platformLink ? t('edit') : t('add')}
                                </button>
                                {editingLinks[`${project.id}-platformLink`] && (
                                  <input
                                    type="text"
                                    value={project.platformLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'platformLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={t('platform_link_placeholder')}
                                  />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {project.organizerLink ? (
                                  <a
                                    href={project.organizerLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {t('organizer')}
                                  </a>
                                ) : (
                                  <span className="text-gray-500">{t('no_organizer_link')}</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'organizerLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.organizerLink ? t('edit') : t('add')}
                                </button>
                                {editingLinks[`${project.id}-organizerLink`] && (
                                  <input
                                    type="text"
                                    value={project.organizerLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'organizerLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={t('organizer_link_placeholder')}
                                  />
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3">
                            <input
                              type="number"
                              value={project.notificationFrequency || '1'}
                              onChange={(e) =>
                                updateProjectField(project.id, 'notificationFrequency', e.target.value)
                              }
                              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={t('notification_frequency_placeholder')}
                              min="1"
                            />
                          </td>
                          <td className="border border-gray-300 p-3 space-y-2 min-w-[150px]">
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors w-full"
                            >
                              {t('delete')}
                            </button>
                            <button
                              onClick={handleValidate}
                              className="bg-green-500 text-white px-5 py-3 rounded-lg hover:bg-green-600 transition-colors w-full border-2 border-green-700"
                            >
                              {t('validate')}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            {provisionalDateProjects
              .filter((project) => project.id === selectedProjectId)
              .map((project) => (
                <div key={project.id} className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    {t('edit_project', { name: project.name })}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse rounded-lg shadow-lg bg-white">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('name')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('type')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('mint_date')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('mint_time')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('note')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('price')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('image')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('links')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('notification_frequency')}</th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-gray-100">
                          <td className="border border-gray-300 p-3">
                            <input
                              type="text"
                              value={project.name}
                              onChange={(e) =>
                                updateProjectField(project.id, 'name', e.target.value)
                              }
                              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 p-3">
                            <select
                              value={project.type}
                              onChange={(e) =>
                                updateProjectField(project.id, 'type', e.target.value)
                              }
                              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="TGE">{t('project_type_tge')}</option>
                              <option value="WL">{t('project_type_wl')}</option>
                              <option value="OG">{t('project_type_og')}</option>
                              <option value="Waitlist">{t('project_type_waitlist')}</option>
                              <option value="Interested">{t('project_type_interested')}</option>
                              <option value="Airdrop">{t('project_type_airdrop')}</option>
                              <option value="Launch">{t('project_type_launch')}</option>
                              <option value="Custom">{t('project_type_custom')}</option>
                            </select>
                            {project.type === 'Custom' && (
                              <input
                                type="text"
                                value={project.customType || ''}
                                onChange={(e) =>
                                  updateProjectField(project.id, 'customType', e.target.value)
                                }
                                className="w-full p-2 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={t('custom_type_placeholder')}
                              />
                            )}
                          </td>
                          <td className="border border-gray-300 p-3">
                            <input
                              type="date"
                              value={project.mintDate || ''}
                              onChange={(e) =>
                                updateProjectField(project.id, 'mintDate', e.target.value)
                              }
                              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 p-3">
                            <input
                              type="time"
                              value={project.mintTime || ''}
                              onChange={(e) =>
                                updateProjectField(project.id, 'mintTime', e.target.value)
                              }
                              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 p-3">
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={project.note || ''}
                              onChange={(e) =>
                                updateProjectField(project.id, 'note', parseInt(e.target.value))
                              }
                              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 p-3">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={project.isFree || false}
                                onChange={(e) =>
                                  updateProjectField(project.id, 'isFree', e.target.checked)
                                }
                                className="mr-2"
                              />
                              <span>{t('free')}</span>
                              {!project.isFree && (
                                <input
                                  type="text"
                                  value={project.price || ''}
                                  onChange={(e) =>
                                    updateProjectField(project.id, 'price', e.target.value)
                                  }
                                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder={t('price_placeholder')}
                                />
                              )}
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3">
                            {project.image ? (
                              <img
                                src={
                                  typeof project.image === 'string'
                                    ? project.image
                                    : isValidFile(project.image)
                                    ? URL.createObjectURL(project.image)
                                    : 'https://placehold.co/80x80'
                                }
                                alt={project.name || t('project_image_alt')}
                                className="w-20 h-20 object-cover rounded-lg"
                                onError={(e) => (e.target.src = 'https://placehold.co/80x80')}
                              />
                            ) : (
                              <span className="text-gray-500">{t('no_image')}</span>
                            )}
                            <div className="mt-2">
                              <label className="block text-gray-700">{t('upload_image')}</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  updateProjectField(project.id, 'image', e.target.files[0])
                                }
                                className="w-full p-2 mt-1"
                              />
                            </div>
                            <div className="mt-2">
                              <label className="block text-gray-700">{t('image_url')}</label>
                              <input
                                type="text"
                                value={typeof project.image === 'string' ? project.image : ''}
                                onChange={(e) =>
                                  updateProjectField(project.id, 'image', e.target.value)
                                }
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center space-x-2">
                                {project.telegramLink ? (
                                  <a
                                    href={project.telegramLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {t('telegram')}
                                  </a>
                                ) : (
                                  <span className="text-gray-500">{t('no_telegram_link')}</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'telegramLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.telegramLink ? t('edit') : t('add')}
                                </button>
                                {editingLinks[`${project.id}-telegramLink`] && (
                                  <input
                                    type="text"
                                    value={project.telegramLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'telegramLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={t('telegram_link_placeholder')}
                                  />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {project.xLink ? (
                                  <a
                                    href={project.xLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {t('x')}
                                  </a>
                                ) : (
                                  <span className="text-gray-500">{t('no_x_link')}</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'xLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.xLink ? t('edit') : t('add')}
                                </button>
                                {editingLinks[`${project.id}-xLink`] && (
                                  <input
                                    type="text"
                                    value={project.xLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'xLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={t('x_link_placeholder')}
                                  />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {project.discordLink ? (
                                  <a
                                    href={project.discordLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {t('discord')}
                                  </a>
                                ) : (
                                  <span className="text-gray-500">{t('no_discord_link')}</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'discordLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.discordLink ? t('edit') : t('add')}
                                </button>
                                {editingLinks[`${project.id}-discordLink`] && (
                                  <input
                                    type="text"
                                    value={project.discordLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'discordLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={t('discord_link_placeholder')}
                                  />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {project.websiteLink ? (
                                  <a
                                    href={project.websiteLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {t('website')}
                                  </a>
                                ) : (
                                  <span className="text-gray-500">{t('no_website_link')}</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'websiteLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.websiteLink ? t('edit') : t('add')}
                                </button>
                                {editingLinks[`${project.id}-websiteLink`] && (
                                  <input
                                    type="text"
                                    value={project.websiteLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'websiteLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={t('website_link_placeholder')}
                                  />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {project.platformLink ? (
                                  <a
                                    href={project.platformLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {t('platform')}
                                  </a>
                                ) : (
                                  <span className="text-gray-500">{t('no_platform_link')}</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'platformLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.platformLink ? t('edit') : t('add')}
                                </button>
                                {editingLinks[`${project.id}-platformLink`] && (
                                  <input
                                    type="text"
                                    value={project.platformLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'platformLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={t('platform_link_placeholder')}
                                  />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {project.organizerLink ? (
                                  <a
                                    href={project.organizerLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {t('organizer')}
                                  </a>
                                ) : (
                                  <span className="text-gray-500">{t('no_organizer_link')}</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'organizerLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.organizerLink ? t('edit') : t('add')}
                                </button>
                                {editingLinks[`${project.id}-organizerLink`] && (
                                  <input
                                    type="text"
                                    value={project.organizerLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'organizerLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={t('organizer_link_placeholder')}
                                  />
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3">
                            <input
                              type="number"
                              value={project.notificationFrequency || '1'}
                              onChange={(e) =>
                                updateProjectField(project.id, 'notificationFrequency', e.target.value)
                              }
                              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={t('notification_frequency_placeholder')}
                              min="1"
                            />
                          </td>
                          <td className="border border-gray-300 p-3 space-y-2 min-w-[150px]">
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors w-full"
                            >
                              {t('delete')}
                            </button>
                            <button
                              onClick={handleValidate}
                              className="bg-green-500 text-white px-5 py-3 rounded-lg hover:bg-green-600 transition-colors w-full border-2 border-green-700"
                            >
                              {t('validate')}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
          </div>
        )}

        {pastProjects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('past_projects')}</h2>
            <div className="space-y-4">
              {pastProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 bg-gray-100 shadow-md rounded-lg flex flex-col transition-all hover:shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      {project.image ? (
                        <img
                          src={
                            typeof project.image === 'string'
                              ? project.image
                              : isValidFile(project.image)
                              ? URL.createObjectURL(project.image)
                              : 'https://placehold.co/48x48'
                          }
                          alt={project.name || t('project_image_alt')}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => (e.target.src = 'https://placehold.co/48x48')}
                        />
                      ) : (
                        <span className="text-gray-500">{t('no_image')}</span>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg text-blue-800 font-bold">{project.name}</span>
                          <span className="text-lg text-purple-600 italic">
                            ({project.type}
                            {project.customType && ` - ${project.customType}`})
                          </span>
                          <span className="text-lg text-gray-700">
                            - {project.mintDate || t('date_na')}
                            {project.mintTime && ` ${t('at')} ${project.mintTime}`}
                          </span>
                        </div>
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
                            title={t('telegram_link')}
                          >
                            <img src={telegramIcon} alt={t('telegram_alt')} className="w-10 h-10" />
                          </a>
                        )}
                        {project.xLink && (
                          <a
                            href={project.xLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title={t('x_link')}
                          >
                            <img src={xIcon} alt={t('x_alt')} className="w-10 h-10" />
                          </a>
                        )}
                        {project.discordLink && (
                          <a
                            href={project.discordLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title={t('discord_link')}
                          >
                            <img src={discordIcon} alt={t('discord_alt')} className="w-10 h-10" />
                          </a>
                        )}
                        {project.websiteLink && (
                          <a
                            href={project.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title={t('website_link')}
                          >
                            <img src={wwwIcon} alt={t('website_alt')} className="w-10 h-10" />
                          </a>
                        )}
                        {project.platformLink && (
                          <a
                            href={project.platformLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title={t('platform_link')}
                          >
                            <img src={wwwIcon} alt={t('platform_alt')} className="w-10 h-10" />
                          </a>
                        )}
                        {project.organizerLink && (
                          <a
                            href={project.organizerLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                            title={t('organizer_link')}
                          >
                            <img src={alphabotIcon} alt={t('organizer_alt')} className="w-10 h-10" />
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleEditClick(project.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-2"
                      >
                        {t('edit')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;