import { useEffect, useState } from 'react'

interface MatrixWordSectionProps {
  words: string[]
  initialWordCount: number
  currentBpm: number
  hasPlayedInitial: boolean
}

const GROUP_COUNT = 8

export default function MatrixWordSection({
  words,
  initialWordCount
}: MatrixWordSectionProps) {
  const [glitchingWords, setGlitchingWords] = useState<Set<number>>(new Set())

  // 단어를 GROUP_COUNT개의 그룹으로 나누기
  const groupedWords = Array.from({ length: GROUP_COUNT }, (_, i) => {
    const start = Math.floor(i * words.length / GROUP_COUNT)
    const end = Math.floor((i + 1) * words.length / GROUP_COUNT)
    return words.slice(start, end)
  })

  useEffect(() => {
    if (words.length > 0) {
      const lastIndex = words.length - 1
      setGlitchingWords(prev => new Set(prev).add(lastIndex))
      const timer = setTimeout(() => {
        setGlitchingWords(prev => {
          const newSet = new Set(prev)
          newSet.delete(lastIndex)
          return newSet
        })
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [words.length])

  const renderWordWithHighlight = (word: string) => {
    if (word.length === 0) return word
    const chars = word.split('')
    const lastChar = chars[chars.length - 1]
    const restChars = chars.slice(0, -1).join('')

    return (
      <span className="font-mono">
        {restChars}
        <span className="relative inline-block">
          {lastChar}
          <div className="absolute inset-0 bg-green-400 opacity-40 animate-pulse"></div>
        </span>
      </span>
    )
  }

  return (
    <div className="w-full h-screen flex flex-wrap">
      {groupedWords.map((group, groupIdx) => (
  <div
    key={groupIdx}
    className={`flex-1 min-w-[33%] min-h-[30%] p-2 flex flex-col gap-2 border relative overflow-hidden
      ${groupIdx === 1 ? 'bg-white' : 'bg-transparent'}
    `}
  >
    {/* 🔴🔲 격자무늬 배경 */}
    {groupIdx === 1 && (
      <div className="absolute inset-0 z-0 bg-[linear-gradient(90deg,_red_25%,_transparent_25%),linear-gradient(180deg,_red_25%,_transparent_25%)] bg-[length:10px_10px] opacity-30" />
    )}

    {/* 🟦 커서 사각형 */}
    {groupIdx === 1 && (
      <div className="absolute w-[10px] h-[16px] bg-white opacity-80 z-10 animate-cursor-move" />
    )}

    {/* 🟩 텍스트 렌더링 */}
    {group.map((word, wordIdx) => {
      const index = groupIdx * Math.ceil(words.length / GROUP_COUNT) + wordIdx
      return (
        <div key={index} className="relative z-20 group">
          <div className="absolute top-0 left-0 text-green-600 font-mono text-xs opacity-50">
            {index.toString().padStart(3, '0')}
          </div>
          <div className="text-left relative font-mono whitespace-pre">
            {word.split('').map((char, idx) => (
              <span key={idx} className="relative inline-block">
                <span className="absolute inset-0 bg-white z-0"></span>
                <span className="relative z-10">{char}</span>
              </span>
            ))}
          </div>
        </div>
      )
    })}

    {/* 📺 유튜브는 groupIdx === 5일 때만 */}
    {groupIdx === 5 && (
      <div className="aspect-video w-full mt-2 z-20">
        <iframe
          className="w-full h-full rounded-lg"
          src="https://www.youtube.com/embed/0qo78R_yYFA"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )}
  </div>
))}

    </div>
  )
}
