"use client";
import React, { useEffect } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const projectId = 'c4f79cc821944d9680842e34466bfbd9';

const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Simple MetaMask mobile detection and auto-connect
function MetaMaskAutoConnect() {
  useEffect(() => {
    const detectAndConnect = async () => {
      // Check if we're in MetaMask mobile browser
      const isMetaMaskMobile = window.ethereum && window.ethereum.isMetaMask;
      
      if (isMetaMaskMobile) {
        console.log('MetaMask mobile detected, attempting connection...');
        
        try {
          // Request accounts to trigger connection
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          });
          
          if (accounts && accounts.length > 0) {
            console.log('Successfully connected to MetaMask:', accounts[0]);
          }
        } catch (error) {
          console.log('MetaMask connection failed:', error);
        }
      }
    };

    // Wait a bit for everything to load
    setTimeout(detectAndConnect, 2000);
  }, []);

  return null;
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={sepolia}
          showRecentTransactions={false}
          modalSize="compact"
        >
          <MetaMaskAutoConnect />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 