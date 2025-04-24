import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function AddProject({ onAddProject }) {
  const { t, i18n } = useTranslation();
  console.log('Langue actuelle dans AddProject.js :', i18n.language);

  const [name, setName] = useState('');
  const [type, setType] = useState('TGE');
  const [customType, setCustomType] = useState('');
  const [mintDate, setMintDate] = useState('');
  const [mintTime, setMintTime] = useState('');
  const [provisionalDate, setProvisionalDate] = useState('');
  const [notificationFrequency, setNotificationFrequency] = useState('1'); // Valeur par défaut : 1 jour
  const [chain, setChain] = useState('Abstract');
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
      notificationFrequency: notificationFrequency || '1', // Toujours enregistrer, avec "1" par défaut
      chain: chain === 'Custom' ? customChain : chain,
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
    setNotificationFrequency('1'); // Réinitialiser à 1
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
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('add_project')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold">{t('project_name')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">{t('type')}</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
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
          {type === 'Custom' && (
            <input
              type="text"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              className="w-full p-2 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('custom_type_placeholder')}
            />
          )}
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">{t('mint_date')}</label>
          <input
            type="date"
            value={mintDate}
            onChange={(e) => setMintDate(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('date_format_placeholder')}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">{t('mint_time')}</label>
          <input
            type="time"
            value={mintTime}
            onChange={(e) => setMintTime(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">{t('provisional_date')}</label>
          <input
            type="text"
            value={provisionalDate}
            onChange={(e) => setProvisionalDate(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('provisional_date_placeholder')}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">{t('notification_frequency_label')}</label>
          <select
            value={notificationFrequency}
            onChange={(e) => setNotificationFrequency(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('no_notification')}</option>
            <option value="1">{t('1_day')}</option>
            <option value="3">{t('3_days')}</option>
            <option value="7">{t('7_days')}</option>
            <option value="15">{t('15_days')}</option>
            <option value="30">{t('30_days')}</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">{t('chain')}</label>
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Abstract">{t('chain_abstract')}</option>
            <option value="ETH">{t('chain_eth')}</option>
            <option value="BTC">{t('chain_btc')}</option>
            <option value="SOL">{t('chain_sol')}</option>
            <option value="BNB">{t('chain_bnb')}</option>
            <option value="Custom">{t('chain_custom')}</option>
          </select>
          {chain === 'Custom' && (
            <input
              type="text"
              value={customChain}
              onChange={(e) => setCustomChain(e.target.value)}
              className="w-full p-2 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('custom_chain_placeholder')}
            />
          )}
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">{t('note')}</label>
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
          <label className="flex items-center text-gray-700 font-semibold">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="mr-2"
            />
            {t('free_mint')}
          </label>
          {!isFree && (
            <div className="mt-2">
              <label className="block text-gray-700 font-semibold">{t('price')}</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('price_placeholder')}
              />
            </div>
          )}
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">{t('image')}</label>
          <div className="mt-1">
            <label className="block text-gray-700 font-semibold">{t('upload_image')}</label>
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
            <label className="block text-gray-700 font-semibold">{t('image_url')}</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImage(null);
              }}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('image_url_placeholder')}
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">{t('links_optional')}</label>
          <div className="space-y-2 mt-1">
            <div>
              <label className="block text-gray-700 font-semibold">{t('telegram')}</label>
              <input
                type="text"
                value={telegramLink}
                onChange={(e) => setTelegramLink(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('telegram_link_placeholder')}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">{t('x')}</label>
              <input
                type="text"
                value={xLink}
                onChange={(e) => setXLink(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('x_link_placeholder')}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">{t('discord')}</label>
              <input
                type="text"
                value={discordLink}
                onChange={(e) => setDiscordLink(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('discord_link_placeholder')}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">{t('website')}</label>
              <input
                type="text"
                value={websiteLink}
                onChange={(e) => setWebsiteLink(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('website_link_placeholder')}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">{t('platform')}</label>
              <input
                type="text"
                value={platformLink}
                onChange={(e) => setPlatformLink(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('platform_link_placeholder')}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold">{t('organizer')}</label>
              <input
                type="text"
                value={organizerLink}
                onChange={(e) => setOrganizerLink(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('organizer_link_placeholder')}
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-5 py-3 rounded-lg hover:bg-green-600 transition-colors w-full border-2 border-green-700"
        >
          {t('validate')}
        </button>
      </form>
    </div>
  );
}

export default AddProject;