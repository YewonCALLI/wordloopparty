// components/WordLoop.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient'

export default function WordLoop() {
  const [words, setWords] = useState<string[]>([])
  const [initialWordCount, setInitialWordCount] = useState(0)
  const [bpm, setBpm] = useState(60) // 기본 60 BPM
  const [autoAccelerate, setAutoAccelerate] = useState(false) // 자동 가속
  const [currentBpm, setCurrentBpm] = useState(60) // 현재 실제 BPM (최대 1000!)
  const [melodyMode, setMelodyMode] = useState('random') // 멜로디 모드
  const [enableMelody, setEnableMelody] = useState(true) // 멜로디 활성화
  const processedWords = useRef(new Set<string>())
  const hasPlayedInitial = useRef(false)
  const accelerationInterval = useRef<NodeJS.Timeout | null>(null)
  const melodyIndex = useRef(0) // 멜로디 인덱스

  // BPM을 간격(ms)으로 변환 - 극한 모드!
  const bpmToInterval = (bpm: number) => {
    return Math.max(50, 60000 / bpm) // 최소 50ms 간격 (미친 속도!)
  }

  // 🎵 멜로디 패턴들
  const melodyPatterns = {
    major: [1.0, 1.12, 1.26, 1.33, 1.5, 1.68, 1.89, 2.0], // 도레미파솔라시도
    minor: [1.0, 1.12, 1.19, 1.33, 1.5, 1.59, 1.78, 2.0], // 단조 스케일
    pentatonic: [1.0, 1.12, 1.26, 1.5, 1.68], // 펜타토닉 (동양적)
    blues: [1.0, 1.19, 1.33, 1.41, 1.5, 1.78], // 블루스 스케일
    random: [] // 무작위
  }

  // 음정 가져오기
  const getPitch = (wordIndex: number) => {
    if (!enableMelody) return 1.0

    switch (melodyMode) {
      case 'random':
        return 0.5 + Math.random() * 1.5 // 0.5 ~ 2.0 무작위
      
      case 'wave':
        // 사인파처럼 올라갔다 내려왔다
        return 0.8 + 0.6 * Math.sin(wordIndex * 0.8)
      
      case 'ascending':
        // 계속 올라가기
        return 0.6 + (wordIndex % 8) * 0.2
      
      case 'descending':
        // 계속 내려가기
        return 1.8 - (wordIndex % 8) * 0.2
      
      default:
        // 스케일 패턴 사용
        const pattern = melodyPatterns[melodyMode as keyof typeof melodyPatterns] || melodyPatterns.major
        return pattern[wordIndex % pattern.length]
    }
  }

  // 🧩 초기 단어 불러오기
  useEffect(() => {
    const loadInitialWords = async () => {
      try {
        const { data, error } = await supabase
          .from('words')
          .select('id, text, created_at')
          .order('created_at', { ascending: true })
        
        if (error) {
          console.error('[❌ 초기 단어 불러오기 실패]', error)
          return
        }
        
        const wordTexts = data.map((item) => item.text)
        setWords(wordTexts)
        setInitialWordCount(wordTexts.length)
        
        // 이미 로드된 단어들을 처리됨으로 표시
        data.forEach(item => processedWords.current.add(item.id))
        
        console.log('[📦 초기 DB 로드 완료] 전체 단어:', wordTexts)
      } catch (err) {
        console.error('[❌ 초기 로드 에러]', err)
      }
    }
    
    loadInitialWords()
  }, [])

  // 🔁 Supabase Realtime 구독
  useEffect(() => {
    console.log('[🔌 Realtime 구독 시작]')
    
    const channel = supabase
      .channel('public:words', {
        config: {
          broadcast: { self: true }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'words',
        },
        (payload) => {
          console.log('[🆕 실시간 페이로드]', payload)
          
          const newWord = payload.new.text
          const wordId = payload.new.id
          
          if (processedWords.current.has(wordId)) {
            console.log('[⚠️ 이미 처리된 단어]', newWord)
            return
          }
          
          processedWords.current.add(wordId)
          console.log('[🆕 새 단어 추가]', newWord)
          
          // 전체 단어 목록에 추가
          setWords(prev => {
            const updated = [...prev, newWord]
            console.log('[📝 단어 목록 업데이트]', updated)
            return updated
          })
        }
      )
      .subscribe((status) => {
        console.log('[📡 구독 상태]', status)
      })

    return () => {
      console.log('[🔌 Realtime 구독 해제]')
      channel.unsubscribe()
    }
  }, [])

  // 🚀 자동 가속 처리
  useEffect(() => {
    if (autoAccelerate) {
      setCurrentBpm(bpm)
      
      accelerationInterval.current = setInterval(() => {
        setCurrentBpm(prev => {
          const newBpm = Math.min(prev + 20, 1000) // 최대 1000 BPM! 🚀🚀🚀
          console.log('[🚀 극한 가속]', newBpm, 'BPM')
          return newBpm
        })
      }, 5000) // 5초마다 20 BPM씩 증가 (극한 가속!)
      
      return () => {
        if (accelerationInterval.current) {
          clearInterval(accelerationInterval.current)
        }
      }
    } else {
      if (accelerationInterval.current) {
        clearInterval(accelerationInterval.current)
      }
      setCurrentBpm(bpm)
    }
  }, [autoAccelerate, bpm])

  // TTS 헬퍼 함수 - 멜로디 지원
  const speakWord = (word: string, speechRate: number = 0.8, pitch: number = 1.0): Promise<void> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.warn('[⚠️ TTS 미지원]')
        resolve()
        return
      }

      const timeoutId = setTimeout(() => {
        console.log('[⏰ TTS 타임아웃]', word)
        resolve()
      }, 3000)

      try {
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.lang = 'ko-KR'
        utterance.rate = speechRate
        utterance.pitch = pitch // 🎵 음정 설정!
        utterance.volume = 0.9
        
        utterance.onend = () => {
          clearTimeout(timeoutId)
          resolve()
        }
        
        utterance.onerror = () => {
          console.warn('[⚠️ TTS 에러, 건너뜀]', word)
          clearTimeout(timeoutId)
          resolve()
        }
        
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel()
        }
        
        speechSynthesis.speak(utterance)
        
      } catch (error) {
        clearTimeout(timeoutId)
        console.warn('[⚠️ TTS 실행 실패]', word)
        resolve()
      }
    })
  }

  // Sleep 헬퍼 함수
  const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 🗣 TTS 컨트롤러
  useEffect(() => {
    let isMounted = true
    
    const userWords = words.slice(initialWordCount)
    console.log('[🎮 TTS 시작] BPM:', currentBpm, '사용자 단어:', userWords)
    
    speechSynthesis.cancel()
    
    const runTTS = async () => {
      // 초기 단어 재생 (한 번만)
      if (!hasPlayedInitial.current && words.length > 0) {
        console.log('[🎵 초기 단어 재생 시작]')
        for (let i = 0; i < initialWordCount && i < words.length && isMounted; i++) {
          console.log('[🗣 초기]', words[i])
          await speakWord(words[i], 0.8)
          if (isMounted) await sleep(bpmToInterval(60)) // 초기는 항상 60 BPM
        }
        if (isMounted) {
          hasPlayedInitial.current = true
          console.log('[✅ 초기 단어 재생 완료]')
        }
      }
      
      // 사용자 단어 무한 반복
      while (isMounted && userWords.length > 0) {
        const currentUserWords = words.slice(initialWordCount)
        const interval = bpmToInterval(currentBpm)
        const speechRate = Math.min(0.2 + (currentBpm / 100), 5.0) // 극한 말하기 속도 (최대 5배속!)
        
        console.log('[🔄 반복 시작]', currentUserWords, `${currentBpm} BPM, ${speechRate.toFixed(1)}x 속도`)
        
        for (let i = 0; i < currentUserWords.length && isMounted; i++) {
          const pitch = getPitch(melodyIndex.current)
          console.log('[🗣]', currentUserWords[i], `${currentBpm} BPM, 음정: ${pitch.toFixed(2)}`)
          await speakWord(currentUserWords[i], speechRate, pitch)
          melodyIndex.current++
          if (isMounted) await sleep(interval)
        }
        
        if (isMounted) {
          console.log('[🔄 사이클 완료]')
          await sleep(bpmToInterval(currentBpm) * 2) // 사이클 간 대기
        }
      }
    }
    
    setTimeout(() => {
      if (isMounted) runTTS()
    }, 500)
    
    return () => {
      isMounted = false
      speechSynthesis.cancel()
    }
  }, [words, initialWordCount, currentBpm]) // currentBpm 변경 시에도 재시작

  const userWords = words.slice(initialWordCount)

  return (
    <div className="p-4">
      {/* 🎵 BPM 컨트롤 패널 - 극한 모드 */}
      <div className="mb-6 p-6 bg-gray-900 border-2 border-red-500 rounded-lg shadow-2xl">
        <h3 className="text-2xl font-bold text-red-400 mb-4 text-center animate-pulse">
          🔥 극한 BPM 컨트롤 (최대 1000!) 🔥
        </h3>
        
        <div className="flex flex-col gap-6">
          {/* 멜로디 컨트롤 */}
          <div className="p-4 bg-purple-900 rounded-lg border border-purple-500">
            <h4 className="text-lg font-bold text-purple-300 mb-3">🎵 멜로디 설정</h4>
            
            <div className="flex items-center gap-4 mb-3">
              <label className="text-white font-semibold">멜로디:</label>
              <button
                onClick={() => setEnableMelody(!enableMelody)}
                className={`px-3 py-1 rounded ${
                  enableMelody ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'
                }`}
              >
                {enableMelody ? '🎵 ON' : '🚫 OFF'}
              </button>
            </div>

            {enableMelody && (
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'major', name: '🎼 장조', desc: '밝고 경쾌한' },
                  { key: 'minor', name: '🎭 단조', desc: '애절하고 감성적인' },
                  { key: 'pentatonic', name: '🏮 펜타토닉', desc: '동양적인' },
                  { key: 'blues', name: '🎷 블루스', desc: '서글픈' },
                  { key: 'random', name: '🎲 무작위', desc: '예측불가' },
                  { key: 'wave', name: '🌊 웨이브', desc: '물결치는' },
                  { key: 'ascending', name: '⬆️ 상승', desc: '계속 올라가는' },
                  { key: 'descending', name: '⬇️ 하강', desc: '계속 내려가는' }
                ].map(({ key, name, desc }) => (
                  <button
                    key={key}
                    onClick={() => setMelodyMode(key)}
                    className={`px-3 py-2 rounded text-sm ${
                      melodyMode === key
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title={desc}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* BPM 컨트롤 */}
          <div className="flex items-center gap-4">
            <label className="text-white font-semibold min-w-16">BPM:</label>
            <input
              type="range"
              min="30"
              max="1000"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="flex-1 h-4 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 rounded-lg appearance-none cursor-pointer"
              disabled={autoAccelerate}
            />
            <span className="text-white font-mono w-16 text-lg font-bold">{bpm}</span>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setAutoAccelerate(!autoAccelerate)}
              className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
                autoAccelerate 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {autoAccelerate ? '🚀 가속 중 (클릭해서 정지)' : '▶️ 자동 가속 시작'}
            </button>
          </div>
          
          <div className="text-center p-4 bg-black rounded-lg border-2 border-red-500">
            <div className={`text-4xl font-bold mb-2 ${
              currentBpm < 200 ? 'text-green-400' :
              currentBpm < 500 ? 'text-yellow-400' :
              currentBpm < 800 ? 'text-orange-400' :
              'text-red-400 animate-pulse'
            }`}>
              현재: {currentBpm} BPM
            </div>
            <div className="text-sm text-gray-400">
              간격: {bpmToInterval(currentBpm)}ms | 
              속도: {(0.2 + (currentBpm / 100)).toFixed(1)}x | 
              {autoAccelerate ? '🚀 극한 가속 활성' : '⏸️ 수동 모드'}
            </div>
            {currentBpm > 500 && (
              <div className="text-red-400 text-xs mt-2 animate-bounce">
                ⚠️ 경고: 극한 속도 모드! 뇌가 녹을 수 있습니다! 🧠🔥
              </div>
            )}
            {currentBpm > 800 && (
              <div className="text-red-500 text-xs mt-1 animate-pulse">
                🚨 위험: 인간의 한계를 넘어섰습니다! 🚨
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-400">
        총 {words.length}개의 단어 (초기: {initialWordCount}개, 사용자: {userWords.length}개)
      </div>
      
      <div className="mb-4">
        {hasPlayedInitial.current && userWords.length > 0 && (
          <div className="text-green-400 text-sm animate-pulse">
            🔄 {currentBpm} BPM으로 반복 중: {userWords.join(' → ')} → (반복)
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3 text-xl">
        {words.map((word, i) => (
          <span 
            key={`${word}-${i}`} 
            className={`px-3 py-1 rounded-lg border ${
              i < initialWordCount 
                ? 'bg-gray-700 border-gray-500 text-gray-300' 
                : 'bg-blue-800 border-blue-600 text-white animate-pulse'
            }`}
          >
            {word}
            {i < initialWordCount && <span className="ml-1 text-xs">🎵</span>}
            {i >= initialWordCount && <span className="ml-1 text-xs">🔄</span>}
          </span>
        ))}
      </div>
    </div>
  )
}