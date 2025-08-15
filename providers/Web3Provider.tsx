"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Web3Auth } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import Web3 from "web3";

// 0G Testnet configuration
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x278", // 632 in decimal
  rpcTarget: "https://evmrpc-testnet.0g.ai",
  displayName: "0G Chain Testnet",
  blockExplorerUrl: "https://chainscan-newton.0g.ai",
  ticker: "A0GI",
  tickerName: "0G Chain",
  logo: "/alpaca/happy.svg",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

interface Web3ContextType {
  web3auth: Web3Auth | null;
  provider: IProvider | null;
  web3: Web3 | null;
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getUserInfo: () => Promise<any>;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Check if we have a valid client ID from environment
        const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;
        
        if (!clientId) {
          console.warn("Web3Auth client ID not provided, wallet connection disabled");
          setIsLoading(false);
          return;
        }
        
        const web3authInstance = new Web3Auth({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider,
          uiConfig: {
            appName: "Alpaca Trading Pal",
            logoLight: "/alpaca/happy.svg",
            logoDark: "/alpaca/happy.svg",
            defaultLanguage: "en",
            mode: "light",
            theme: {
              primary: "#f59e0b",
            },
          },
        });

        await web3authInstance.initModal();
        setWeb3auth(web3authInstance);

        // Check if already connected
        if (web3authInstance.connected) {
          const web3authProvider = web3authInstance.provider;
          if (web3authProvider) {
            await handleConnection(web3authProvider);
          }
        }
      } catch (error) {
        console.warn("Web3Auth initialization failed, wallet connection disabled:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handleConnection = async (web3authProvider: IProvider) => {
    try {
      setProvider(web3authProvider);
      const web3Instance = new Web3(web3authProvider as any);
      setWeb3(web3Instance);

      const accounts = await web3Instance.eth.getAccounts();
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Connection handling failed:", error);
    }
  };

  const login = async () => {
    if (!web3auth) {
      alert("Wallet connection is disabled. Please configure Web3Auth client ID in environment variables.");
      return;
    }

    try {
      setIsLoading(true);
      const web3authProvider = await web3auth.connect();
      if (web3authProvider) {
        await handleConnection(web3authProvider);
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Failed to connect wallet: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!web3auth) {
      console.error("Web3Auth not initialized");
      return;
    }

    try {
      setIsLoading(true);
      await web3auth.logout();
      setProvider(null);
      setWeb3(null);
      setAddress(null);
      setIsConnected(false);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      console.error("Web3Auth not initialized");
      return null;
    }

    try {
      const userInfo = await web3auth.getUserInfo();
      return userInfo;
    } catch (error) {
      console.error("Get user info failed:", error);
      return null;
    }
  };

  const value: Web3ContextType = {
    web3auth,
    provider,
    web3,
    address,
    isConnected,
    isLoading,
    login,
    logout,
    getUserInfo,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}