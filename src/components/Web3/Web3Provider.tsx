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

// Auto-connect component for Web3 wallet browsers
function AutoConnect() {
  useEffect(() => {
    // Check if we're in a Web3 wallet browser
    const isWeb3WalletBrowser = () => {
      return (
        window.ethereum ||
        window.phantom?.ethereum ||
        window.solana ||
        window.tronWeb ||
        window.bitkeep ||
        window.okxwallet ||
        window.trustwallet ||
        window.coinbaseWalletExtension ||
        window.rabby ||
        window.imToken ||
        window.tokenpocket ||
        window.onto ||
        window.bitget ||
        window.bybit ||
        window.gate ||
        window.huobi ||
        window.kucoin ||
        window.binance ||
        window.mexc ||
        window.bitmart ||
        window.coinex ||
        window.ascendex ||
        window.bigone ||
        window.bitforex ||
        window.bitrue ||
        window.btcex ||
        window.btse ||
        window.crypto ||
        window.ftx ||
        window.kraken ||
        window.poloniex ||
        window.probit ||
        window.upbit ||
        window.whitebit ||
        window.xt ||
        window.zb ||
        window.zonda ||
        // Check for MetaMask specifically
        (window.ethereum && window.ethereum.isMetaMask) ||
        // Check for Phantom specifically
        (window.phantom && window.phantom.ethereum) ||
        // Check for Trust Wallet specifically
        (window.ethereum && window.ethereum.isTrust) ||
        // Check for Coinbase Wallet specifically
        (window.ethereum && window.ethereum.isCoinbaseWallet) ||
        // Check for Brave Wallet specifically
        (window.ethereum && window.ethereum.isBraveWallet) ||
        // Check for Opera Wallet specifically
        (window.ethereum && window.ethereum.isOpera) ||
        // Check for Rabby Wallet specifically
        (window.ethereum && window.ethereum.isRabby) ||
        // Check for imToken specifically
        (window.ethereum && window.ethereum.isImToken) ||
        // Check for TokenPocket specifically
        (window.ethereum && window.ethereum.isTokenPocket) ||
        // Check for ONTO Wallet specifically
        (window.ethereum && window.ethereum.isONTO) ||
        // Check for Bitget Wallet specifically
        (window.ethereum && window.ethereum.isBitgetWallet) ||
        // Check for Bybit Wallet specifically
        (window.ethereum && window.ethereum.isBybitWallet) ||
        // Check for Gate Wallet specifically
        (window.ethereum && window.ethereum.isGateWallet) ||
        // Check for Huobi Wallet specifically
        (window.ethereum && window.ethereum.isHuobiWallet) ||
        // Check for KuCoin Wallet specifically
        (window.ethereum && window.ethereum.isKuCoinWallet) ||
        // Check for Binance Wallet specifically
        (window.ethereum && window.ethereum.isBinanceWallet) ||
        // Check for MEXC Wallet specifically
        (window.ethereum && window.ethereum.isMEXCWallet) ||
        // Check for BitMart Wallet specifically
        (window.ethereum && window.ethereum.isBitMartWallet) ||
        // Check for CoinEx Wallet specifically
        (window.ethereum && window.ethereum.isCoinExWallet) ||
        // Check for AscendEX Wallet specifically
        (window.ethereum && window.ethereum.isAscendEXWallet) ||
        // Check for BigONE Wallet specifically
        (window.ethereum && window.ethereum.isBigONEWallet) ||
        // Check for BitForex Wallet specifically
        (window.ethereum && window.ethereum.isBitForexWallet) ||
        // Check for Bitrue Wallet specifically
        (window.ethereum && window.ethereum.isBitrueWallet) ||
        // Check for BTCEX Wallet specifically
        (window.ethereum && window.ethereum.isBTCEXWallet) ||
        // Check for BTSE Wallet specifically
        (window.ethereum && window.ethereum.isBTSEWallet) ||
        // Check for Crypto.com Wallet specifically
        (window.ethereum && window.ethereum.isCryptoComWallet) ||
        // Check for FTX Wallet specifically
        (window.ethereum && window.ethereum.isFTXWallet) ||
        // Check for Kraken Wallet specifically
        (window.ethereum && window.ethereum.isKrakenWallet) ||
        // Check for Poloniex Wallet specifically
        (window.ethereum && window.ethereum.isPoloniexWallet) ||
        // Check for ProBit Wallet specifically
        (window.ethereum && window.ethereum.isProBitWallet) ||
        // Check for Upbit Wallet specifically
        (window.ethereum && window.ethereum.isUpbitWallet) ||
        // Check for WhiteBIT Wallet specifically
        (window.ethereum && window.ethereum.isWhiteBITWallet) ||
        // Check for XT Wallet specifically
        (window.ethereum && window.ethereum.isXTWallet) ||
        // Check for ZB Wallet specifically
        (window.ethereum && window.ethereum.isZBWallet) ||
        // Check for Zonda Wallet specifically
        (window.ethereum && window.ethereum.isZondaWallet)
      );
    };

    // Auto-connect if in Web3 wallet browser
    if (isWeb3WalletBrowser()) {
      console.log('Web3 wallet browser detected, attempting auto-connect...');
      
      // Try to connect automatically
      const connectWallet = async () => {
        try {
          if (window.ethereum) {
            // Request accounts to trigger connection
            const accounts = await window.ethereum.request({ 
              method: 'eth_requestAccounts' 
            });
            console.log('Auto-connected to wallet:', accounts[0]);
          }
        } catch (error) {
          console.log('Auto-connect failed:', error);
        }
      };

      // Small delay to ensure RainbowKit is ready
      setTimeout(connectWallet, 1000);
    }
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
          <AutoConnect />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 