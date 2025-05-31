// components/WordPitchControls.tsx
'use client'

interface WordPitchControlsProps {
  userWords: string[]
  wordPitches: {[key: string]: number}
  getWordPitch: (word: string) => number
  setWordPitch: (word: string, pitch: number) => void
  setWordPitches: (pitches: {[key: string]: number} | ((prev: {[key: string]: number}) => {[key: string]: number})) => void
  isAudioStarted: boolean
  playWordWithMusic: (word: string, speechRate: number, pitch: number) => Promise<void>
  playMusic: (word: string, pitch: number) => Promise<void>
}

export default function WordPitchControls({
  userWords,
  wordPitches,
  getWordPitch,
  setWordPitch,
  setWordPitches,
  isAudioStarted,
  playWordWithMusic,
  playMusic,
}: WordPitchControlsProps) {
  if (userWords.length === 0) return null

  return (
    <div className="p-4 bg-purple-900 rounded-lg border border-purple-500">
      <h4 className="text-lg font-bold text-purple-300 mb-4">🎵 단어별 음정 조절</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {userWords.map((word, index) => (
          <div key={`${word}-${index}`} className="flex items-center gap-3 p-3 bg-gray-800 rounded">
            <span className="text-white font-semibold min-w-20 text-center">
              {word}
            </span>
            
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs text-gray-400">낮음</span>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={getWordPitch(word)}
                onChange={(e) => setWordPitch(word, Number(e.target.value))}
                className="flex-1 h-2 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-400">높음</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-white font-mono text-sm w-8">
                {getWordPitch(word).toFixed(1)}
              </span>
              
              <button
                onClick={() => setWordPitch(word, 1.0)}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded"
                title="기본값으로 리셋"
              >
                🔄
              </button>
              
              <button
                onClick={async () => {
                  const pitch = getWordPitch(word)
                  if (isAudioStarted) {
                    await playWordWithMusic(word, 0.8, pitch)
                  }
                }}
                className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded"
                title="미리듣기 (TTS + 음악)"
              >
                ▶️
              </button>

              <button
                onClick={async () => {
                  const pitch = getWordPitch(word)
                  await playMusic(word, pitch)
                }}
                className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded"
                title="한글 분해 음악 미리듣기"
              >
                🎵
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            const newPitches: {[key: string]: number} = {}
            userWords.forEach(word => {
              newPitches[word] = 1.0
            })
            setWordPitches(prev => ({ ...prev, ...newPitches }))
          }}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
        >
          🔄 모두 기본값
        </button>
        
        <button
          onClick={() => {
            const newPitches: {[key: string]: number} = {}
            userWords.forEach(word => {
              newPitches[word] = 0.5 + Math.random() * 2.0
            })
            setWordPitches(prev => ({ ...prev, ...newPitches }))
          }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded"
        >
          🎲 랜덤 설정
        </button>
      </div>
    </div>
  )
}