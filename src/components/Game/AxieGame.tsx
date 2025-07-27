"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAccount, useWriteContract, useBalance } from "wagmi";
import { sepolia } from "wagmi/chains";
import { parseEther, formatEther } from "viem";
import confetti from "canvas-confetti";

import './AxieGame.css'; // Add this import at the top if not present

// Helper for local leaderboard/history
const getLocalStats = () => {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('axieGameStats') || '{"games":[],"leaderboard":[]}');
  }
  return {"games":[],"leaderboard":[]};
};
const saveLocalStats = (stats: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('axieGameStats', JSON.stringify(stats));
  }
};

// Generate random wallet addresses for leaderboard
const generateRandomAddress = () => {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

// Different game configurations
const gameConfigs = [
  { name: "Classic", blocks: [6,5,4,3,4,5,6,5,4,3,4,5,6,5,4,3,4,5,6,5,4,3,4,5,6] },
  { name: "Easy", blocks: [4,3,2,3,4,3,2,3,4,3,2,3,4,3,2,3,4,3,2,3,4,3,2,3,4] },
  { name: "Hard", blocks: [8,7,6,5,6,7,8,7,6,5,6,7,8,7,6,5,6,7,8,7,6,5,6,7,8] },
  { name: "Random", blocks: [5,4,6,3,7,4,5,6,3,4,5,6,4,3,5,6,4,5,3,6,4,5,6,3,5] }
];

const multipliers = [
  1.10, 1.32, 1.59, 1.91, 2.29, 2.74, 3.28, 3.93, 4.71, 5.65,
  6.78, 8.14, 9.77, 11.72, 14.06, 16.87, 20.24, 24.29, 29.15,
  34.98, 41.97, 50.36, 60.43, 72.52, 380.00
];

function getRandomBombs(blocks: number[]) {
  return blocks.map(n => Math.floor(Math.random() * n));
}

export default function AxieGame() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [gameActive, setGameActive] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0); // 0 = bottom
  const [bombIndexes, setBombIndexes] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<{[level: number]: number | null}>({});
  const [lost, setLost] = useState(false);
  const [won, setWon] = useState(false);
  const [canCashOut, setCanCashOut] = useState(false);
  const { address, isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const [isCashingOut, setIsCashingOut] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLoseModal, setShowLoseModal] = useState(false);

  const [autoCash, setAutoCash] = useState<number | null>(null);
  const [stats, setStats] = useState(() => {
    // Clear existing leaderboard to show new random addresses
    const existingStats = getLocalStats();
    if (existingStats.leaderboard && existingStats.leaderboard.length > 0) {
      // Clear leaderboard to show new random addresses
      existingStats.leaderboard = [];
      saveLocalStats(existingStats);
    }
    
    // Add some sample leaderboard entries with random addresses
    if (!existingStats.leaderboard || existingStats.leaderboard.length === 0) {
      existingStats.leaderboard = [
        { address: generateRandomAddress(), multiplier: 15.87, date: Date.now() - 86400000 },
        { address: generateRandomAddress(), multiplier: 12.45, date: Date.now() - 172800000 },
        { address: generateRandomAddress(), multiplier: 8.92, date: Date.now() - 259200000 },
        { address: generateRandomAddress(), multiplier: 6.78, date: Date.now() - 345600000 },
        { address: generateRandomAddress(), multiplier: 4.71, date: Date.now() - 432000000 }
      ];
      saveLocalStats(existingStats);
    }
    
    return existingStats;
  });
  const [mute, setMute] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('axieGameMute');
      // Default to unmuted (false) if no setting is saved
      return savedMute === '1';
    }
    return false; // Default to unmuted
  });
  const [statusKey, setStatusKey] = useState(0);
  const [selectedConfig, setSelectedConfig] = useState(0);
  const [layoutBlocks, setLayoutBlocks] = useState(gameConfigs[0].blocks);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const autoRestartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debug effect to check mute state
  useEffect(() => {
    console.log('Mute state:', mute);
  }, [mute]);

  // Auto-restart timer effect
  useEffect(() => {
    const resetTimer = () => {
      if (autoRestartTimeoutRef.current) {
        clearTimeout(autoRestartTimeoutRef.current);
      }
      
      // Only start timer if game is not active and there are revealed blocks
      const hasRevealedBlocks = Object.keys(revealed).length > 0;
      if (!gameActive && hasRevealedBlocks && !lost && !won) {
        autoRestartTimeoutRef.current = setTimeout(() => {
          handleRestart();
        }, 15000); // 15 seconds
      }
    };

    resetTimer();

    return () => {
      if (autoRestartTimeoutRef.current) {
        clearTimeout(autoRestartTimeoutRef.current);
      }
    };
  }, [lastActivityTime, gameActive, revealed, lost, won]);

  // Update activity time on any user interaction
  const updateActivity = () => {
    setLastActivityTime(Date.now());
  };

  // Update layout blocks when config changes
  React.useEffect(() => {
    setLayoutBlocks(gameConfigs[selectedConfig].blocks);
  }, [selectedConfig]);

  // Function to shuffle game configuration
  const handleShuffle = () => {
    updateActivity();
    if (!gameActive) {
      const randomConfig = Math.floor(Math.random() * gameConfigs.length);
      setSelectedConfig(randomConfig);
      setLayoutBlocks(gameConfigs[randomConfig].blocks);
      setRevealed({}); // Reset revealed blocks to hide winning blocks
      setStatus(`Shuffled to ${gameConfigs[randomConfig].name} mode!`);
      setTimeout(() => setStatus(""), 2000);
    }
  };

  // Mute toggle handler
  const handleMuteToggle = () => {
    setMute(m => {
      localStorage.setItem('axieGameMute', m ? '0' : '1');
      return !m;
    });
  };

  // Only play sounds if not muted
  const playSound = (ref: React.RefObject<HTMLAudioElement>) => {
    if (!mute && ref.current) {
      try {
        // Reset audio to beginning and play
        ref.current.currentTime = 0;
        ref.current.play().catch(error => {
          console.log('Audio play failed:', error);
        });
      } catch (error) {
        console.log('Sound play error:', error);
      }
    }
  };

  // Check Sepolia ETH balance
  const { data: balanceData } = useBalance({ address, chainId: sepolia.id });
  const hasEnoughSepolia = balanceData && balanceData.value && balanceData.value >= parseEther("0.001");

  // Sound refs
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const loseSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);

  // Render layers in original order (level 1 at the bottom)
  const layers = layoutBlocks.map((blockCount, i) => ({ blockCount, multiplier: multipliers[i], idx: i }));
  // Refs for each layer for smooth scroll
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll to the bottom (level 1) on mount
  React.useEffect(() => {
    setTimeout(() => {
      const bottomLayer = layerRefs.current[0];
      if (bottomLayer) {
        bottomLayer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100); // slight delay to ensure DOM is ready
  }, []);

  const handleBet = () => {
    updateActivity();
    if (!isConnected) {
      setStatus("Please connect your wallet first.");
      return;
    }
    if (!hasEnoughSepolia) {
      setStatus("You need at least 0.001 Sepolia ETH to play.");
      return;
    }
    
    setBombIndexes(getRandomBombs(layoutBlocks));
    setGameActive(true);
    setCurrentLevel(0);
    setRevealed({});
    setLost(false);
    setWon(false);
    setStatus(`Game started at ${multipliers[0]?.toFixed(2)}x!`);
    setTimeout(() => setStatus(""), 2000);
    setCanCashOut(false);
  };

  const handleBlockClick = (level: number, blockIdx: number) => {
    updateActivity();
    if (!gameActive || lost || won) return;
    if (level !== currentLevel) return;
    if (revealed[level] !== undefined) return;
    const bomb = bombIndexes[level];
    if (blockIdx === bomb) {
      setRevealed(r => ({ ...r, [level]: blockIdx }));
      setLost(true);
      setGameActive(false);
      setStatus("You hit a bomb! You lost your bet.");
      setCanCashOut(false);
      playSound(loseSoundRef);
      setShowLoseModal(true);
      // Save to local history
      const newStats = getLocalStats();
      newStats.games.push({ win: false, multiplier: multipliers[currentLevel], date: Date.now() });
      saveLocalStats(newStats);
      setStats(newStats);
    } else {
      setRevealed(r => ({ ...r, [level]: blockIdx }));
      setCanCashOut(true);
      playSound(clickSoundRef);
      showLevelUpParticles(level);
      if (level === layoutBlocks.length - 1) {
        setWon(true);
        setGameActive(false);
        setStatus("Congratulations! You reached the top!");
        setShowWinModal(true);
        // Save to local history/leaderboard
        const newStats = getLocalStats();
        newStats.games.push({ win: true, multiplier: multipliers[currentLevel], date: Date.now() });
        newStats.leaderboard.push({ address: generateRandomAddress(), multiplier: multipliers[currentLevel], date: Date.now() });
        setStats(newStats);
      } else {
        setCurrentLevel(level + 1);
        // Auto-cashout if set
        if (autoCash && multipliers[level+1] >= autoCash) {
          setTimeout(() => handleCashOut(), 500);
        }
        // Smooth scroll to next level
        setTimeout(() => {
          const nextRef = layerRefs.current[level + 1];
          if (nextRef) {
            nextRef.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 300);
      }
    }
  };

  // Mobile touch event handler with better touch feedback
  const handleBlockTouch = (level: number, blockIdx: number, event: React.TouchEvent) => {
    event.preventDefault(); // Prevent default touch behavior
    event.stopPropagation(); // Stop event bubbling
    
    // Add visual feedback for touch
    const target = event.currentTarget as HTMLElement;
    target.style.transform = 'scale(0.95)';
    target.style.transition = 'transform 0.1s ease';
    
    setTimeout(() => {
      target.style.transform = '';
      target.style.transition = '';
    }, 100);
    
    handleBlockClick(level, blockIdx);
  };

  const handleCashOut = () => {
    updateActivity();
    setStatus("Cashing out...");
    setGameActive(false);
    setCanCashOut(false);
    playSound(winSoundRef);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.7 },
      zIndex: 9999
    });
    setShowWinModal(true);
    // Save to local history/leaderboard
    const newStats = getLocalStats();
    newStats.games.push({ win: true, multiplier: multipliers[currentLevel], date: Date.now() });
    newStats.leaderboard.push({ address: generateRandomAddress(), multiplier: multipliers[currentLevel], date: Date.now() });
    saveLocalStats(newStats);
    setStats(newStats);
    setTimeout(() => {
      const bottomLayer = layerRefs.current[0];
      if (bottomLayer) {
        bottomLayer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Confetti on win
  React.useEffect(() => {
    if (won) {
      confetti({
        particleCount: 180,
        spread: 120,
        origin: { y: 0.5 },
        zIndex: 9999
      });
    }
  }, [won]);

  // Animate multiplier
  const [multiplierAnim, setMultiplierAnim] = useState(false);
  React.useEffect(() => {
    if (gameActive && !lost && !won) {
      setMultiplierAnim(true);
      setTimeout(() => setMultiplierAnim(false), 600);
    }
  }, [currentLevel]);

  // Particle effect for level up
  const showLevelUpParticles = (level: number) => {
    const container = document.getElementById('gameArea');
    if (!container) return;
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'levelup-particle';
      p.style.left = `${Math.random() * 90 + 5}%`;
      p.style.top = `${Math.random() * 60 + 20}%`;
      p.style.background = `hsl(${Math.random()*360},90%,60%)`;
      container.appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }
  };

  const handleRestart = () => {
    updateActivity();
    setGameActive(false);
    setCurrentLevel(0);
    setBombIndexes([]);
    setRevealed({});
    setLost(false);
    setWon(false);
    setStatus("");
    setCanCashOut(false);
    setShowWinModal(false);
    setShowLoseModal(false);
    // Scroll to bottom after restart
    setTimeout(() => {
      const bottomLayer = layerRefs.current[0];
      if (bottomLayer) {
        bottomLayer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Auto-hide win/lose modals after 1 second
  React.useEffect(() => {
    if (showWinModal) {
      const t = setTimeout(() => setShowWinModal(false), 1000);
      return () => clearTimeout(t);
    }
  }, [showWinModal]);
  React.useEffect(() => {
    if (showLoseModal) {
      const t = setTimeout(() => setShowLoseModal(false), 1000);
      return () => clearTimeout(t);
    }
  }, [showLoseModal]);

  return (
    <>
      <div className="menu-bar">
        <div className="menu-left">
          <button id="menuButton" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
      </div>
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 280,
          height: '100vh',
          background: 'rgba(30,30,30,0.97)',
          color: '#fff',
          zIndex: 10001,
          boxShadow: '2px 0 12px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '28px 28px 16px 28px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0
          }}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
              <h2 style={{margin:0,fontSize:'1.4em',letterSpacing:1}}>Menu</h2>
              <button style={{background:'none',color:'#fff',border:'none',fontSize:22,cursor:'pointer',padding:0}} onClick={()=>setMenuOpen(false)}>&times;</button>
            </div>
          </div>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 28px 28px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <div className="menu-section">
              <div className="menu-section-header">
                <img src="/images/axie.png" alt="Leaderboard" />
                <span>Leaderboard</span>
              </div>
              {stats.leaderboard && stats.leaderboard.length > 0 ? (
                <ul className="leaderboard-list">
                  {stats.leaderboard?.slice(-5).reverse().map((entry:any,i:number)=>(
                    <li key={i} className="leaderboard-item">
                      <div className="leaderboard-rank">
                        <div className={`rank-number ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                          {i + 1}
                        </div>
                        <span className="leaderboard-address">{entry.address?.slice(0,6)}...{entry.address?.slice(-4)}</span>
                      </div>
                      <span className="leaderboard-multiplier">{entry.multiplier?.toFixed(2)}x</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">No leaderboard entries yet</div>
              )}
            </div>
            <div className="menu-section">
              <div className="menu-section-header">
                <img src="/images/happy.gif" alt="History" />
                <span>Game History</span>
              </div>
              {stats.games && stats.games.length > 0 ? (
                <ul className="history-list">
                  {stats.games?.slice(-5).reverse().map((g:any,i:number)=>(
                    <li key={i} className={`history-item ${g.win ? 'win' : 'lose'}`}>
                      <div className="history-result">
                        <span className="result-icon">{g.win ? '🏆' : '💥'}</span>
                        <span>{g.win ? 'Win' : 'Lose'}</span>
                      </div>
                      <span className="history-multiplier">{g.multiplier?.toFixed(2)}x</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">No game history yet</div>
              )}
            </div>
            <div className="menu-section">
              <div className="menu-section-header">
                <img src="/images/hype.png" alt="Auto Cashout" />
                <span>Auto Cashout</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <label htmlFor="auto-cashout-select" style={{fontSize:'0.9rem',color:'#ccc'}}>Target:</label>
                <select 
                  id="auto-cashout-select" 
                  value={autoCash||''} 
                  onChange={e=>setAutoCash(Number(e.target.value)||null)} 
                  style={{
                    borderRadius:6,
                    padding:'6px 12px',
                    background:'rgba(255,255,255,0.1)',
                    border:'1px solid rgba(255,255,255,0.2)',
                    color:'#fff',
                    fontSize:'0.9rem',
                    outline:'none'
                  }}
                >
                  <option value="">Off</option>
                  {multipliers.map((m,i)=>(<option key={i} value={m}>{m.toFixed(2)}x</option>))}
                </select>
              </div>
            </div>
            <div className="menu-section">
              <div className="menu-section-header">
                <span role="img" aria-label="Sound" style={{fontSize:'20px'}}>🔊</span>
                <span>Sound Settings</span>
              </div>
              <div className="menu-sound-toggle-container">
                <button
                  className={"sound-toggle-btn" + (mute ? " sound-off" : "")}
                  onClick={handleMuteToggle}
                  aria-label={mute ? 'Sound Off' : 'Sound On'}
                >
                  <span className="sound-icon">
                    {mute ? (
                      <span role="img" aria-label="Sound Off">🔇</span>
                    ) : (
                      <span role="img" aria-label="Sound On">🔊</span>
                    )}
                  </span>
                  {mute ? 'Sound Off' : 'Sound On'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div id="floatingInfoBox"></div>
      {/* Warning message for placing bet first */}
      {status === "Please place a bet first." && (
        <div className="bet-warning-text animate-shake" key={statusKey}>
          {status}
        </div>
      )}
      <div className="container" id="gameArea">
        {[...layers].reverse().map(({ blockCount, multiplier, idx }, revLevel) => {
          // Calculate the actual level index (0 = bottom)
          const level = layers.length - 1 - revLevel;
          const bomb = bombIndexes[level];
          return (
            <div className="layout" key={idx} ref={el => { layerRefs.current[level] = el; }}>
              <div className="multiplier-label">{multiplier?.toFixed(2) ?? ""}x</div>
              <div className="blocks">
                {Array.from({ length: blockCount }).map((_, j) => {
                  let blockClass = "block";
                  if (revealed[level] === j && bomb === j) blockClass += " bomb revealed";
                  else if (revealed[level] === j) blockClass += " safe revealed";
                  else if (bomb === j && lost && revealed[level] !== undefined) blockClass += " bomb revealed";
                  return (
                    <div
                      className={blockClass}
                      key={j}
                      style={{ cursor: isConnected && level === currentLevel && revealed[level] === undefined ? "pointer" : "default" }}
                      onClick={() => {
                        if (!isConnected) return;
                        if (!gameActive) {
                          setStatus("Please place a bet first.");
                          setStatusKey(Date.now()); // Force re-render/animation
                          return;
                        }
                        if (!lost && !won && level === currentLevel && revealed[level] === undefined) {
                          handleBlockClick(level, j);
                        }
                      }}
                      onTouchStart={(e) => {
                        if (!isConnected) return;
                        if (!gameActive) {
                          setStatus("Please place a bet first.");
                          setStatusKey(Date.now());
                          return;
                        }
                        if (!lost && !won && level === currentLevel && revealed[level] === undefined) {
                          handleBlockTouch(level, j, e);
                        }
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <img src={bomb === j && (lost || revealed[level] === j) ? "/images/sea urchin.png" : "/images/axie.png"} alt={bomb === j ? "Bomb" : "Axie"} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bottom-box">
        <div className="balance-info">
          <div>Multiplier: <span id="currentMultiplier">{multipliers[currentLevel]?.toFixed(2) ?? "1.00"}x</span></div>
          <div className="hype-container">
            <img src="/images/hype.png" alt="HYPE" />
            <span id="hypeAmount" className="hype">1.00</span>
          </div>
        </div>
        {isConnected && hasEnoughSepolia && !gameActive && !lost && !won && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              className="btn-claim"
              onClick={handleBet}
              disabled={isPending}
              style={{ minWidth: 120 }}
            >
              {isPending ? "Betting..." : "Bet 0.001 ETH"}
            </button>
            <button 
              className="btn" 
              onClick={handleShuffle}
              style={{ 
                minWidth: 80, 
                background: '#333', 
                border: '1px solid #14F195',
                fontSize: '0.9rem'
              }}
            >
              🔄 Shuffle
            </button>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {!isConnected && (
            <span style={{ color: '#ff5252', fontWeight: 600 }}>Please connect your wallet to play.</span>
          )}
          {isConnected && (!hasEnoughSepolia) && (
            <span style={{ color: '#ff5252', fontWeight: 600 }}>You need at least 0.001 Sepolia ETH to play.</span>
          )}
          {isConnected && gameActive && canCashOut && !lost && !won && (
            <button
              className="btn"
              onClick={handleCashOut}
              disabled={isCashingOut}
              style={{ minWidth: 120, background: '#14F195', color: '#222' }}
            >
              {isCashingOut ? "Cashing Out..." : "Cash Out"}
            </button>
          )}
          {isConnected && (lost || won) && (
            <button className="btn" onClick={handleRestart} style={{ minWidth: 120 }}>Restart</button>
          )}
        </div>
        <div style={{ marginTop: 8, minHeight: 24, color: lost ? '#ff5252' : won ? '#14F195' : '#fff', textAlign: 'center' }}>{status}</div>
      </div>
      <div id="losePopup" className="popup hidden">
        <img src="/images/cry.png" alt="Cry" />
      </div>
      <div id="winPopup" className="popup hidden">
        <img src="/images/happy.gif" alt="Win" />
      </div>
      {/* Sound elements */}
      <audio ref={clickSoundRef} src="/sounds/click.mp3" preload="auto" />
      <audio ref={loseSoundRef} src="/sounds/lose1.mp3" preload="auto" />
      <audio ref={winSoundRef} src="/sounds/win.mp3" preload="auto" />

      {/* Win/Lose Modals */}
      {showWinModal && (
        <div className="win-modal" onClick={() => setShowWinModal(false)}>
          <span className="win-text">You Win!</span><br />
          Multiplier: {multipliers[currentLevel]?.toFixed(2)}x
        </div>
      )}
      {showLoseModal && (
        <div className="lose-modal" onClick={() => setShowLoseModal(false)}>
          <span className="lose-text">You Lost!</span><br />
          Try again!
        </div>
      )}
    </>
  );
}
