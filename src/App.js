import React, { useState, useEffect } from 'react';
import { WagmiProvider, createConfig } from 'wagmi';
import { useAccount } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, walletConnect } from '@wagmi/connectors';
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
  connectors: [
    injected({ target: 'metaMask' }),
    walletConnect({
      projectId: '2471fc52b74931df68f43e44f96078b0',
      metadata: {
        name: 'CryptoGrind',
        description: 'CryptoGrind DApp',
        url: 'http://localhost:3001',
        icons: ['https://your-app-url.com/icon.png'],
      },
    }),
  ],
  client: ({ chain }) =>
    createPublicClient({
      chain,
      transport: http(),
    }),
});

export const GrindContext = React.createContext();

function AppContent() {
  const [grindBalance, setGrindBalance] = useState(0);
  const [account, setAccount] = useState(null);
  const [projects, setProjects] = useState([]);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      console.log('Mise à jour account:', address);
      setAccount(address.toLowerCase());
    } else {
      console.log('Aucun account connecté');
      setAccount(null);
    }
  }, [address, isConnected]);

  useEffect(() => {
    if (account) {
      const checkBalanceManually = async () => {
        try {
          const client = createPublicClient({
            chain: abstractTestnet,
            transport: http(),
          });
          const balance = await client.getBalance({ address: account });
          setGrindBalance(balance.toString());
        } catch (error) {
          console.error('Erreur requête manuelle solde:', error);
        }
      };
      checkBalanceManually();
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      const savedProjects = localStorage.getItem(`projects_${account}`);
      console.log('Chargement projets depuis localStorage:', savedProjects);
      setProjects(savedProjects ? JSON.parse(savedProjects) : []);
    } else {
      setProjects([]); // Correction ajoutée ici
    }
  }, [account]);

  useEffect(() => {
    if (account && projects.length > 0) {
      console.log('Sauvegarde projets dans localStorage:', projects);
      localStorage.setItem(`projects_${account}`, JSON.stringify(projects));
    }
  }, [projects, account]);

  const handleAddProject = (project) => {
    setProjects((prevProjects) => [...prevProjects, project]);
  };

  return (
    <GrindContext.Provider value={{ grindBalance, account, setAccount, setGrindBalance }}>
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
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;