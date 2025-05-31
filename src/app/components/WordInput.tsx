// components/WordInput.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient'

export default function WordInput() {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await supabase.from('words').insert([{ text: trimmed }]);
      setInput('');
    } catch (error) {
      console.error('단어 추가 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/200 backdrop-blur-sm rounded-lg p-4 shadow-lg transparent opacity-100">
      <form onSubmit={handleSubmit} className="flex gap-3 items-center">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="단어를 입력하세요..."
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-gray-900/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white-500/20 transition-all disabled:opacity-200"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSubmitting}
          className="px-6 py-2 bg-white/30 hover:bg-white-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              추가중...
            </>
          ) : (
            <>
              <span>+</span>
              추가
            </>
          )}
        </button>
      </form>
    </div>
  );
}