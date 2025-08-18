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
        console.log("🔧 Web3Provider: Starting initialization...");
        const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;
        
        if (!clientId) {
          console.warn("❌ Web3Auth client ID not provided, wallet connection disabled");
          setIsLoading(false);
          return;
        }
        
        console.log("✅ Web3Auth client ID found:", clientId.substring(0, 20) + "...");
        
        console.log("🔧 Creating Web3Auth instance with config:", {
          clientId: clientId.substring(0, 20) + "...",
          network: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          chainConfig
        });
        
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
        console.log("🔧 Configuring MetaMask adapter...");
        const metamaskAdapter = new MetamaskAdapter({
          clientId,
          sessionTime: 3600, // 1 hour in seconds
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          chainConfig,
        });
        web3authInstance.configureAdapter(metamaskAdapter);
        console.log("✅ MetaMask adapter configured");

        // Configure WalletConnect adapter
        const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
        
        if (walletConnectProjectId) {
          console.log("🔧 Configuring WalletConnect adapter with project ID:", walletConnectProjectId);
          
          const walletConnectV2Adapter = new WalletConnectV2Adapter({
            clientId,
            sessionTime: 3600, // 1 hour in seconds
            web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
            chainConfig,
            adapterSettings: {
              walletConnectInitOptions: {
                projectId: walletConnectProjectId,
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
          console.log("✅ WalletConnect adapter configured");
        } else {
          console.warn("⚠️ WalletConnect project ID not provided, skipping WalletConnect adapter");
        }

        console.log("🔧 Initializing Web3Auth modal...");
        await web3authInstance.initModal();
        console.log("✅ Web3Auth modal initialized");
        setWeb3auth(web3authInstance);

        if (web3authInstance.connected) {
          console.log("🔗 Existing Web3Auth connection found, reconnecting...");
          const web3authProvider = web3authInstance.provider;
          if (web3authProvider) {
            await handleConnection(web3authProvider);
          }
        } else {
          console.log("ℹ️ No existing Web3Auth connection found");
        }
      } catch (error) {
        console.error("❌ Web3Auth initialization failed:", error);
        console.error("Error details:", error instanceof Error ? error.stack : error);
      } finally {
        setIsLoading(false);
        console.log("✅ Web3Provider initialization completed");
      }
    };

    init();
  }, []);

  const handleConnection = async (web3authProvider: IProvider) => {
    try {
      console.log("🔗 Handling wallet connection...");
      setProvider(web3authProvider);
      const web3Instance = new Web3(web3authProvider as any);
      setWeb3(web3Instance);

      console.log("🔧 Getting accounts from provider...");
      const accounts = await web3Instance.eth.getAccounts();
      console.log("📋 Accounts found:", accounts);
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        console.log("✅ Wallet connected successfully:", accounts[0]);
      } else {
        console.warn("⚠️ No accounts found in wallet");
      }
    } catch (error) {
      console.error("❌ Connection handling failed:", error);
      console.error("Error details:", error instanceof Error ? error.stack : error);
    }
  };

  const login = async () => {
    console.log("🚀 Starting social login process...");
    if (!web3auth) {
      console.error("❌ Web3Auth not initialized");
      alert("Wallet connection is disabled. Please configure Web3Auth client ID in environment variables.");
      return;
    }

    try {
      setIsLoading(true);
      console.log("🔧 Attempting Web3Auth connection...");
      const web3authProvider = await web3auth.connect();
      console.log("🔗 Web3Auth connect result:", web3authProvider ? "Success" : "Failed");
      
      if (web3authProvider) {
        await handleConnection(web3authProvider);
      } else {
        console.warn("⚠️ Web3Auth returned no provider");
      }
    } catch (error) {
      console.error("❌ Social login failed:", error);
      console.error("Error details:", error instanceof Error ? error.stack : error);
      alert("Failed to connect wallet: " + (error instanceof Error ? error.message : error));
    } finally {
      setIsLoading(false);
      console.log("🏁 Social login process completed");
    }
  };

  const loginWithWallet = async () => {
    console.log("🚀 Starting direct wallet connection...");
    try {
      setIsLoading(true);
      
      // Check if MetaMask is available
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;
        
        // Check if it's actually MetaMask
        if (ethereum.isMetaMask) {
          console.log("✅ MetaMask detected (verified)");
        } else {
          console.log("⚠️ Ethereum provider detected but not verified as MetaMask");
        }
        
        console.log("🔧 Provider details:", {
          isMetaMask: ethereum.isMetaMask,
          chainId: ethereum.chainId,
          networkVersion: ethereum.networkVersion,
          selectedAddress: ethereum.selectedAddress
        });
        
        // Check if MetaMask is unlocked by checking if there are already accounts
        let existingAccounts;
        try {
          existingAccounts = await ethereum.request({ method: 'eth_accounts' });
          console.log("🔍 Existing accounts:", existingAccounts);
        } catch (error) {
          console.log("⚠️ Could not check existing accounts:", error);
        }
        
        console.log("🔧 Requesting account access...");
        
        // Request account access
        let accounts;
        try {
          accounts = await ethereum.request({ method: 'eth_requestAccounts' });
          console.log("📋 Accounts received:", accounts);
        } catch (requestError: any) {
          console.error("❌ eth_requestAccounts failed:", requestError);
          console.error("Error code:", requestError.code);
          console.error("Error message:", requestError.message);
          
          if (requestError.code === 4001) {
            throw new Error("User rejected the connection request");
          } else if (requestError.code === -32002) {
            throw new Error("Connection request is already pending. Please check MetaMask.");
          } else {
            throw new Error(`MetaMask connection failed: ${requestError.message || 'Unknown error'}`);
          }
        }
        
        if (accounts.length > 0) {
          console.log("🔧 Checking current chain...");
          const currentChain = await ethereum.request({ method: 'eth_chainId' });
          console.log("⛓️ Current chain ID:", currentChain, "Target:", chainConfig.chainId);
          
          // Switch to 0G Chain if not already connected
          if (currentChain !== chainConfig.chainId) {
            console.log("🔄 Switching to 0G Chain...");
            try {
              await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainConfig.chainId }],
              });
              console.log("✅ Chain switched successfully");
            } catch (switchError: any) {
              console.log("⚠️ Chain switch failed:", switchError);
              // Chain not added, add it
              if (switchError.code === 4902) {
                console.log("🔧 Adding 0G Chain to wallet...");
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
                console.log("✅ 0G Chain added successfully");
              } else {
                throw switchError;
              }
            }
          } else {
            console.log("✅ Already on correct chain");
          }
          
          // Create Web3 instance with MetaMask provider
          console.log("🔧 Creating Web3 instance...");
          const web3Instance = new Web3(ethereum);
          setWeb3(web3Instance);
          setProvider(ethereum);
          setAddress(accounts[0]);
          setIsConnected(true);
          setIsDirectWallet(true);
          console.log("✅ Direct wallet connection successful:", accounts[0]);
        } else {
          console.warn("⚠️ No accounts returned from wallet");
        }
      } else {
        console.error("❌ MetaMask not detected");
        alert("MetaMask is not installed. Please install MetaMask or use social login instead.");
      }
    } catch (error) {
      console.error("❌ Direct wallet connection failed:", error);
      console.error("Error details:", error instanceof Error ? error.stack : error);
      alert("Failed to connect wallet: " + (error instanceof Error ? error.message : error));
    } finally {
      setIsLoading(false);
      console.log("🏁 Direct wallet connection process completed");
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