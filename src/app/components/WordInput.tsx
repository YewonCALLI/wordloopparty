'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient'

export default function WordInput() {
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    await supabase.from('words').insert([{ text: trimmed }]);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="단어를 입력하세요"
        className="p-2 text-lg text-white"
      />
    </form>
  );
}
