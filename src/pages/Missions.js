import React, { useState, useEffect, useContext } from 'react';
import { GrindContext } from '../App';

function Missions() {
  const { grindBalance, buyGrind } = useContext(GrindContext);

  // État pour les tickets de l'utilisateur, le total des tickets et les participants
  const [tickets, setTickets] = useState(() => parseInt(localStorage.getItem('userTickets')) || 0);
  const [totalTickets, setTotalTickets] = useState(() => parseInt(localStorage.getItem('totalTickets')) || 0);
  const [participants, setParticipants] = useState(() => {
    const savedParticipants = localStorage.getItem('lotteryParticipants');
    return savedParticipants ? JSON.parse(savedParticipants) : [];
  });
  const [userTicketsInLottery, setUserTicketsInLottery] = useState(0);
  const [lastLotteryDate, setLastLotteryDate] = useState(() => localStorage.getItem('lastLotteryDate') || null);
  const [missionsStatus, setMissionsStatus] = useState({
    xLike: false,
    xRetweet: false,
    xFollow: false,
    abstractVote: false,
  });

  // Sauvegarde des données dans localStorage
  useEffect(() => {
    localStorage.setItem('userTickets', tickets.toString());
    localStorage.setItem('totalTickets', totalTickets.toString());
    localStorage.setItem('lotteryParticipants', JSON.stringify(participants));
    localStorage.setItem('lastLotteryDate', lastLotteryDate || '');
  }, [tickets, totalTickets, participants, lastLotteryDate]);

  // Vérifier automatiquement la loterie tous les 1000 tickets
  useEffect(() => {
    if (totalTickets >= 1000) {
      if (!lastLotteryDate || new Date(lastLotteryDate).getTime() < new Date().getTime() - 1000 * 60) {
        drawLottery();
      }
    }
  }, [totalTickets]);

  // Fonction pour vérifier les actions sur X (like, retweet, follow)
  const verifyXAction = async (actionType) => {
    // Remplace ceci par ta clé API ou ton Bearer Token pour X
    const X_API_TOKEN = 'YOUR_X_API_TOKEN'; // À remplacer

    try {
      // Exemple d'URL de l'API X (v2) pour vérifier une action
      let endpoint;
      if (actionType === 'like') {
        endpoint = 'https://api.x.com/2/users/me/likes';
      } else if (actionType === 'retweet') {
        endpoint = 'https://api.x.com/2/users/me/retweets';
      } else if (actionType === 'follow') {
        endpoint = 'https://api.x.com/2/users/me/following';
      }

      // Simuler une vérification (remplace ceci par une vraie requête API)
      console.log(`Vérification de l'action ${actionType} sur X...`);

      // Exemple de requête (à décommenter et adapter avec une vraie API)
      /*
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${X_API_TOKEN}`,
        },
      });
      const data = await response.json();
      if (actionType === 'like' || actionType === 'retweet') {
        // Vérifie si l'utilisateur a liké ou retweeté un post spécifique
        const postId = 'POST_ID'; // Remplace par l'ID du post cible
        return data.data.some((item) => item.id === postId);
      } else if (actionType === 'follow') {
        // Vérifie si l'utilisateur suit un compte spécifique
        const accountId = 'ACCOUNT_ID'; // Remplace par l'ID du compte cible
        return data.data.some((user) => user.id === accountId);
      }
      */

      // Simulation pour les tests (à supprimer une fois l'API intégrée)
      return true; // Simule une action réussie
    } catch (error) {
      console.error(`Erreur lors de la vérification de l'action ${actionType} sur X:`, error);
      return false;
    }
  };

  // Fonction pour vérifier un vote sur Abstract
  const verifyAbstractVote = async () => {
    // À remplacer par une vraie intégration de l'API Abstract
    console.log('Vérification du vote sur Abstract...');
    // Simulation pour les tests
    return true; // Simule un vote réussi
  };

  // Compléter une mission et attribuer des tickets
  const completeMission = async (action) => {
    let ticketsToAdd = 0;
    let missionCompleted = false;

    if (action === 'xLike') {
      if (missionsStatus.xLike) {
        alert('Mission déjà complétée : Like sur X.');
        return;
      }
      missionCompleted = await verifyXAction('like');
      ticketsToAdd = 1; // 1 ticket pour un like
    } else if (action === 'xRetweet') {
      if (missionsStatus.xRetweet) {
        alert('Mission déjà complétée : Retweet sur X.');
        return;
      }
      missionCompleted = await verifyXAction('retweet');
      ticketsToAdd = 2; // 2 tickets pour un retweet
    } else if (action === 'xFollow') {
      if (missionsStatus.xFollow) {
        alert('Mission déjà complétée : Follow sur X.');
        return;
      }
      missionCompleted = await verifyXAction('follow');
      ticketsToAdd = 2; // 2 tickets pour un follow
    } else if (action === 'abstractVote') {
      if (missionsStatus.abstractVote) {
        alert('Mission déjà complétée : Vote sur Abstract.');
        return;
      }
      missionCompleted = await verifyAbstractVote();
      ticketsToAdd = 1; // À ajuster selon les besoins
    }

    if (missionCompleted) {
      setTickets((prev) => prev + ticketsToAdd);
      setTotalTickets((prev) => prev + ticketsToAdd);
      setMissionsStatus((prev) => ({ ...prev, [action]: true }));
      alert(`Mission complétée : ${action} ! +${ticketsToAdd} ticket(s)`);
    } else {
      alert(`Échec de la vérification pour la mission : ${action}. Veuillez réessayer.`);
    }
  };

  // Acheter un ticket avec $GRIND (via Abstract testnet)
  const buyTicketWithGrind = async () => {
    const ticketPriceGrind = 10; // 1 ticket = 10 $GRIND
    const ticketPriceAbstract = ticketPriceGrind * 0.0001; // 1 $GRIND = 0.0001 $ABSTRACT

    if (grindBalance < ticketPriceGrind) {
      alert(`Solde $GRIND insuffisant ! Vous avez besoin de ${ticketPriceGrind} $GRIND pour acheter un ticket.`);
      return;
    }

    try {
      // Simuler une transaction sur Abstract testnet
      console.log(`Transaction sur Abstract testnet : Paiement de ${ticketPriceAbstract} $ABSTRACT...`);

      // Exemple de requête (à remplacer par une vraie interaction avec Abstract)
      /*
      const response = await fetch('ABSTRACT_TESTNET_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer YOUR_ABSTRACT_API_KEY`,
        },
        body: JSON.stringify({
          amount: ticketPriceAbstract,
          user: 'Utilisateur',
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error('Transaction échouée');
      */

      // Simulation pour les tests
      const transactionSuccess = true; // Simule une transaction réussie

      if (transactionSuccess) {
        buyGrind(-ticketPriceGrind); // Réduire le solde $GRIND
        setTickets((prev) => prev + 1);
        setTotalTickets((prev) => prev + 1);
        alert(`Vous avez acheté un ticket pour la loterie avec ${ticketPriceGrind} $GRIND (${ticketPriceAbstract} $ABSTRACT) !`);
      } else {
        alert('Échec de la transaction sur Abstract testnet. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'achat du ticket:', error);
      alert('Une erreur est survenue lors de l\'achat du ticket. Veuillez réessayer.');
    }
  };

  // Rejoindre la loterie
  const joinLottery = (ticketCount) => {
    if (ticketCount > tickets) {
      alert("Vous n'avez pas assez de tickets !");
      return;
    }
    if (ticketCount <= 0) {
      alert("Veuillez entrer un nombre de tickets supérieur à 0.");
      return;
    }

    const updatedParticipants = [...participants, { user: 'Utilisateur', tickets: ticketCount }];
    setParticipants(updatedParticipants);
    setTickets((prev) => prev - ticketCount);
    setUserTicketsInLottery((prev) => prev + ticketCount);
    alert(`Vous avez rejoint la loterie avec ${ticketCount} tickets !`);
  };

  // Tirer la loterie
  const drawLottery = () => {
    // Autoriser le tirage même si totalTickets < 1000 (bouton forcer)
    const totalLotteryTickets = participants.reduce((sum, p) => sum + p.tickets, 0);
    if (totalLotteryTickets === 0) {
      alert("Aucun participant dans la loterie !");
      return;
    }

    // Tirage au sort basé sur le nombre de tickets
    const randomTicket = Math.floor(Math.random() * totalLotteryTickets);
    let cumulativeTickets = 0;
    let winner = null;

    for (const participant of participants) {
      cumulativeTickets += participant.tickets;
      if (randomTicket < cumulativeTickets) {
        winner = participant;
        break;
      }
    }

    if (winner) {
      alert(`${winner.user} a gagné un paquet de café Making Coffee avec ${winner.tickets} tickets !`);
    }

    // Réinitialiser la loterie
    setParticipants([]);
    setTotalTickets(0);
    setUserTicketsInLottery(0);
    setLastLotteryDate(new Date().toISOString());
  };

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold mb-4 text-white">Missions et Loterie</h1>

      {/* Section Missions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2 text-white">Missions</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-lg mb-4">Nombre de tickets : {tickets}</p>
          <p className="text-lg mb-4">Solde $GRIND : {grindBalance}</p>
          <p className="text-lg mb-4">Total des tickets (tous les joueurs) : {totalTickets}</p>
          <div className="space-y-4">
            <button
              onClick={() => completeMission('xLike')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Like sur X (+1 ticket)
            </button>
            <button
              onClick={() => completeMission('xRetweet')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Retweet sur X (+2 tickets)
            </button>
            <button
              onClick={() => completeMission('xFollow')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Follow sur X (+2 tickets)
            </button>
            <button
              onClick={() => completeMission('abstractVote')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Voter sur Abstract (+1 ticket)
            </button>
            <button
              onClick={buyTicketWithGrind}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Acheter un ticket avec 10 $GRIND
            </button>
          </div>
        </div>
      </div>

      {/* Section Loterie */}
      <div>
        <h2 className="text-xl font-bold mb-2 text-white">Loterie</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-lg mb-4">
            La loterie se déclenche automatiquement tous les 1000 tickets. Vous pouvez forcer le tirage avec le bouton ci-dessous.
            Tous les 1000 tickets, un paquet de café Making Coffee est mis en jeu !
          </p>
          <p className="text-lg mb-4">Vos tickets dans la loterie : {userTicketsInLottery}</p>
          <p className="text-lg mb-4">Participants actuels : {participants.length}</p>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Nombre de tickets à utiliser :</label>
              <input
                type="number"
                min="1"
                max={tickets}
                onChange={(e) => setUserTicketsInLottery(parseInt(e.target.value) || 0)}
                className="border p-2 rounded w-32"
              />
              <button
                onClick={() => joinLottery(userTicketsInLottery)}
                className="ml-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Participer à la loterie
              </button>
            </div>
            <button
              onClick={drawLottery}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Forcer le tirage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Missions;