import React, { useEffect } from 'react';
import StackGame from '@/components/game/StackGame';
import WalletActions from '@/components/game/WalletActions';
import { useMiniAppContext } from '@/hooks/useMiniAppContext';

const App = () => {
  const { user, actions } = useMiniAppContext();

  // Log user info when available
  useEffect(() => {
    if (user) {
      console.log('Farcaster user connected:', user);
    }
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-gray-900 to-black">
      <header className="w-full max-w-md mb-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Stack Game</h1>
        <p className="text-gray-300">Stack blocks as high as you can!</p>
        
        {user && (
          <div className="mt-2 flex items-center justify-center">
            {user.pfpUrl && (
              <img 
                src={user.pfpUrl} 
                alt={user.displayName || user.username} 
                className="w-8 h-8 rounded-full mr-2"
              />
            )}
            <p className="text-sm text-gray-300">
              Welcome, {user.displayName || user.username}!
            </p>
          </div>
        )}
      </header>

      <main className="w-full max-w-md">
        <StackGame />
        <WalletActions />
      </main>

      <footer className="w-full max-w-md mt-8 text-center">
        <div className="flex justify-center space-x-4 mb-4">
          {actions?.addFrame && (
            <button
              onClick={() => actions.addFrame()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Save App
            </button>
          )}
          
          {user && actions?.viewProfile && (
            <button
              onClick={() => actions.viewProfile({ fid: user.fid })}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
            >
              View Profile
            </button>
          )}
          
          {actions?.composeCast && (
            <button
              onClick={() => actions.composeCast({
                text: "I'm playing Stack Game on Farcaster! #StackGame #Farcaster",
              })}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
            >
              Share
            </button>
          )}
        </div>
        
        <p className="text-xs text-gray-500">
          A Farcaster Mini App powered by Monad
        </p>
      </footer>
    </div>
  );
};

export default App;
