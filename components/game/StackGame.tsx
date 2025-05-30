import React, { useEffect, useRef, useState } from 'react';
import { useMiniappContext } from '@/hooks/useMiniappContext';



// Game constants
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const INITIAL_BLOCK_SIZE = 200;
const INITIAL_SPEED = 2;
const SPEED_INCREMENT = 0.1;
const PERFECT_STACK_THRESHOLD = 0.95;
const PERFECT_STACK_COUNT_FOR_GROWTH = 3;

// Block colors - will transition as the tower grows
const COLORS = [
  '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE',
  '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE',
  '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40',
  '#FF6E40'
];

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const StackGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [perfectStacks, setPerfectStacks] = useState(0);
  const [diamonds, setDiamonds] = useState(0);
  
  // Game state refs (to avoid issues with closures in animation loop)
  const gameStateRef = useRef({
    blocks: [] as Block[],
    currentBlock: null as Block | null,
    movingDirection: 1, // 1 for right, -1 for left
    speed: INITIAL_SPEED,
    towerHeight: 0,
    perfectStacksInARow: 0,
  });
  
  // Get Farcaster context for user data and actions
  const { user, actions } = useMiniAppContext();

  // Initialize game
  const initGame = () => {
    const gameState = gameStateRef.current;
    gameState.blocks = [];
    gameState.speed = INITIAL_SPEED;
    gameState.towerHeight = 0;
    gameState.perfectStacksInARow = 0;
    
    // Create base block
    const baseBlock: Block = {
      x: (GAME_WIDTH - INITIAL_BLOCK_SIZE) / 2,
      y: GAME_HEIGHT - 40, // Position at bottom with some margin
      width: INITIAL_BLOCK_SIZE,
      height: 40,
      color: COLORS[0]
    };
    
    gameState.blocks.push(baseBlock);
    
    // Create first moving block
    createNewBlock();
    
    setScore(0);
    setPerfectStacks(0);
    setGameOver(false);
    setGameActive(true);
    
    // Start game loop
    requestAnimationFrame(gameLoop);
  };
  
  // Create a new moving block
  const createNewBlock = () => {
    const gameState = gameStateRef.current;
    const lastBlock = gameState.blocks[gameState.blocks.length - 1];
    const colorIndex = gameState.blocks.length % COLORS.length;
    
    // New block starts from left or right side
    const startX = gameState.movingDirection === 1 ? -lastBlock.width : GAME_WIDTH;
    
    const newBlock: Block = {
      x: startX,
      y: lastBlock.y - 40, // Stack on top of previous block
      width: lastBlock.width,
      height: 40,
      color: COLORS[colorIndex]
    };
    
    gameState.currentBlock = newBlock;
    gameState.towerHeight += 40;
    
    // Reverse direction for next block
    gameState.movingDirection *= -1;
  };
  
  // Main game loop
  const gameLoop = () => {
    if (!gameActive || gameOver) return;
    
    const gameState = gameStateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Update current block position
    if (gameState.currentBlock) {
      if (gameState.movingDirection === 1) {
        gameState.currentBlock.x += gameState.speed;
        if (gameState.currentBlock.x > GAME_WIDTH) {
          gameState.movingDirection = -1;
        }
      } else {
        gameState.currentBlock.x -= gameState.speed;
        if (gameState.currentBlock.x < -gameState.currentBlock.width) {
          gameState.movingDirection = 1;
        }
      }
    }
    
    // Draw all blocks with camera offset to keep tower in view
    const cameraOffset = Math.max(0, gameState.towerHeight - GAME_HEIGHT / 2);
    
    // Draw blocks
    gameState.blocks.forEach(block => {
      ctx.fillStyle = block.color;
      ctx.fillRect(block.x, block.y + cameraOffset, block.width, block.height);
    });
    
    // Draw current moving block
    if (gameState.currentBlock) {
      ctx.fillStyle = gameState.currentBlock.color;
      ctx.fillRect(
        gameState.currentBlock.x, 
        gameState.currentBlock.y + cameraOffset, 
        gameState.currentBlock.width, 
        gameState.currentBlock.height
      );
    }
    
    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Score: ${score}`, GAME_WIDTH / 2, 40);
    
    // Draw diamonds
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`💎 ${diamonds}`, GAME_WIDTH - 20, 30);
    
    // Continue animation
    requestAnimationFrame(gameLoop);
  };
  
  // Handle player tap/click
  const handleTap = () => {
    if (!gameActive || gameOver) {
      initGame();
      return;
    }
    
    const gameState = gameStateRef.current;
    if (!gameState.currentBlock) return;
    
    const lastBlock = gameState.blocks[gameState.blocks.length - 1];
    
    // Calculate overlap
    const overlapStart = Math.max(lastBlock.x, gameState.currentBlock.x);
    const overlapEnd = Math.min(
      lastBlock.x + lastBlock.width, 
      gameState.currentBlock.x + gameState.currentBlock.width
    );
    
    const overlapWidth = Math.max(0, overlapEnd - overlapStart);
    
    // Check if there's any overlap
    if (overlapWidth <= 0) {
      // Game over - no overlap
      setGameOver(true);
      setGameActive(false);
      
      // Update high score
      if (score > highScore) {
        setHighScore(score);
        // Here we would save the high score to Farcaster/web3
      }
      
      return;
    }
    
    // Calculate percentage of perfect alignment
    const perfectPercentage = overlapWidth / lastBlock.width;
    
    // Check if it's a perfect stack
    const isPerfectStack = perfectPercentage > PERFECT_STACK_THRESHOLD;
    
    // Update perfect stacks counter
    if (isPerfectStack) {
      const newPerfectStacks = perfectStacks + 1;
      setPerfectStacks(newPerfectStacks);
      gameState.perfectStacksInARow += 1;
      
      // Award diamond every 10 perfect stacks
      if (newPerfectStacks % 10 === 0) {
        setDiamonds(prev => prev + 1);
      }
    } else {
      gameState.perfectStacksInARow = 0;
    }
    
    // Create the new block based on the overlap
    const newBlock: Block = {
      x: overlapStart,
      width: overlapWidth,
      y: gameState.currentBlock.y,
      height: gameState.currentBlock.height,
      color: gameState.currentBlock.color
    };
    
    // Add to blocks array
    gameState.blocks.push(newBlock);
    
    // Increase score
    setScore(prev => prev + 1);
    
    // Increase speed
    gameState.speed += SPEED_INCREMENT;
    
    // Check if we should grow the block (after several perfect stacks)
    if (gameState.perfectStacksInARow >= PERFECT_STACK_COUNT_FOR_GROWTH && !isPerfectStack) {
      // Grow the block a bit as a reward
      newBlock.width = Math.min(newBlock.width * 1.1, INITIAL_BLOCK_SIZE);
      gameState.perfectStacksInARow = 0;
    }
    
    // Create next block
    createNewBlock();
  };
  
  // Initialize game on component mount
  useEffect(() => {
    // Set canvas size
    if (canvasRef.current) {
      canvasRef.current.width = GAME_WIDTH;
      canvasRef.current.height = GAME_HEIGHT;
    }
    
    // Load high score from localStorage (will be replaced with Farcaster/web3 storage)
    const savedHighScore = localStorage.getItem('stackGameHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    
    // Show game over screen initially
    setGameOver(true);
    
    // Clean up on unmount
    return () => {
      setGameActive(false);
    };
  }, []);
  
  // Save high score when it changes
  useEffect(() => {
    if (highScore > 0) {
      localStorage.setItem('stackGameHighScore', highScore.toString());
    }
  }, [highScore]);
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          onClick={handleTap}
          className="border border-gray-700 rounded-lg shadow-lg cursor-pointer"
        />
        
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">
              {score > 0 ? 'Game Over' : 'Stack Game'}
            </h2>
            {score > 0 && (
              <div className="text-xl text-white mb-6">
                <p>Score: {score}</p>
                <p>High Score: {highScore}</p>
                <p>Diamonds: {diamonds}</p>
              </div>
            )}
            <button
              onClick={initGame}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition"
            >
              {score > 0 ? 'Play Again' : 'Start Game'}
            </button>
            
            {score > 0 && user && (
              <button
                onClick={() => {
                  // Share score via Farcaster
                  if (actions?.composeCast) {
                    actions.composeCast({
                      text: `I scored ${score} in Stack Game! Can you beat my high score? #StackGame #Farcaster`,
                    });
                  }
                }}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
              >
                Share Score
              </button>
            )}
          </div>
        )}
      </div>
      
      {user && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Playing as: {user.displayName || user.username}</p>
        </div>
      )}
    </div>
  );
};

export default StackGame;
