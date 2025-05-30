"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useMiniAppContext } from '@/hooks/useMiniappContext';


export default function Home() {
  const { actions } = useMiniAppContext();

  // Automatically redirect to app after splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/app';
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-black">
      <div className="relative flex flex-col items-center justify-center">
        {/* Splash image */}
        <div className="w-64 h-64 relative mb-8">
          <Image
            src="/images/stack-game-splash.png"
            alt="Stack Game"
            width={256}
            height={256}
            className="rounded-lg shadow-lg"
            priority
          />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4 text-center">Stack Game</h1>
        <p className="text-xl text-gray-300 mb-8 text-center">Stack blocks as high as you can!</p>
        
        <div className="flex space-x-4">
          <button
            onClick={() => window.location.href = '/app'}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition"
          >
            Play Now
          </button>
          
          {actions?.addFrame && (
            <button
              onClick={() => actions.addFrame()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
            >
              Save App
            </button>
          )}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            A Farcaster Mini App powered by Monad
          </p>
        </div>
      </div>
    </main>
  );
}
