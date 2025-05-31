'use client';

import { useState } from 'react';
import WordInput from '@/app/components/WordInput';
import WordLoop from '@/app/components/WordLoop';

export default function HomePage() {
  const [started, setStarted] = useState(false);

  return (
    <main className="bg-black text-white overflow-hidden">
      {!started ? (
        <div className="flex flex-col items-center justify-center h-screen cursor-auto">
          <button
            onClick={() => setStarted(true)}
            className="text-white px-6 py-3 rounded text-6xl shadow-lg hover:scale-105 transition-transform blur-[1px]"
          >
            start
          </button>
        </div>
      ) : (
        <>
        <WordLoop />
        </>
      )}
    </main>
  );
}
