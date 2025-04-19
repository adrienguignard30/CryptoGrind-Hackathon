import React, { useState, useEffect } from 'react';
import { WagmiConfig, createConfig } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from '@wagmi/connectors';
import Header from './components/Header';
import Home from './pages/Home';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Missions from './pages/Missions';
import NotificationWen from './components/NotificationWen';
import AddProject from './components/AddProject';

const abstractTestnet = {
  id: 11124,
  name: 'Abstract Testnet',
  network: 'abstract-testnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://api.testnet.abs.xyz'],
    },
    public: {
      http: ['https://api.testnet.abs.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'AbstractScan', url: 'https://sepolia.abscan.org' },
  },
  testnet: true,
};

const queryClient = new QueryClient();

const config = createConfig({
  chains: [abstractTestnet],
  connectors: [injected()],
  client: ({ chain }) =>
    createPublicClient({
      chain,
      transport: http(),
    }),
});

export const GrindContext = React.createContext();

function App() {
  const [grindBalance, setGrindBalance] = useState(0);
  const [account, setAccount] = useState(null);
  const [projects, setProjects] = useState([]);

  // Charger les projets depuis localStorage en fonction de l'account
  useEffect(() => {
    if (account) {
      const savedProjects = localStorage.getItem(`projects_${account}`);
      console.log('Chargement projets depuis localStorage:', savedProjects);
      setProjects(savedProjects ? JSON.parse(savedProjects) : []);
    } else {
      setProjects([]);
    }
  }, [account]);

  // Synchroniser localStorage avec l'état projects
  useEffect(() => {
    if (account) {
      console.log('Sauvegarde projets dans localStorage:', projects);
      localStorage.setItem(`projects_${account}`, JSON.stringify(projects));
    }
  }, [projects, account]);

  const handleAddProject = (project) => {
    setProjects((prevProjects) => {
      const updatedProjects = [...prevProjects, project];
      console.log('Nouveau projet ajouté:', project);
      return updatedProjects;
    });
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const normalizedAccount = accounts[0].toLowerCase();
          console.log('MetaMask connecté, adresse:', normalizedAccount);
          setAccount(normalizedAccount);
        } else {
          console.log('Aucun compte MetaMask connecté');
        }
      } catch (error) {
        console.error('Erreur vérification connexion:', error);
      }
    };

    checkConnection();

    window.ethereum?.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) {
        const normalizedAccount = accounts[0].toLowerCase();
        console.log('Nouveau compte détecté:', normalizedAccount);
        setAccount(normalizedAccount);
      } else {
        console.log('Déconnexion détectée');
        setAccount(null);
      }
    });

    return () => {
      window.ethereum?.removeListener('accountsChanged');
    };
  }, []);

  console.log('Projets actuels:', projects);

  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <GrindContext.Provider value={{ grindBalance, account }}>
          <Router>
            <Header />
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    projects={projects}
                    setProjects={setProjects}
                    handleAddProject={handleAddProject}
                  />
                }
              />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/missions" element={<Missions />} />
              <Route path="/lottery" element={<NotificationWen projects={projects} />} />
              <Route path="/add-project" element={<AddProject onAddProject={handleAddProject} />} />
            </Routes>
          </Router>
        </GrindContext.Provider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;