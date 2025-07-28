"use client";
import React, { useEffect, useState } from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { ConnectButton } from '@rainbow-me/rainbowkit';

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
  const { disconnect } = useDisconnect();
  const balance = balanceData ? parseFloat(balanceData.formatted).toFixed(4) : '0.0000';
  const [isMetaMaskMobile, setIsMetaMaskMobile] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    // Check if we're in MetaMask mobile browser
    const checkMetaMaskMobile = () => {
      const isMobile = window.ethereum && window.ethereum.isMetaMask;
      setIsMetaMaskMobile(isMobile);
      console.log('MetaMask mobile detected:', isMobile);
      console.log('Current connection state:', { isConnected, address });
    };

    checkMetaMaskMobile();
  }, [isConnected, address]);

  // Manual MetaMask connection
  const connectMetaMaskDirectly = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed!');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts && accounts.length > 0) {
        console.log('Connected to MetaMask:', accounts[0]);
      }
    } catch (error) {
      console.error('MetaMask connection failed:', error);
      alert('Failed to connect to MetaMask. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect function for mobile
  const handleDisconnect = () => {
    console.log('Disconnect button clicked');
    setIsDisconnecting(true);
    
    try {
      // Use wagmi disconnect
      disconnect();
      console.log('Wagmi disconnect called');
      
    } catch (error) {
      console.error('Disconnect failed:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  console.log('WalletConnect render state:', { 
    isConnected, 
    address, 
    isMetaMaskMobile, 
    isConnecting, 
    isDisconnecting
  });

  return (
    <div className="wallet-connect-ocean">
      <div className="wallet-connect-unified">
        {isMetaMaskMobile ? (
          // MetaMask mobile handling
          isConnected ? (
            // Connected state for mobile - show disconnect option
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Connected info display */}
              <div className="connected-info">
                <span className="hl-logo"><HyperliquidLogo /></span>
                <span className="eth-balance">{balance}</span>
                <span className="testnet-label">Testnet ETH</span>
                <span className="account-label">
                  {address ? formatAddress(address) : 'Wallet'}
                </span>
              </div>
              {/* Disconnect button */}
              <button
                className="disconnect-btn"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                style={{
                  minHeight: '36px',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          ) : (
            // Disconnected state for mobile
            <button
              className="unified-btn"
              onClick={connectMetaMaskDirectly}
              disabled={isConnecting}
              style={{
                minHeight: '44px',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span className="hl-logo"><HyperliquidLogo /></span>
              <span className="connect-label">
                {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
              </span>
            </button>
          )
        ) : (
          // RainbowKit connection for desktop/other wallets
          <ConnectButton.Custom>
            {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;

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
                    <span className="connect-label">Connect Wallet</span>
                  )}
                </button>
              );
            }}
          </ConnectButton.Custom>
        )}
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
        .connected-info {
          display: flex;
          align-items: center;
          gap: 7px;
          background: linear-gradient(135deg, rgba(94,231,183,0.95), rgba(178,251,224,0.95));
          border: 2.5px solid #5ee7b7;
          border-radius: 22px;
          padding: 8px 16px;
          color: #222;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 6px 32px 0 rgba(94,231,183,0.20), 0 1.5px 8px 0 rgba(33,118,174,0.10);
          backdrop-filter: blur(10px) saturate(1.1);
          min-width: 120px;
          justify-content: flex-start;
          animation: connectedGlow 2s ease-in-out infinite;
        }
        .disconnect-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          background: linear-gradient(135deg, rgba(255,107,107,0.85), rgba(239,68,68,0.85));
          border: 2px solid #fecaca;
          border-radius: 18px;
          padding: 6px 12px;
          color: #222;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 3px 14px 0 rgba(239,68,68,0.13), 0 1px 4px 0 rgba(33,118,174,0.10);
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          backdrop-filter: blur(10px) saturate(1.1);
          position: relative;
          overflow: hidden;
          min-width: 100px;
          font-family: inherit;
          user-select: none;
          outline: none;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .disconnect-btn:hover {
          background: linear-gradient(135deg, rgba(255,107,107,0.97), rgba(239,68,68,0.97));
          border: 2.5px solid #ef4444;
          box-shadow: 0 0 0 4px #fecaca55, 0 8px 32px #ef4444cc;
        }
        .disconnect-btn:active {
          transform: scale(0.95);
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
        @keyframes connectedGlow {
          0%, 100% {
            box-shadow: 0 6px 32px 0 rgba(94,231,183,0.20), 0 1.5px 8px 0 rgba(33,118,174,0.10);
          }
          50% {
            box-shadow: 0 12px 36px 0 rgba(94,231,183,0.30), 0 1.5px 8px 0 rgba(33,118,174,0.13);
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
          .unified-btn, .connected-info {
            padding: 10px 14px;
            font-size: 13px;
            min-width: 100px;
            min-height: 44px;
            border-radius: 20px;
          }
          .disconnect-btn {
            padding: 8px 12px;
            font-size: 12px;
            min-width: 90px;
            min-height: 36px;
            border-radius: 16px;
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
          .unified-btn, .connected-info {
            padding: 8px 12px;
            font-size: 12px;
            min-width: 90px;
            min-height: 40px;
          }
          .disconnect-btn {
            padding: 6px 10px;
            font-size: 11px;
            min-width: 80px;
            min-height: 32px;
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
          .unified-btn:hover, .disconnect-btn:hover {
            transform: none;
          }
          .unified-btn:active, .disconnect-btn:active {
            transform: scale(0.95);
            transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
          }
        }
      `}</style>
    </div>
  );
} 