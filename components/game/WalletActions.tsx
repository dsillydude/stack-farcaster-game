import React from 'react';
import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { useWriteContract, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { useMiniAppContext } from '@/hooks/useMiniAppContext';

// Mock contract ABI for high score storage
const highScoreABI = [
  {
    inputs: [{ name: 'score', type: 'uint256' }],
    name: 'setHighScore',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'player', type: 'address' }],
    name: 'getHighScore',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// Mock contract address - would be replaced with actual deployed contract
const contractAddress = '0x0000000000000000000000000000000000000000';

const WalletActions = () => {
  const { user } = useMiniAppContext();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { chains, switchNetwork } = useSwitchNetwork();
  
  // Contract interactions
  const { writeContract, isPending: isWritePending } = useWriteContract();
  
  const { data: highScore, refetch: refetchHighScore } = useReadContract({
    address: contractAddress,
    abi: highScoreABI,
    functionName: 'getHighScore',
    args: [address],
    enabled: isConnected && !!address,
  });

  // Check if we're on Monad Testnet
  const isMonadTestnet = chain?.id === 2525;

  // Save high score to blockchain
  const saveHighScore = (score: number) => {
    if (!isConnected || !isMonadTestnet) return;
    
    writeContract({
      address: contractAddress,
      abi: highScoreABI,
      functionName: 'setHighScore',
      args: [score],
    }, {
      onSuccess: () => {
        refetchHighScore();
      },
    });
  };

  return (
    <div className="mt-6 p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Wallet Actions</h2>
      
      {!isConnected ? (
        <div>
          <p className="text-gray-300 mb-4">Connect your wallet to save high scores on-chain</p>
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg mb-2 hover:bg-blue-700 transition"
            >
              Connect {connector.name}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-300">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
            <button
              onClick={() => disconnect()}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
            >
              Disconnect
            </button>
          </div>
          
          {!isMonadTestnet && (
            <div className="mb-4">
              <p className="text-yellow-300 mb-2">Please switch to Monad Testnet</p>
              <button
                onClick={() => switchNetwork?.(2525)}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
              >
                Switch to Monad Testnet
              </button>
            </div>
          )}
          
          {isMonadTestnet && (
            <div>
              <p className="text-gray-300 mb-2">On-chain High Score: {highScore ? Number(highScore) : 'Not set'}</p>
              
              <button
                onClick={() => saveHighScore(100)} // Example score
                disabled={isWritePending}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-600"
              >
                {isWritePending ? 'Saving...' : 'Save Current Score'}
              </button>
              
              <div className="mt-4">
                <p className="text-xs text-gray-400">
                  Your high scores are stored on the Monad Testnet blockchain, making them transparent and permanent.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletActions;
