"use client";
import React, { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { parseUnits } from 'viem';

// Replace with your deployed contract addresses
const AXIE_GAME_ADDRESS = '0xYourAxieGameAddress'; // TODO: Replace with actual deployed address
const USDC_ADDRESS = '0xYourTestnetUSDCAddress'; // TODO: Replace with actual testnet USDC address

const AXIE_GAME_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'startGame',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'multiplier', type: 'uint256' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'claimReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [
      { name: '', type: 'bool' },
    ],
    type: 'function',
  },
] as const;

export default function BettingGame() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [multiplier, setMultiplier] = useState('');
  const [signature, setSignature] = useState('');

  const { writeContract, isPending } = useWriteContract();

  const handleApprove = async () => {
    if (!amount || isNaN(Number(amount))) return;
    setStatus('Approving USDC...');
    try {
      const amountBigInt = parseUnits(amount, 6);
      await writeContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [AXIE_GAME_ADDRESS, amountBigInt],
        account: address,
        chain: sepolia,
      });
      setStatus('USDC approved! You can now place your bet.');
    } catch (err) {
      setStatus('Approval failed: ' + (err as any)?.message);
    }
  };

  const handleBet = async () => {
    if (!amount || isNaN(Number(amount))) return;
    setStatus('Placing bet...');
    try {
      const amountBigInt = parseUnits(amount, 6);
      await writeContract({
        address: AXIE_GAME_ADDRESS,
        abi: AXIE_GAME_ABI,
        functionName: 'startGame',
        args: [amountBigInt],
        account: address,
        chain: sepolia,
      });
      setStatus('Bet placed! Wait for result.');
    } catch (err) {
      setStatus('Bet failed: ' + (err as any)?.message);
    }
  };

  const handleClaim = async () => {
    if (!amount || !multiplier || !signature || isNaN(Number(amount)) || isNaN(Number(multiplier))) return;
    // Ensure signature is a hex string
    let hexSignature = signature.startsWith('0x') ? signature : `0x${signature}`;
    if (!/^0x[0-9a-fA-F]+$/.test(hexSignature)) {
      setStatus('Signature must be a valid hex string.');
      return;
    }
    setStatus('Claiming reward...');
    try {
      const amountBigInt = parseUnits(amount, 6);
      const multiplierBigInt = BigInt(multiplier);
      await writeContract({
        address: AXIE_GAME_ADDRESS,
        abi: AXIE_GAME_ABI,
        functionName: 'claimReward',
        args: [amountBigInt, multiplierBigInt, hexSignature as `0x${string}`],
        account: address,
        chain: sepolia,
      });
      setStatus('Reward claimed!');
    } catch (err) {
      setStatus('Claim failed: ' + (err as any)?.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 12 }}>
      <h2>Betting Game</h2>
      {!isConnected ? (
        <p>Please connect your wallet.</p>
      ) : (
        <>
          <div>
            <button onClick={handleApprove} disabled={isPending || !amount} style={{ marginBottom: 16 }}>
              {isPending ? 'Approving...' : 'Approve USDC'}
            </button>
          </div>
          <div>
            <label>Bet Amount (USDC): </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="1"
              step="0.01"
              style={{ width: 120 }}
            />
            <button onClick={handleBet} disabled={isPending} style={{ marginLeft: 8 }}>
              {isPending ? 'Betting...' : 'Place Bet'}
            </button>
          </div>
          <div style={{ marginTop: 24 }}>
            <label>Multiplier: </label>
            <input
              type="number"
              value={multiplier}
              onChange={e => setMultiplier(e.target.value)}
              min="100"
              step="1"
              style={{ width: 80 }}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <label>Signature: </label>
            <input
              type="text"
              value={signature}
              onChange={e => setSignature(e.target.value)}
              style={{ width: 250 }}
            />
            <button onClick={handleClaim} disabled={isPending} style={{ marginLeft: 8 }}>
              {isPending ? 'Claiming...' : 'Claim Reward'}
            </button>
          </div>
        </>
      )}
      <div style={{ marginTop: 24, minHeight: 24 }}>{status}</div>
    </div>
  );
} 