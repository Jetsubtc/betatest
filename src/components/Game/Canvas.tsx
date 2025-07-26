'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { GameState, GameStatus } from './GameState';

const AXIE_IMG_PATH = '/images/axie.png';
const BOMB_IMG_PATH = '/images/sea urchin.png';
const BLOCK_IMG_PATH = '/images/block.png';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isConnected } = useAccount();
  const [game, setGame] = useState<GameState | null>(null);
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    const paths = { axie: AXIE_IMG_PATH, bomb: BOMB_IMG_PATH, block: BLOCK_IMG_PATH };
    const loadedImages: Record<string, HTMLImageElement> = {};
    Object.entries(paths).forEach(([key, path]) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        loadedImages[key] = img;
        if (Object.keys(loadedImages).length === Object.keys(paths).length) {
          setImages(loadedImages);
        }
      };
    });
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0a1929';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!game || Object.keys(images).length === 0) return;

    const blockWidth = 60, blockHeight = 60, blockGap = 10, levelGap = 20;
    let y = canvas.height - blockHeight - 10;

    for (let i = 0; i < game.board.length; i++) {
      const level = game.board[i];
      const levelWidth = level.length * blockWidth + (level.length - 1) * blockGap;
      let x = (canvas.width - levelWidth) / 2;

      for (let j = 0; j < level.length; j++) {
        const block = level[j];
        const imageToDraw = block.isRevealed ? (block.isBomb ? images.bomb : images.axie) : images.block;
        ctx.drawImage(imageToDraw, x, y, blockWidth, blockHeight);
        x += blockWidth + blockGap;
      }
      y -= blockHeight + levelGap;
    }
  }, [game, images]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !isConnected) return;

    let animationFrameId: number;
    const render = () => {
      draw(ctx, canvas);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [draw, isConnected]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!game || game.status !== GameStatus.InProgress || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left, clickY = event.clientY - rect.top;

    const blockWidth = 60, blockHeight = 60, blockGap = 10, levelGap = 20;
    let y = canvas.height - blockHeight - 10;

    if (game.currentLevel < game.board.length) {
        const i = game.currentLevel;
        const level = game.board[i];
        const levelWidth = level.length * blockWidth + (level.length - 1) * blockGap;
        let x = (canvas.width - levelWidth) / 2;

        if (clickY > y && clickY < y + blockHeight) {
            for (let j = 0; j < level.length; j++) {
                if (clickX > x && clickX < x + blockWidth) {
                    game.reveal(i, j);
                    setGame(Object.assign(Object.create(Object.getPrototypeOf(game)), game));
                    return;
                }
                x += blockWidth + blockGap;
            }
        }
    }
  };

  const startGame = () => setGame(new GameState(1.0));

  if (!isConnected) return <div className="flex items-center justify-center h-[600px]"><p>Please connect your wallet to play</p></div>;

  return (
    <div>
      {(!game || game.status !== GameStatus.InProgress) ? (
        <button onClick={startGame} className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">Start Game (1 USDC)</button>
      ) : (
        <div className="my-4">
          <p>Multiplier: {game.currentMultiplier.toFixed(2)}x</p>
          <p>Potential Win: {(game.betAmount * game.currentMultiplier).toFixed(2)} USDC</p>
          <button onClick={() => game.cashOut()} className="px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700">Cash Out</button>
        </div>
      )}
      <canvas ref={canvasRef} width={800} height={1200} className="border border-gray-300 rounded-lg" onClick={handleCanvasClick} />
    </div>
  );
}