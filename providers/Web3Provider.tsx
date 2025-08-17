"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Web3Auth } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { WalletConnectV2Adapter } from "@web3auth/wallet-connect-v2-adapter";
import Web3 from "web3";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x40D9",
  rpcTarget: "https://rpc.ankr.com/0g_galileo_testnet_evm",
  displayName: "0G-Galileo-Testnet",
  blockExplorerUrl: "https://chainscan-galileo.0g.ai",
  ticker: "OG",
  tickerName: "0G Token",
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
  loginWithWallet: () => Promise<void>;
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
  const [isDirectWallet, setIsDirectWallet] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
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

        // Configure MetaMask adapter
        const metamaskAdapter = new MetamaskAdapter({
          clientId,
          sessionTime: 3600, // 1 hour in seconds
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          chainConfig,
        });
        web3authInstance.configureAdapter(metamaskAdapter);

        // Configure WalletConnect adapter
        const walletConnectV2Adapter = new WalletConnectV2Adapter({
          clientId,
          sessionTime: 3600, // 1 hour in seconds
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          chainConfig,
          adapterSettings: {
            walletConnectInitOptions: {
              projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "0x4f26ffbe5f04ed43630fdc30c05b1ace",
              metadata: {
                name: "Alpaca Trading Pal",
                description: "Your AI-powered trading companion on 0G Chain",
                url: "https://alpaca-trading-pal.com",
                icons: ["/alpaca/happy.svg"],
              },
            },
          },
        });
        web3authInstance.configureAdapter(walletConnectV2Adapter);

        await web3authInstance.initModal();
        setWeb3auth(web3authInstance);

        if (web3authInstance.connected) {
          const web3authProvider = web3authInstance.provider;
          if (web3authProvider) {
            await handleConnection(web3authProvider);
          }
        }
      } catch (error) {
        console.warn("Web3Auth initialization failed, wallet connection disabled:", error instanceof Error ? error.message : error);
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
      alert("Failed to connect wallet: " + (error instanceof Error ? error.message : error));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithWallet = async () => {
    try {
      setIsLoading(true);
      
      // Check if MetaMask is available
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;
        
        // Request account access
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts.length > 0) {
          // Switch to 0G Chain if not already connected
          try {
            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: chainConfig.chainId }],
            });
          } catch (switchError: any) {
            // Chain not added, add it
            if (switchError.code === 4902) {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: chainConfig.chainId,
                  chainName: chainConfig.displayName,
                  nativeCurrency: {
                    name: chainConfig.tickerName,
                    symbol: chainConfig.ticker,
                    decimals: 18,
                  },
                  rpcUrls: [chainConfig.rpcTarget],
                  blockExplorerUrls: [chainConfig.blockExplorerUrl],
                }],
              });
            }
          }
          
          // Create Web3 instance with MetaMask provider
          const web3Instance = new Web3(ethereum);
          setWeb3(web3Instance);
          setProvider(ethereum);
          setAddress(accounts[0]);
          setIsConnected(true);
          setIsDirectWallet(true);
        }
      } else {
        alert("MetaMask is not installed. Please install MetaMask or use social login instead.");
      }
    } catch (error) {
      console.error("Direct wallet connection failed:", error);
      alert("Failed to connect wallet: " + (error instanceof Error ? error.message : error));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      if (isDirectWallet) {
        // For direct wallet connections, just clear state
        setProvider(null);
        setWeb3(null);
        setAddress(null);
        setIsConnected(false);
        setIsDirectWallet(false);
      } else if (web3auth) {
        // For Web3Auth connections, use proper logout
        await web3auth.logout();
        setProvider(null);
        setWeb3(null);
        setAddress(null);
        setIsConnected(false);
      } else {
        console.error("No connection method available for logout");
      }
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
    loginWithWallet,
    logout,
    getUserInfo,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}