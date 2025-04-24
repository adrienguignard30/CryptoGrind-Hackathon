import React, { useState, useEffect, useContext } from 'react';
import { GrindContext } from '../App';
import { useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import axios from 'axios';

function Missions() {
  const { grindBalance, account } = useContext(GrindContext);

  const [tickets, setTickets] = useState(() => parseInt(localStorage.getItem('userTickets')) || 0);
  const [totalTickets, setTotalTickets] = useState(() => parseInt(localStorage.getItem('totalTickets')) || 0);
  const [participants, setParticipants] = useState(() => {
    const savedParticipants = localStorage.getItem('lotteryParticipants');
    return savedParticipants ? JSON.parse(savedParticipants) : [];
  });
  const [userTicketsInLottery, setUserTicketsInLottery] = useState(0);
  const [lastLotteryDate, setLastLotteryDate] = useState(() => localStorage.getItem('lastLotteryDate') || null);
  const [missionsStatus, setMissionsStatus] = useState(() => {
    const savedMissions = localStorage.getItem(`missionsStatus_${account}`);
    return savedMissions ? JSON.parse(savedMissions) : {
      tweet1Like: false,
      tweet1Retweet: false,
      tweet1Reply: false,
      tweet2Like: false,
      tweet2Retweet: false,
      tweet2Reply: false,
      tweet3Like: false,
      tweet3Retweet: false,
      tweet3Reply: false,
      abstractVote: false,
    };
  });
  const [userXId, setUserXId] = useState(() => localStorage.getItem(`xUserId_${account}`) || null);
  const [tweetsDetails, setTweetsDetails] = useState([]);

  const tweets = [
    { id: 'tweet1', tweetId: '1911158667698749614', url: 'https://x.com/bearish_af/status/1911158667698749614', text: 'Tweet by @bearish_af - Join the $GRIND vibe!' },
    { id: 'tweet2', tweetId: '1912563448463995040', url: 'https://x.com/Adrienfam_arts/status/1912563448463995040', text: 'Tweet by @Adrienfam_arts - Amazing $GRIND art!' },
    { id: 'tweet3', tweetId: '1912265705359110144', url: 'https://x.com/Adrienfam_a/status/1912265705359110144', text: 'Tweet by @Adrienfam_a' },
  ];

  const { sendTransaction, isLoading, isSuccess, error } = useSendTransaction();
  const LOTTERY_ADDRESS = '0x62100eBD5A41133723e91613755AB8dc65C3a13D';

  useEffect(() => {
    localStorage.setItem('userTickets', tickets.toString());
    localStorage.setItem('totalTickets', totalTickets.toString());
    localStorage.setItem('lotteryParticipants', JSON.stringify(participants));
    localStorage.setItem('lastLotteryDate', lastLotteryDate || '');
    localStorage.setItem(`missionsStatus_${account}`, JSON.stringify(missionsStatus));
    if (userXId) localStorage.setItem(`xUserId_${account}`, userXId);
  }, [tickets, totalTickets, participants, lastLotteryDate, missionsStatus, userXId, account]);

  useEffect(() => {
    if (totalTickets >= 1000) {
      if (!lastLotteryDate || new Date(lastLotteryDate).getTime() < new Date().getTime() - 1000 * 60) {
        drawLottery();
      }
    }
  }, [totalTickets]);

  useEffect(() => {
    const fetchTweetsDetails = async () => {
      const X_API_TOKEN = process.env.REACT_APP_X_API_TOKEN;
      if (!X_API_TOKEN) {
        console.error('Bearer Token manquant dans les variables d\'environnement');
        return;
      }

      const tweetId = tweets[0].tweetId;
      try {
        const response = await axios.get(`https://cors-anywhere.herokuapp.com/https://api.x.com/2/tweets/${tweetId}`, {
          params: { 'tweet.fields': 'text,created_at' },
          headers: { Authorization: `Bearer ${X_API_TOKEN}` },
        });

        setTweetsDetails([{
          id: response.data.data.id,
          text: response.data.data.text,
          image: null,
        }]);
      } catch (error) {
        console.error('Erreur lors de la récupération des tweets :', error.response?.data || error.message);
        setTweetsDetails(tweets.map(tweet => ({ id: tweet.tweetId, text: tweet.text, image: null })));
      }
    };

    fetchTweetsDetails();
  }, []);

  const connectXAccount = async () => {
    const X_CLIENT_ID = process.env.REACT_APP_X_CLIENT_ID;
    if (!X_CLIENT_ID) return console.error('Client ID manquant dans les variables d\'environnement');
    const redirectUri = 'http://localhost:3001/callback';
    const authUrl = `https://api.x.com/2/oauth2/authorize?client_id=${X_CLIENT_ID}&redirect_uri=${redirectUri}&scope=tweet.read%20users.read%20likes.read&response_type=code&state=state123`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      const X_CLIENT_ID = process.env.REACT_APP_X_CLIENT_ID;
      const X_CLIENT_SECRET = process.env.REACT_APP_X_CLIENT_SECRET;
      if (!X_CLIENT_ID || !X_CLIENT_SECRET) return console.error('Client ID ou Client Secret manquant dans les variables d\'environnement');
      axios.post('https://cors-anywhere.herokuapp.com/https://api.x.com/2/oauth2/token', {
        code,
        grant_type: 'authorization_code',
        client_id: X_CLIENT_ID,
        client_secret: X_CLIENT_SECRET,
        redirect_uri: 'http://localhost:3001/callback',
      }).then(response => {
        const accessToken = response.data.access_token;
        axios.get('https://cors-anywhere.herokuapp.com/https://api.x.com/2/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).then(userResponse => {
          const userId = userResponse.data.data.id;
          setUserXId(userId);
          localStorage.setItem(`xUserId_${account}`, userId);
        });
      }).catch(error => {
        console.error('Erreur lors du callback OAuth :', error.response?.data || error.message);
      });
    }
  }, [account]);

  const buyTicketWithETH = () => {
    const ticketPriceETH = '0.01';
    if (!account) return alert('Veuillez connecter votre wallet.');
    if (parseInt(grindBalance) < parseEther(ticketPriceETH)) return alert(`Solde ETH insuffisant ! Vous avez besoin de ${ticketPriceETH} ETH pour acheter un ticket.`);
    sendTransaction({ to: LOTTERY_ADDRESS, value: parseEther(ticketPriceETH) });
  };

  useEffect(() => {
    if (isSuccess) {
      setTickets(prev => prev + 1);
      setTotalTickets(prev => prev + 1);
      alert('Vous avez acheté un ticket pour la loterie avec 0.01 ETH !');
    }
    if (error) alert(`Erreur lors de l'achat du ticket : ${error.message}`);
  }, [isSuccess, error]);

  const verifyXAction = async (actionType, tweetId) => {
    if (!userXId) {
      alert('Veuillez connecter votre compte X pour vérifier les actions.');
      return false;
    }
    alert('Vérification désactivée temporairement. Simule un succès.');
    return true;
  };

  const verifyAbstractVote = async () => {
    console.log('Vérification du vote sur Abstract...');
    return true;
  };

  const completeMission = async (action, tweetId = null) => {
    let ticketsToAdd = 0;
    let missionCompleted = false;
    let missionKey = action;

    if (tweetId) missionKey = `${tweetId}${action}`;
    if (missionsStatus[missionKey]) return alert(`Mission déjà complétée : ${action}.`);

    if (action === 'Like' || action === 'Retweet' || action === 'Reply') {
      missionCompleted = await verifyXAction(action.toLowerCase(), tweetId);
      ticketsToAdd = action === 'Like' ? 1 : 2;
    } else if (action === 'abstractVote') {
      missionCompleted = await verifyAbstractVote();
      ticketsToAdd = 1;
    }

    if (missionCompleted) {
      setTickets(prev => prev + ticketsToAdd);
      setTotalTickets(prev => prev + ticketsToAdd);
      setMissionsStatus(prev => ({ ...prev, [missionKey]: true }));
      alert(`Mission complétée : ${action} ! +${ticketsToAdd} ticket(s)`);
    } else {
      alert(`Échec de la vérification pour la mission : ${action}. Veuillez réessayer.`);
    }
  };

  const joinLottery = (ticketCount) => {
    if (ticketCount > tickets) return alert("Vous n'avez pas assez de tickets !");
    if (ticketCount <= 0) return alert("Veuillez entrer un nombre de tickets supérieur à 0.");

    const updatedParticipants = [...participants, { user: account || 'Utilisateur', tickets: ticketCount }];
    setParticipants(updatedParticipants);
    setTickets(prev => prev - ticketCount);
    setUserTicketsInLottery(prev => prev + ticketCount);
    alert(`Vous avez rejoint la loterie avec ${ticketCount} tickets !`);
  };

  const drawLottery = () => {
    const totalLotteryTickets = participants.reduce((sum, p) => sum + p.tickets, 0);
    if (totalLotteryTickets === 0) return alert("Aucun participant dans la loterie !");

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

    if (winner) alert(`${winner.user} a gagné un paquet de café Making Coffee avec ${winner.tickets} tickets !`);
    setParticipants([]);
    setTotalTickets(0);
    setUserTicketsInLottery(0);
    setLastLotteryDate(new Date().toISOString());
  };

  return (
    <div className="p-4 text-center" style={{ backgroundColor: '#1a3c34', minHeight: '100vh' }}>
      <h1 className="text-2xl font-bold mb-4 text-white">Missions et Loterie</h1>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2 text-white">Missions</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-lg mb-4">Nombre de tickets : {tickets}</p>
          <p className="text-lg mb-4">Solde ETH : {(parseInt(grindBalance) / 1e18).toFixed(4)} ETH</p>
          <p className="text-lg mb-4">Total des tickets (tous les joueurs) : {totalTickets}</p>
          {!userXId && (
            <div className="mb-4">
              <button onClick={connectXAccount} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Connecter le compte X
              </button>
            </div>
          )}
          <div className="space-y-6">
            {tweets.map((tweet) => {
              const tweetDetail = tweetsDetails.find(td => td.id === tweet.tweetId);
              return (
                <div key={tweet.id} className="border p-4 rounded-lg">
                  <a href={tweet.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {tweetDetail?.text || tweet.text}
                  </a>
                  {tweetDetail?.image && (
                    <div className="mt-2 flex justify-center">
                      <img src={tweetDetail.image} alt="Tweet Media" className="max-w-full h-auto rounded-lg shadow-lg transition-transform duration-300 hover:scale-105" style={{ maxWidth: '500px' }} />
                    </div>
                  )}
                  <div className="mt-2 space-x-2">
                    <button onClick={() => completeMission('Like', tweet.id)} disabled={!userXId} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400">
                      Like (+1 ticket)
                    </button>
                    <button onClick={() => completeMission('Retweet', tweet.id)} disabled={!userXId} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400">
                      Retweet (+2 tickets)
                    </button>
                    <button onClick={() => completeMission('Reply', tweet.id)} disabled={!userXId} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400">
                      Reply (+2 tickets)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="space-y-4 mt-6">
            <button onClick={() => completeMission('abstractVote')} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Voter sur Abstract (+1 ticket)
            </button>
            <button onClick={buyTicketWithETH} disabled={isLoading} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              {isLoading ? 'Achat en cours...' : 'Acheter un ticket avec 0.01 ETH'}
            </button>
          </div>
        </div>
      </div>
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
              <input type="number" min="1" max={tickets} onChange={(e) => setUserTicketsInLottery(parseInt(e.target.value) || 0)} className="border p-2 rounded w-32" />
              <button onClick={() => joinLottery(userTicketsInLottery)} className="ml-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                Participer à la loterie
              </button>
            </div>
            <button onClick={drawLottery} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Forcer le tirage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Missions;