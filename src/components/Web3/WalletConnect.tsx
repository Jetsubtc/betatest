"use client";
import React, { useEffect, useState } from 'react';
import { useAccount, useBalance, useConnect } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Type declarations for wallet browsers
declare global {
  interface Window {
    ethereum?: any;
    phantom?: {
      ethereum?: any;
    };
    solana?: any;
    tronWeb?: any;
    bitkeep?: any;
    okxwallet?: any;
    trustwallet?: any;
    coinbaseWalletExtension?: any;
    rabby?: any;
    imToken?: any;
    tokenpocket?: any;
    onto?: any;
    bitget?: any;
    bybit?: any;
    gate?: any;
    huobi?: any;
    kucoin?: any;
    binance?: any;
    mexc?: any;
    bitmart?: any;
    coinex?: any;
    ascendex?: any;
    bigone?: any;
    bitforex?: any;
    bitrue?: any;
    btcex?: any;
    btse?: any;
    crypto?: any;
    ftx?: any;
    kraken?: any;
    poloniex?: any;
    probit?: any;
    upbit?: any;
    whitebit?: any;
    xt?: any;
    zb?: any;
    zonda?: any;
  }
}

// Hyperliquid logo SVG (inline, with subtle colors)
const HyperliquidLogo = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#hlglow)">
      <circle cx="16" cy="16" r="14" fill="#183c4a" stroke="#2bb3b1" strokeWidth="2.5"/>
      <path d="M10.5 21.5C12.5 19 19.5 19 21.5 21.5" stroke="#2bb3b1" strokeWidth="2.2" strokeLinecap="round"/>
      <ellipse cx="16" cy="13" rx="5.5" ry="3.5" fill="#fff" stroke="#2bb3b1" strokeWidth="2"/>
      <circle cx="13.5" cy="13" r="1.2" fill="#2bb3b1"/>
      <circle cx="18.5" cy="13" r="1.2" fill="#2bb3b1"/>
    </g>
    <defs>
      <filter id="hlglow" x="0" y="0" width="32" height="32" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#2bb3b1" floodOpacity="0.35"/>
      </filter>
    </defs>
  </svg>
);

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address, chainId: sepolia.id });
  const balance = balanceData ? parseFloat(balanceData.formatted).toFixed(4) : '0.0000';
  const [isWeb3WalletBrowser, setIsWeb3WalletBrowser] = useState(false);
  const [autoConnecting, setAutoConnecting] = useState(false);

  useEffect(() => {
    // Detect Web3 wallet browser
    const detectWeb3WalletBrowser = () => {
      const isWalletBrowser = (
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
        // Check for specific wallet indicators
        (window.ethereum && window.ethereum.isMetaMask) ||
        (window.phantom && window.phantom.ethereum) ||
        (window.ethereum && window.ethereum.isTrust) ||
        (window.ethereum && window.ethereum.isCoinbaseWallet) ||
        (window.ethereum && window.ethereum.isBraveWallet) ||
        (window.ethereum && window.ethereum.isOpera) ||
        (window.ethereum && window.ethereum.isRabby) ||
        (window.ethereum && window.ethereum.isImToken) ||
        (window.ethereum && window.ethereum.isTokenPocket) ||
        (window.ethereum && window.ethereum.isONTO) ||
        (window.ethereum && window.ethereum.isBitgetWallet) ||
        (window.ethereum && window.ethereum.isBybitWallet) ||
        (window.ethereum && window.ethereum.isGateWallet) ||
        (window.ethereum && window.ethereum.isHuobiWallet) ||
        (window.ethereum && window.ethereum.isKuCoinWallet) ||
        (window.ethereum && window.ethereum.isBinanceWallet) ||
        (window.ethereum && window.ethereum.isMEXCWallet) ||
        (window.ethereum && window.ethereum.isBitMartWallet) ||
        (window.ethereum && window.ethereum.isCoinExWallet) ||
        (window.ethereum && window.ethereum.isAscendEXWallet) ||
        (window.ethereum && window.ethereum.isBigONEWallet) ||
        (window.ethereum && window.ethereum.isBitForexWallet) ||
        (window.ethereum && window.ethereum.isBitrueWallet) ||
        (window.ethereum && window.ethereum.isBTCEXWallet) ||
        (window.ethereum && window.ethereum.isBTSEWallet) ||
        (window.ethereum && window.ethereum.isCryptoComWallet) ||
        (window.ethereum && window.ethereum.isFTXWallet) ||
        (window.ethereum && window.ethereum.isKrakenWallet) ||
        (window.ethereum && window.ethereum.isPoloniexWallet) ||
        (window.ethereum && window.ethereum.isProBitWallet) ||
        (window.ethereum && window.ethereum.isUpbitWallet) ||
        (window.ethereum && window.ethereum.isWhiteBITWallet) ||
        (window.ethereum && window.ethereum.isXTWallet) ||
        (window.ethereum && window.ethereum.isZBWallet) ||
        (window.ethereum && window.ethereum.isZondaWallet)
      );

      setIsWeb3WalletBrowser(isWalletBrowser);
      
      if (isWalletBrowser && !isConnected && !autoConnecting) {
        setAutoConnecting(true);
        console.log('Web3 wallet browser detected, attempting auto-connect...');
        
        // Auto-connect to the detected wallet
        const autoConnect = async () => {
          try {
            if (window.ethereum) {
              const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
              });
              console.log('Auto-connected to wallet:', accounts[0]);
            }
          } catch (error) {
            console.log('Auto-connect failed:', error);
          } finally {
            setAutoConnecting(false);
          }
        };

        // Delay to ensure RainbowKit is ready
        setTimeout(autoConnect, 1500);
      }
    };

    detectWeb3WalletBrowser();
  }, [isConnected, autoConnecting]);

  return (
    <div className="wallet-connect-ocean">
      <div className="wallet-connect-unified">
        <ConnectButton.Custom>
          {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
            const ready = mounted;
            const connected = ready && account && chain;
            
            // Show connecting state for Web3 wallet browsers
            if (isWeb3WalletBrowser && autoConnecting && !connected) {
              return (
                <button
                  className="unified-btn connecting"
                  disabled={true}
                  style={{
                    minHeight: '44px',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span className="hl-logo"><HyperliquidLogo /></span>
                  <span className="connect-label">Connecting...</span>
                </button>
              );
            }

            return (
              <button
                className="unified-btn"
                onClick={connected ? openAccountModal : openConnectModal}
                type="button"
                disabled={!ready}
                style={{
                  minHeight: '44px',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span className="hl-logo"><HyperliquidLogo /></span>
                {connected ? (
                  <>
                    <span className="eth-balance">{balance}</span>
                    <span className="testnet-label">Testnet ETH</span>
                    <span className="account-label">{account.displayName}</span>
                  </>
                ) : (
                  <span className="connect-label">
                    {isWeb3WalletBrowser ? 'Connect' : 'Connect Wallet'}
                  </span>
                )}
              </button>
            );
          }}
        </ConnectButton.Custom>
      </div>
      <style jsx>{`
        .wallet-connect-ocean {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          min-width: 0;
          height: auto;
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          pointer-events: none;
        }
        .wallet-connect-unified {
          position: relative;
          z-index: 1;
          min-width: 0;
          width: auto;
          pointer-events: auto;
        }
        .unified-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          background: linear-gradient(135deg, rgba(178,251,224,0.85), rgba(94,231,183,0.85));
          border: 2px solid #b2fbe0;
          border-radius: 22px;
          padding: 8px 16px;
          color: #222;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 3px 14px 0 rgba(94,231,183,0.13), 0 1px 4px 0 rgba(33,118,174,0.10);
          transition: box-shadow 0.25s cubic-bezier(0.4,0,0.2,1), background 0.25s, border 0.25s, transform 0.18s;
          animation: float 3s ease-in-out infinite;
          backdrop-filter: blur(10px) saturate(1.1);
          position: relative;
          overflow: hidden;
          min-width: 120px;
          justify-content: flex-start;
          font-family: inherit;
          user-select: none;
          outline: none;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .unified-btn.connecting {
          animation: connectingPulse 1.5s ease-in-out infinite;
          opacity: 0.8;
        }
        @keyframes connectingPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .unified-btn:before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(178,251,224,0.18), transparent);
          transition: left 0.5s;
        }
        .unified-btn:hover:before {
          left: 100%;
        }
        .unified-btn:hover, .unified-btn:focus {
          box-shadow: 0 0 0 4px #b2fbe055, 0 8px 32px #b2fbe0cc, 0 1.5px 8px 0 rgba(33,118,174,0.10);
          background: linear-gradient(135deg, rgba(178,251,224,0.97), rgba(94,231,183,0.97));
          border: 2.5px solid #5ee7b7;
          outline: 2px solid #5ee7b7;
        }
        .unified-btn:active {
          transform: translateY(0) scale(0.98);
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
            box-shadow: 0 6px 32px 0 rgba(94,231,183,0.13), 0 1.5px 8px 0 rgba(33,118,174,0.10);
          }
          50% {
            transform: translateY(-5px);
            box-shadow: 0 12px 36px 0 rgba(94,231,183,0.18), 0 1.5px 8px 0 rgba(33,118,174,0.13);
          }
        }
        .hl-logo {
          display: flex;
          align-items: center;
          animation: hlGlow 2s ease-in-out infinite alternate;
          filter: drop-shadow(0 0 4px #b2fbe055);
          transition: filter 0.25s;
        }
        .unified-btn:hover .hl-logo, .unified-btn:focus .hl-logo {
          filter: drop-shadow(0 0 10px #5ee7b7cc);
        }
        @keyframes hlGlow {
          0% {
            filter: drop-shadow(0 0 4px #b2fbe055);
            transform: scale(1);
          }
          100% {
            filter: drop-shadow(0 0 10px #5ee7b7cc);
            transform: scale(1.08);
          }
        }
        .eth-balance {
          font-size: 13px;
          font-weight: 700;
          color: #222;
          margin-right: 2px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.10);
          background: rgba(255,255,255,0.45);
          border-radius: 8px;
          padding: 1.5px 7px;
          margin-left: 1px;
        }
        .testnet-label {
          font-size: 12px;
          font-weight: 700;
          border-radius: 999px;
          padding: 2.5px 10px;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(33,118,174,0.10);
          border: 1.5px solid #b3d8fd;
          user-select: none;
          margin-right: 1px;
          margin-left: 1px;
          display: inline-block;
        }
        .account-label {
          font-size: 13px;
          font-weight: 600;
          color: #222;
          margin-left: 6px;
          opacity: 0.85;
          background: rgba(255,255,255,0.32);
          border-radius: 7px;
          padding: 1.5px 7px;
        }
        .connect-label {
          font-size: 14px;
          font-weight: 700;
          color: #222;
          margin-left: 6px;
          letter-spacing: 0.5px;
        }
        .unified-btn:focus-visible {
          outline: 2.5px solid #5ee7b7;
          outline-offset: 2px;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .wallet-connect-ocean {
            right: 12px;
            top: 12px;
          }
          .unified-btn {
            padding: 10px 14px;
            font-size: 13px;
            min-width: 100px;
            min-height: 44px;
            border-radius: 20px;
          }
          .hl-logo {
            width: 22px;
            height: 22px;
          }
          .eth-balance {
            font-size: 12px;
            padding: 1px 6px;
          }
          .testnet-label {
            font-size: 11px;
            padding: 2px 8px;
          }
          .account-label {
            font-size: 12px;
            padding: 1px 6px;
          }
          .connect-label {
            font-size: 13px;
          }
        }
        
        @media (max-width: 480px) {
          .wallet-connect-ocean {
            right: 8px;
            top: 8px;
          }
          .unified-btn {
            padding: 8px 12px;
            font-size: 12px;
            min-width: 90px;
            min-height: 40px;
          }
          .hl-logo {
            width: 20px;
            height: 20px;
          }
          .eth-balance {
            font-size: 11px;
            padding: 1px 5px;
          }
          .testnet-label {
            font-size: 10px;
            padding: 1.5px 6px;
          }
          .account-label {
            font-size: 11px;
            padding: 1px 5px;
          }
          .connect-label {
            font-size: 12px;
          }
        }
        
        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          .unified-btn:hover {
            transform: none;
            box-shadow: 0 3px 14px 0 rgba(94,231,183,0.13), 0 1px 4px 0 rgba(33,118,174,0.10);
          }
          .unified-btn:active {
            transform: scale(0.95);
            transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
          }
        }
      `}</style>
    </div>
  );
} 