import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import AddProject from '../components/AddProject';
import { GrindContext } from '../App';
import dancinghamster from '../assets/dancinghamster.gif';
import xIcon from '../assets/x.png';
import wwwIcon from '../assets/www.png';
import discordIcon from '../assets/discord.png';
import telegramIcon from '../assets/telegram.png';
import alphabotIcon from '../assets/alphabot.png';

function Home({ projects, setProjects, handleAddProject }) {
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

  const today = new Date();
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

  // Générer des notifications WEN pour les projets sans mintDate
  const generateWenNotifications = useCallback(() => {
    if (!account) return;

    const savedWenNotifications = localStorage.getItem(`wenNotifications_${account}`);
    let wenNotifications = savedWenNotifications ? JSON.parse(savedWenNotifications) : [];

    const projectsWithoutMintDate = projects.filter((project) => !project.mintDate);

    const newWenNotifications = projectsWithoutMintDate
      .filter((project) => !wenNotifications.some((n) => n.project.id === project.id))
      .map((project) => ({
        id: `wen_${project.id}_${Date.now()}`,
        project,
        date: new Date().toISOString(),
      }));

    if (newWenNotifications.length > 0) {
      wenNotifications = [...wenNotifications, ...newWenNotifications];
      localStorage.setItem(`wenNotifications_${account}`, JSON.stringify(wenNotifications));
      console.log('Notifications WEN générées:', newWenNotifications.length);
      // Mettre à jour le compteur WEN
      localStorage.setItem(`wenNotificationCount_${account}`, wenNotifications.length.toString());
    }
  }, [account, projects]);

  // Mettre à jour les compteurs de notifications
  const updateNotificationCounts = useCallback(() => {
    if (!account) {
      console.log('Aucun account, compteurs à 0 dans Home');
      localStorage.setItem(`notificationCount_${account}`, '0');
      localStorage.setItem(`wenNotificationCount_${account}`, '0');
      return;
    }

    // Compteur pour aujourd'hui + demain
    const todayTomorrowCount = projects.filter(
      (project) => isToday(project.mintDate) || isTomorrow(project.mintDate)
    ).length;
    console.log('Projets aujourd’hui + demain dans Home:', todayTomorrowCount);
    localStorage.setItem(`notificationCount_${account}`, todayTomorrowCount.toString());

    // Compteur pour notifications WEN
    const savedWenNotifications = localStorage.getItem(`wenNotifications_${account}`);
    const wenNotifications = savedWenNotifications ? JSON.parse(savedWenNotifications) : [];
    console.log('Notifications WEN dans Home:', wenNotifications.length);
    localStorage.setItem(`wenNotificationCount_${account}`, wenNotifications.length.toString());
  }, [account, projects]);

  // Gérer les notifications historiques et WEN
  useEffect(() => {
    if (account) {
      const savedNotifications = localStorage.getItem(`notifications_${account}`);
      let notifications = savedNotifications ? JSON.parse(savedNotifications) : [];
      const now = new Date();
      let updatedProjects = projects;
      let hasChanges = false;

      // Marquer les projets passés et générer des notifications historiques
      updatedProjects = projects.map((project) => {
        if (project.mintDate && new Date(project.mintDate) < now && !project.passed) {
          const existingNotification = notifications.find((n) => n.project.id === project.id);
          if (!existingNotification) {
            const newNotification = {
              id: `${project.id}-${Date.now()}`,
              project,
              date: project.mintDate, // Utiliser mintDate pour la date de la notification
              passed: true
            };
            notifications.push(newNotification);
            console.log('Notification historique générée pour projet:', project.id, project.name);
            hasChanges = true;
          }
          return { ...project, passed: true };
        }
        return project;
      });

      // Sauvegarder les projets mis à jour
      if (hasChanges) {
        console.log('Mise à jour projets avec passed:', updatedProjects);
        setProjects(updatedProjects);
        localStorage.setItem(`projects_${account}`, JSON.stringify(updatedProjects));
      }

      // Sauvegarder les notifications historiques
      if (hasChanges && notifications.length > 0) {
        console.log('Sauvegarde notifications historiques:', notifications);
        localStorage.setItem(`notifications_${account}`, JSON.stringify(notifications));
      }

      // Générer les notifications WEN
      generateWenNotifications();

      // Mettre à jour les compteurs
      updateNotificationCounts();
    } else {
      console.log('Aucun account, réinitialisation projets dans Home');
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
    const confirmDelete = window.confirm('Voulez-vous supprimer ce projet ?');
    if (!confirmDelete) return;

    const updatedProjects = projects.filter((project) => project.id !== projectId);
    console.log('Suppression projet ID:', projectId);
    setProjects(updatedProjects);
    localStorage.setItem(`projects_${account}`, JSON.stringify(updatedProjects));
    if (selectedProjectId === projectId) setSelectedProjectId(null);

    // Supprimer les notifications WEN associées
    const savedWenNotifications = localStorage.getItem(`wenNotifications_${account}`);
    if (savedWenNotifications) {
      const wenNotifications = JSON.parse(savedWenNotifications).filter(
        (n) => n.project.id !== projectId
      );
      localStorage.setItem(`wenNotifications_${account}`, JSON.stringify(wenNotifications));
      console.log('Notifications WEN supprimées pour projet ID:', projectId);
    }

    // Mettre à jour les compteurs
    updateNotificationCounts();
  };

  const updateProjectField = async (projectId, field, value) => {
    let updatedProjects = projects.map((project) =>
      project.id === projectId ? { ...project, [field]: value } : project
    );

    if (field === 'mintDate' && value) {
      // Normaliser mintDate en YYYY-MM-DD
      const normalizedDate = new Date(value).toISOString().split('T')[0];
      updatedProjects = projects.map((project) =>
        project.id === projectId
          ? { ...project, [field]: normalizedDate, passed: isPast(normalizedDate) }
          : project
      );
    } else if (field === 'mintDate' && !value) {
      // Si mintDate est supprimé, supprimer provisionalDate aussi
      updatedProjects = projects.map((project) =>
        project.id === projectId ? { ...project, [field]: null, provisionalDate: null } : project
      );
    } else if (field === 'image') {
      if (value instanceof File) {
        if (value.size > 5 * 1024 * 1024) {
          alert('Image trop volumineuse (max 5MB).');
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
          alert('Erreur traitement image.');
          return;
        }
      } else if (typeof value === 'string') {
        if (value && !isValidImageUrl(value)) {
          alert('URL image invalide (jpg, png, gif, webp).');
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
    }

    console.log(`Mise à jour champ ${field} projet ID ${projectId}:`, value);
    setProjects(updatedProjects);
    localStorage.setItem(`projects_${account}`, JSON.stringify(updatedProjects));

    // Régénérer les notifications WEN et historiques si mintDate change
    if (field === 'mintDate') {
      generateWenNotifications();
      // Forcer la régénération des notifications historiques
      const savedNotifications = localStorage.getItem(`notifications_${account}`);
      let notifications = savedNotifications ? JSON.parse(savedNotifications) : [];
      const now = new Date();
      updatedProjects = updatedProjects.map((project) => {
        if (project.mintDate && new Date(project.mintDate) < now && !project.passed) {
          const existingNotification = notifications.find((n) => n.project.id === project.id);
          if (!existingNotification) {
            const newNotification = {
              id: `${project.id}-${Date.now()}`,
              project,
              date: project.mintDate,
              passed: true
            };
            notifications.push(newNotification);
            console.log('Notification historique générée après mise à jour mintDate:', project.id, project.name);
          }
          return { ...project, passed: true };
        }
        return project;
      });
      localStorage.setItem(`notifications_${account}`, JSON.stringify(notifications));
      setProjects(updatedProjects);
      localStorage.setItem(`projects_${account}`, JSON.stringify(updatedProjects));
    }

    // Mettre à jour les compteurs
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
    const now = new Date();
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

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#00DDAF' }}>
      <div
        className={`${
          showFilters ? 'w-64' : 'w-0'
        } bg-gray-100 p-4 transition-all duration-300 overflow-hidden`}
      >
        {showFilters && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Filtres</h2>
            <div>
              <label className="text-gray-800 font-semibold">Rechercher par nom :</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un projet..."
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
              />
            </div>
            <div>
              <label className="text-gray-800 font-semibold">Filtrer par note :</label>
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
                Free mints uniquement
              </label>
            </div>
            <div>
              <label className="text-gray-800 font-semibold">Filtrer par type :</label>
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
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-gray-800 font-semibold">Filtrer par date :</label>
              <div className="space-y-1 mt-1">
                {['today', 'this-week', 'this-month'].map((date) => (
                  <label key={date} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterDate === date}
                      onChange={() => setFilterDate(filterDate === date ? null : date)}
                      className="mr-2"
                    />
                    {date === 'today'
                      ? "Aujourd'hui"
                      : date === 'this-week'
                      ? 'Cette semaine'
                      : 'Ce mois-ci'}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 p-6">
        <div className="flex flex-col items-center mb-12 w-full">
          <img src={dancinghamster} alt="Hamster dansant" className="w-48 h-48 object-contain" />
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
            {showFilters ? 'Masquer Filtres' : 'Afficher Filtres'}
          </button>
        </div>

        <div className="mb-6" ref={projectListRef}>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Liste de mes projets</h2>
          {allFilteredProjects.length === 0 ? (
            <p className="text-gray-700">Aucun projet à afficher.</p>
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
                          alt={project.name || 'Project Image'}
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
                        onClick={() => handleEditClick(project.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-2"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    {isToday(project.mintDate) && (
                      <span className="bg-red-600 text-white px-4 py-2 rounded-lg text-lg animate-pulse inline-block">
                        Today
                      </span>
                    )}
                    {isTomorrow(project.mintDate) && (
                      <span
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg text-lg animate-pulse inline-block"
                        style={{ position: 'relative', zIndex: 10 }}
                      >
                        Tomorrow
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6 flex justify-center">
          <AddProject onAddProject={handleAddProject} />
        </div>

        {selectedProjectId && (
          <div ref={tableRef}>
            {confirmedDateProjects
              .filter((project) => project.id === selectedProjectId)
              .map((project) => (
                <div key={project.id} className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Modification de {project.name}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse rounded-lg shadow-lg bg-white">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">
                            Nom
                          </th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">
                            Type
                          </th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">
                            Date de mint
                          </th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">
                            Heure de mint
                          </th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">
                            Note
                          </th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">
                            Prix
                          </th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">
                            Image
                          </th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">
                            Liens
                          </th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">
                            Actions
                          </th>
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
                              <option value="TGE">TGE</option>
                              <option value="WL">WL</option>
                              <option value="OG">OG</option>
                              <option value="Waitlist">Waitlist</option>
                              <option value="Interested">Interested</option>
                              <option value="Airdrop">Airdrop</option>
                              <option value="Launch">Launch</option>
                              <option value="Custom">Personnalisé</option>
                            </select>
                            {project.type === 'Custom' && (
                              <input
                                type="text"
                                value={project.customType || ''}
                                onChange={(e) =>
                                  updateProjectField(project.id, 'customType', e.target.value)
                                }
                                className="w-full p-2 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Type personnalisé"
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
                              <span>Free</span>
                              {!project.isFree && (
                                <input
                                  type="text"
                                  value={project.price || ''}
                                  onChange={(e) =>
                                    updateProjectField(project.id, 'price', e.target.value)
                                  }
                                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Prix"
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
                                alt={project.name || 'Project Image'}
                                className="w-20 h-20 object-cover rounded-lg"
                                onError={(e) => (e.target.src = 'https://placehold.co/80x80')}
                              />
                            ) : (
                              <span className="text-gray-500">Aucune image</span>
                            )}
                            <div className="mt-2">
                              <label className="block text-gray-700">Télécharger une image :</label>
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
                              <label className="block text-gray-700">Ou URL image :</label>
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
                                    Telegram
                                  </a>
                                ) : (
                                  <span className="text-gray-500">Aucun lien Telegram</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'telegramLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.telegramLink ? 'Modifier' : 'Ajouter'}
                                </button>
                                {editingLinks[`${project.id}-telegramLink`] && (
                                  <input
                                    type="text"
                                    value={project.telegramLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'telegramLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Lien Telegram"
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
                                    X
                                  </a>
                                ) : (
                                  <span className="text-gray-500">Aucun lien X</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'xLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.xLink ? 'Modifier' : 'Ajouter'}
                                </button>
                                {editingLinks[`${project.id}-xLink`] && (
                                  <input
                                    type="text"
                                    value={project.xLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'xLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Lien X"
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
                                    Discord
                                  </a>
                                ) : (
                                  <span className="text-gray-500">Aucun lien Discord</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'discordLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.discordLink ? 'Modifier' : 'Ajouter'}
                                </button>
                                {editingLinks[`${project.id}-discordLink`] && (
                                  <input
                                    type="text"
                                    value={project.discordLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'discordLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Lien Discord"
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
                                    Site
                                  </a>
                                ) : (
                                  <span className="text-gray-500">Aucun lien site</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'websiteLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.websiteLink ? 'Modifier' : 'Ajouter'}
                                </button>
                                {editingLinks[`${project.id}-websiteLink`] && (
                                  <input
                                    type="text"
                                    value={project.websiteLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'websiteLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Lien site"
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
                                    Plateforme
                                  </a>
                                ) : (
                                  <span className="text-gray-500">Aucun lien plateforme</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'platformLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.platformLink ? 'Modifier' : 'Ajouter'}
                                </button>
                                {editingLinks[`${project.id}-platformLink`] && (
                                  <input
                                    type="text"
                                    value={project.platformLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'platformLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Lien plateforme"
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
                                    Organisateur
                                  </a>
                                ) : (
                                  <span className="text-gray-500">Aucun lien organisateur</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'organizerLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.organizerLink ? 'Modifier' : 'Ajouter'}
                                </button>
                                {editingLinks[`${project.id}-organizerLink`] && (
                                  <input
                                    type="text"
                                    value={project.organizerLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'organizerLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Lien organisateur"
                                  />
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3 space-y-2 min-w-[150px]">
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors w-full"
                            >
                              Supprimer
                            </button>
                            <button
                              onClick={handleValidate}
                              className="bg-green-500 text-white px-5 py-3 rounded-lg hover:bg-green-600 transition-colors w-full border-2 border-green-700"
                            >
                              Valider
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
                    Modification de {project.name}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse rounded-lg shadow-lg bg-white">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">
                            Nom
                          </th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">
                            Type
                          </th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">
                            Date provisoire
                          </th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">
                            Note
                          </th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">
                            Prix
                          </th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">
                            Image
                          </th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">
                            Liens
                          </th>
                          <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">
                            Actions
                          </th>
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
                              <option value="TGE">TGE</option>
                              <option value="WL">WL</option>
                              <option value="OG">OG</option>
                              <option value="Waitlist">Waitlist</option>
                              <option value="Interested">Interested</option>
                              <option value="Airdrop">Airdrop</option>
                              <option value="Launch">Launch</option>
                              <option value="Custom">Personnalisé</option>
                            </select>
                            {project.type === 'Custom' && (
                              <input
                                type="text"
                                value={project.customType || ''}
                                onChange={(e) =>
                                  updateProjectField(project.id, 'customType', e.target.value)
                                }
                                className="w-full p-2 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Type personnalisé"
                              />
                            )}
                          </td>
                          <td className="border border-gray-300 p-3">
                            <input
                              type="text"
                              value={project.provisionalDate || ''}
                              onChange={(e) =>
                                updateProjectField(project.id, 'provisionalDate', e.target.value)
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
                              <span>Free</span>
                              {!project.isFree && (
                                <input
                                  type="text"
                                  value={project.price || ''}
                                  onChange={(e) =>
                                    updateProjectField(project.id, 'price', e.target.value)
                                  }
                                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Prix"
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
                                alt={project.name || 'Project Image'}
                                className="w-20 h-20 object-cover rounded-lg"
                                onError={(e) => (e.target.src = 'https://placehold.co/80x80')}
                              />
                            ) : (
                              <span className="text-gray-500">Aucune image</span>
                            )}
                            <div className="mt-2">
                              <label className="block text-gray-700">Télécharger une image :</label>
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
                              <label className="block text-gray-700">Ou URL image :</label>
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
                                    Telegram
                                  </a>
                                ) : (
                                  <span className="text-gray-500">Aucun lien Telegram</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'telegramLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.telegramLink ? 'Modifier' : 'Ajouter'}
                                </button>
                                {editingLinks[`${project.id}-telegramLink`] && (
                                  <input
                                    type="text"
                                    value={project.telegramLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'telegramLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Lien Telegram"
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
                                    X
                                  </a>
                                ) : (
                                  <span className="text-gray-500">Aucun lien X</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'xLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.xLink ? 'Modifier' : 'Ajouter'}
                                </button>
                                {editingLinks[`${project.id}-xLink`] && (
                                  <input
                                    type="text"
                                    value={project.xLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'xLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Lien X"
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
                                    Discord
                                  </a>
                                ) : (
                                  <span className="text-gray-500">Aucun lien Discord</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'discordLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.discordLink ? 'Modifier' : 'Ajouter'}
                                </button>
                                {editingLinks[`${project.id}-discordLink`] && (
                                  <input
                                    type="text"
                                    value={project.discordLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'discordLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Lien Discord"
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
                                    Site
                                  </a>
                                ) : (
                                  <span className="text-gray-500">Aucun lien site</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'websiteLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.websiteLink ? 'Modifier' : 'Ajouter'}
                                </button>
                                {editingLinks[`${project.id}-websiteLink`] && (
                                  <input
                                    type="text"
                                    value={project.websiteLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'websiteLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Lien site"
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
                                    Plateforme
                                  </a>
                                ) : (
                                  <span className="text-gray-500">Aucun lien plateforme</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'platformLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.platformLink ? 'Modifier' : 'Ajouter'}
                                </button>
                                {editingLinks[`${project.id}-platformLink`] && (
                                  <input
                                    type="text"
                                    value={project.platformLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'platformLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Lien plateforme"
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
                                    Organisateur
                                  </a>
                                ) : (
                                  <span className="text-gray-500">Aucun lien organisateur</span>
                                )}
                                <button
                                  onClick={() => toggleLinkEdit(project.id, 'organizerLink')}
                                  className="text-gray-500 hover:text-blue-500 text-sm"
                                >
                                  {project.organizerLink ? 'Modifier' : 'Ajouter'}
                                </button>
                                {editingLinks[`${project.id}-organizerLink`] && (
                                  <input
                                    type="text"
                                    value={project.organizerLink || ''}
                                    onChange={(e) =>
                                      updateProjectField(project.id, 'organizerLink', e.target.value)
                                    }
                                    className="w-full p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Lien organisateur"
                                  />
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3 space-y-2 min-w-[150px]">
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors w-full"
                            >
                              Supprimer
                            </button>
                            <button
                              onClick={handleValidate}
                              className="bg-green-500 text-white px-5 py-3 rounded-lg hover:bg-green-600 transition-colors w-full border-2 border-green-700"
                            >
                              Valider
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
      </div>
    </div>
  );
}

export default Home;