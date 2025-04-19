import React, { useState } from 'react';

function AddProject({ onAddProject }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('TGE');
  const [customType, setCustomType] = useState('');
  const [mintDate, setMintDate] = useState('');
  const [mintTime, setMintTime] = useState('');
  const [provisionalDate, setProvisionalDate] = useState('');
  const [notificationFrequency, setNotificationFrequency] = useState('');
  const [chain, setChain] = useState('Abstract'); // Nouveau champ pour la chaîne
  const [customChain, setCustomChain] = useState('');
  const [note, setNote] = useState(1);
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [xLink, setXLink] = useState('');
  const [discordLink, setDiscordLink] = useState('');
  const [websiteLink, setWebsiteLink] = useState('');
  const [platformLink, setPlatformLink] = useState('');
  const [organizerLink, setOrganizerLink] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanLink = (link) => {
      if (!link) return null;
      return link.replace(/^https:\/\/https:\/\//i, 'https://');
    };

    const project = {
      id: Date.now().toString(),
      name,
      type,
      customType: type === 'Custom' ? customType : '',
      mintDate: mintDate || null,
      mintTime: mintTime || null,
      provisionalDate: provisionalDate || null,
      notificationFrequency: provisionalDate ? notificationFrequency || null : null,
      chain: chain === 'Custom' ? customChain : chain, // Chaîne sélectionnée
      note: parseInt(note),
      isFree,
      price: isFree ? '' : price,
      image: imageUrl || image,
      telegramLink: cleanLink(telegramLink),
      xLink: cleanLink(xLink),
      discordLink: cleanLink(discordLink),
      websiteLink: cleanLink(websiteLink),
      platformLink: cleanLink(platformLink),
      organizerLink: cleanLink(organizerLink),
    };
    onAddProject(project);
    setName('');
    setType('TGE');
    setCustomType('');
    setMintDate('');
    setMintTime('');
    setProvisionalDate('');
    setNotificationFrequency('');
    setChain('Abstract');
    setCustomChain('');
    setNote(1);
    setIsFree(false);
    setPrice('');
    setImage(null);
    setImageUrl('');
    setTelegramLink('');
    setXLink('');
    setDiscordLink('');
    setWebsiteLink('');
    setPlatformLink('');
    setOrganizerLink('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ajouter un projet</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Nom du projet :</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Type :</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
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
          {type === 'Custom' && (
            <input
              type="text"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              className="w-full p-2 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type personnalisé"
            />
          )}
        </div>
        <div>
          <label className="block text-gray-700">Date de mint :</label>
          <input
            type="date"
            value={mintDate}
            onChange={(e) => setMintDate(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700">Heure de mint :</label>
          <input
            type="time"
            value={mintTime}
            onChange={(e) => setMintTime(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700">Date provisoire (WEN) :</label>
          <input
            type="text"
            value={provisionalDate}
            onChange={(e) => setProvisionalDate(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Q1 2025"
          />
        </div>
        {provisionalDate && (
          <div>
            <label className="block text-gray-700">Fréquence des notifications (jours) :</label>
            <select
              value={notificationFrequency}
              onChange={(e) => setNotificationFrequency(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Aucune</option>
              <option value="1">1 jour</option>
              <option value="3">3 jours</option>
              <option value="7">7 jours</option>
              <option value="15">15 jours</option>
              <option value="30">30 jours</option>
            </select>
          </div>
        )}
        <div>
          <label className="block text-gray-700">Chaîne :</label>
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Abstract">Abstract</option>
            <option value="ETH">ETH</option>
            <option value="BTC">BTC</option>
            <option value="SOL">SOL</option>
            <option value="BNB">BNB</option>
            <option value="Custom">Personnalisée</option>
          </select>
          {chain === 'Custom' && (
            <input
              type="text"
              value={customChain}
              onChange={(e) => setCustomChain(e.target.value)}
              className="w-full p-2 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nom de la chaîne personnalisée"
            />
          )}
        </div>
        <div>
          <label className="block text-gray-700">Note (1-10) :</label>
          <input
            type="number"
            min="1"
            max="10"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="flex items-center text-gray-700">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="mr-2"
            />
            Free mint
          </label>
          {!isFree && (
            <div className="mt-2">
              <label className="block text-gray-700">Prix :</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 0.05 ETH"
              />
            </div>
          )}
        </div>
        <div>
          <label className="block text-gray-700">Image :</label>
          <div className="mt-1">
            <label className="block text-gray-700">Télécharger une image :</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setImage(e.target.files[0]);
                setImageUrl('');
              }}
              className="w-full p-2"
            />
          </div>
          <div className="mt-2">
            <label className="block text-gray-700">Ou entrer une URL d'image :</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImage(null);
              }}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: https://example.com/image.jpg"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-700">Liens (optionnels) :</label>
          <div className="space-y-2 mt-1">
            <div>
              <label className="block text-gray-700">Telegram :</label>
              <input
                type="text"
                value={telegramLink}
                onChange={(e) => setTelegramLink(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: https://t.me/..."
              />
            </div>
            <div>
              <label className="block text-gray-700">X :</label>
              <input
                type="text"
                value={xLink}
                onChange={(e) => setXLink(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: https://x.com/..."
              />
            </div>
            <div>
              <label className="block text-gray-700">Discord :</label>
              <input
                type="text"
                value={discordLink}
                onChange={(e) => setDiscordLink(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: https://discord.gg/..."
              />
            </div>
            <div>
              <label className="block text-gray-700">Site web :</label>
              <input
                type="text"
                value={websiteLink}
                onChange={(e) => setWebsiteLink(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: https://www.example.com"
              />
            </div>
            <div>
              <label className="block text-gray-700">Plateforme :</label>
              <input
                type="text"
                value={platformLink}
                onChange={(e) => setPlatformLink(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: https://platform.example.com"
              />
            </div>
            <div>
              <label className="block text-gray-700">Organisateur :</label>
              <input
                type="text"
                value={organizerLink}
                onChange={(e) => setOrganizerLink(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: https://organizer.example.com"
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-5 py-3 rounded-lg hover:bg-green-600 transition-colors w-full border-2 border-green-700"
        >
          Valider
        </button>
      </form>
    </div>
  );
}

export default AddProject;