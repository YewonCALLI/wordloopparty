import { useEffect, useState, useRef } from 'react'

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
  const youtubeRef = useRef<HTMLIFrameElement>(null)

  const MOVABLE_GROUPS = [0, 1, 2, 3, 4, 6, 7]
  const FIXED_GROUP = 5

  const [visibleOrder, setVisibleOrder] = useState<number[]>([...MOVABLE_GROUPS.slice(0, 5), FIXED_GROUP, ...MOVABLE_GROUPS.slice(5)])

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

  useEffect(() => {
    const interval = setInterval(() => {
        setVisibleOrder(prev => {
        const movable = prev.filter(idx => idx !== FIXED_GROUP)
        const [first, ...rest] = movable
        const rotated = [...rest, first]

        return [...rotated.slice(0, 5), FIXED_GROUP, ...rotated.slice(5)]
        })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-screen flex flex-wrap text-white bg-black">
      <div 
        className={`fixed top-0 left-0 w-full h-full transition-opacity duration-500 z-10 pointer-events-none ${
          visibleOrder.includes(FIXED_GROUP) ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: `translate(${(visibleOrder.indexOf(FIXED_GROUP) % 3) * 100}%, ${Math.floor(visibleOrder.indexOf(FIXED_GROUP) / 3) * 95}%)`,
          width: '33.33%',
          height: '33.33%'
        }}
      >
        <div className="relative w-full h-full overflow-hidden">
        <iframe
            ref={youtubeRef}
            className="w-full pointer-events-auto"
            style={{ 
            height: 'calc(100% + 100px)', 
            marginTop: '-60px',
            marginBottom: '-70px'
            }}
            src="https://www.youtube.com/embed/0qo78R_yYFA?autoplay=1&mute=1&playsinline=1&modestbranding=1&showinfo=0&controls=0"
            title="YouTube video player"
            allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        />
        </div>
      </div>
        
      {visibleOrder.map((visibleIdx) => {
        const group = groupedWords[visibleIdx]

        return (
          <div
            key={visibleIdx}
            className="flex-1 min-w-[33%] min-h-[30%] relative overflow-hidden"
          >
            {visibleIdx === FIXED_GROUP && (
              <div className="w-full h-full bg-transparent" />
            )}

            {visibleIdx === 0 && (
              <div className="absolute inset-0 z-0 flex flex-col w-full h-full">
                {Array.from({ length: 10 }).map((_, rowIdx) => (
                  <div
                    key={`row-${rowIdx}`}
                    className="flex flex-row w-full"
                    style={{
                      height: rowIdx % 2 === 0 ? '30%' : '10%',
                    }}
                  >
                    {Array.from({ length: 20 }).map((_, colIdx) => {
                      const isEvenRow = rowIdx % 2 === 0
                      const isEvenCol = colIdx % 2 === 0
                      const isWhite = isEvenRow ? isEvenCol : !isEvenCol
                      return (
                        <div
                          key={`cell-${rowIdx}-${colIdx}`}
                          className={`flex-1 ${isWhite ? 'bg-black' : 'bg-[#FF6B6B]'}`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            )}

            {visibleIdx === 1 && (
              <div className="absolute inset-0 z-0 flex flex-col w-full h-full">
                {Array.from({ length: 14 }).map((_, rowIdx) => (
                  <div
                    key={`row-${rowIdx}`}
                    className="flex flex-row w-full"
                    style={{ height: '30%' }}
                  >
                    <div
                      key={`cell-${rowIdx}`}
                      className={`flex-1 ${
                        rowIdx % 2 === 0 ? 'bg-[#4F91DA]' : 'bg-black'
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}

            {visibleIdx === 2 && (
              <div className="absolute inset-0 z-0 bg-black">
                <div className="w-full h-full bg-[radial-gradient(circle,_#03D7C1_70%,_transparent_90%)] bg-[size:80px_80px] opacity-30 animate-pulse" />
              </div>
            )}

            {visibleIdx === 3 && (
              <div className="absolute inset-0 z-0 bg-black">
                <div
                  className="w-full h-full opacity-30 animate-[slideTiles_4s_linear_infinite]"
                  style={{
                    backgroundImage: `linear-gradient(45deg, #FFF, transparent 25%, transparent 75%, #FFF, #FFF),
                                      linear-gradient(45deg, #FFF, transparent 25%, transparent 75%, #FFF, #FFF)`,
                    backgroundSize: '40px 100px',
                    backgroundPosition: '0 0, 20px 20px',
                  }}
                />
                <style jsx global>{`
                  @keyframes slideTiles {
                    0% {
                      background-position: 0 0, 20px 20px;
                    }
                    100% {
                      background-position: 40px 40px, 60px 60px;
                    }
                  }
                `}</style>
              </div>
            )}

            {visibleIdx === 4 && (
              <div className="absolute inset-0 z-0 bg-black">
                <div
                  className="w-full h-full animate-[fractalSpin_10s_linear_infinite]"
                  style={{
                    backgroundImage: `
                      repeating-radial-gradient(circle, 
                        #F0ABFC 0px, 
                        #F0ABFC 2px, 
                        transparent 2px, 
                        transparent 10px)
                    `,
                    backgroundSize: '200px 200px',
                    backgroundRepeat: 'repeat',
                    opacity: 0.2,
                  }}
                />
                <style jsx global>{`
                  @keyframes fractalSpin {
                    0% {
                      transform: rotate(0deg) scale(7);
                    }
                    100% {
                      transform: rotate(360deg) scale(1);
                    }
                  }
                `}</style>
              </div>
            )}

            {visibleIdx === 6 && (
              <div className="absolute inset-0 z-0">
                <div
                  className="w-full h-full opacity-30"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 50% 50%, #38BDF8 40%, transparent 41%),
                      radial-gradient(circle at 25% 75%, #38BDF8 40%, transparent 41%)
                    `,
                    backgroundSize: '50px 50px',
                    backgroundPosition: '0 0, 25px 25px',
                  }}
                />
              </div>
            )}

            {visibleIdx === 7 && (
              <div className="absolute inset-0 z-0 bg-black">
                <div
                  className="w-full h-full opacity-20 animate-[diagonalMove_6s_linear_infinite]"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      45deg,
                      #FFF 0px,
                      #FFF 1px,
                      transparent 1px,
                      transparent 20px
                    )`,
                    backgroundSize: '40px 40px',
                  }}
                />
                <style jsx global>{`
                  @keyframes blink {
                    0%, 50% {
                      opacity: 1;
                    }
                    51%, 100% {
                      opacity: 0;
                    }
                  }
                  @keyframes diagonalMove {
                    0% {
                      background-position: 0 0;
                    }
                    100% {
                      background-position: 40px 40px;
                    }
                  }
                `}</style>
              </div>
            )}

            {/* === 텍스트 그리드 === */}
            {visibleIdx !== FIXED_GROUP && (
              <div className="relative z-20 w-full h-full p-2">
                <div 
                  className="grid gap-1 w-full h-full content-start"
                  style={{
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                    gridAutoRows: 'min-content'
                  }}
                >
                  {group.map((word, wordIdx) => {
                    const index = visibleIdx * Math.ceil(words.length / GROUP_COUNT) + wordIdx
                    return (
                      <div key={index} className="flex gap-1 items-start">
                        <div className="text-left relative font-mono bg-black text-sm">
                          {word.split('').map((char, idx) => (
                            <span key={idx} className="relative inline-block">
                              <span className="inset-0 bg-black z-0"></span>
                              <span className="relative z-10">{char}</span>
                            </span>
                          ))}
                          <span className="relative inline-block ml-0.1">
                            <span className="animate-[blink_1s_step-end_infinite] text-white font-bold">|</span>
                          </span>
                        </div>
                        <div className="text-white font-mono text-[8px] bg-black leading-none">
                          {index.toString().padStart(3, '0')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}