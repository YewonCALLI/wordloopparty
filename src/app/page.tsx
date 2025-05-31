'use client';

import { useState } from 'react';
import WordInput from '@/app/components/WordInput';
import WordLoop from '@/app/components/WordLoop';

export default function HomePage() {
  const [started, setStarted] = useState(false);

  return (
    <main className="bg-black text-white ">
      {!started ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <button
            onClick={() => setStarted(true)}
            className="bg-white text-black px-6 py-3 rounded text-xl shadow-lg hover:scale-105 transition-transform"
          >
            🔊 파티 시작하기
          </button>
        </div>
      ) : (
        <>
        <WordLoop />
        <WordInput />
        </>
      )}
    </main>
  );
}
