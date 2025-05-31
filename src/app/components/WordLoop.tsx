// components/WordLoop.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient'
import { useHangulMusicEngine } from '../hooks/useHangulMusicEngine'
import MatrixWordSection from './MatrixWordSection'
import ControlPanel from './ControlPanel'
import WordInput from './WordInput'

export default function WordLoop() {
  const [words, setWords] = useState<string[]>([])
  const [initialWordCount, setInitialWordCount] = useState(0)
  const [bpm, setBpm] = useState(800)
  const [autoAccelerate, setAutoAccelerate] = useState(false)
  const [currentBpm, setCurrentBpm] = useState(800)
  const [wordPitches, setWordPitches] = useState<{[key: string]: number}>({})
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [masterVolume, setMasterVolume] = useState(0.3)
  const [synthVolume, setSynthVolume] = useState(0.4)
  const [bassVolume, setBassVolume] = useState(0.5)
  const [drumVolume, setDrumVolume] = useState(0.3)
  
  const processedWords = useRef(new Set<string>())
  const hasPlayedInitial = useRef(false)
  const accelerationInterval = useRef<NodeJS.Timeout | null>(null)

  const { initializeAudio, playMusic, isAudioStarted } = useHangulMusicEngine({
    masterVolume,
    synthVolume,
    bassVolume,
    drumVolume,
    currentBpm,
    musicEnabled,
  })

  const bpmToInterval = (bpm: number) => {
    return Math.max(50, 60000 / bpm)
  }

  const setWordPitch = (word: string, pitch: number) => {
    setWordPitches(prev => ({
      ...prev,
      [word]: pitch
    }))
  }

  const getWordPitch = (word: string) => {
    return wordPitches[word] || 1.0
  }

  const speakWord = (word: string, speechRate: number = 0.8, pitch: number = 1.0): Promise<void> => {
    return Promise.resolve()
  }

  const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  const playWordWithMusic = async (word: string, speechRate: number, pitch: number) => {
    await playMusic(word, pitch)
  }

  const handleStartAudio = async () => {
    await initializeAudio()
  }

  useEffect(() => {
    // 컴포넌트가 마운트되면 자동으로 오디오 초기화
    const initAudio = async () => {
      await handleStartAudio()
    }
    initAudio()
  }, [])

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
        
        data.forEach(item => processedWords.current.add(item.id))
        
        console.log('[📦 초기 DB 로드 완료] 전체 단어:', wordTexts)
      } catch (err) {
        console.error('[❌ 초기 로드 에러]', err)
      }
    }
    
    loadInitialWords()
  }, [])

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

  useEffect(() => {
    if (autoAccelerate) {
      setCurrentBpm(bpm)
      
      accelerationInterval.current = setInterval(() => {
        setCurrentBpm(prev => {
          const newBpm = Math.min(prev + 20, 1000)
          console.log('[🚀 극한 가속]', newBpm, 'BPM')
          return newBpm
        })
      }, 5000)
      
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

  useEffect(() => {
    let isMounted = true
    
    const userWords = words.slice(initialWordCount)
    console.log('[🎮 통합 재생 시작] BPM:', currentBpm, '사용자 단어:', userWords)
    
    speechSynthesis.cancel()
    
    const runIntegratedPlayback = async () => {
      if (!hasPlayedInitial.current && words.length > 0) {
        console.log('[🎵 초기 단어 재생 시작]')
        for (let i = 0; i < initialWordCount && i < words.length && isMounted; i++) {
          console.log('[🗣🎵 초기]', words[i])
          await playWordWithMusic(words[i], 0.8, 1.0)
          if (isMounted) await sleep(bpmToInterval(60))
        }
        if (isMounted) {
          hasPlayedInitial.current = true
          console.log('[✅ 초기 단어 재생 완료]')
        }
      }
      
      while (isMounted && userWords.length > 0) {
        const currentUserWords = words.slice(initialWordCount)
        const interval = bpmToInterval(currentBpm)
        const speechRate = Math.min(0.2 + (currentBpm / 100), 5.0)
        
        console.log('[🔄 통합 반복 시작]', currentUserWords, `${currentBpm} BPM`)
        
        for (let i = 0; i < currentUserWords.length && isMounted; i++) {
          const word = currentUserWords[i]
          const pitch = getWordPitch(word)
          console.log('[🗣🎵]', word, `${currentBpm} BPM, 음정: ${pitch.toFixed(2)}`)
          
          await playWordWithMusic(word, speechRate, pitch)
          if (isMounted) await sleep(interval)
        }
        
        if (isMounted) {
          console.log('[🔄 사이클 완료]')
          await sleep(bpmToInterval(currentBpm) * 2)
        }
      }
    }
    
    setTimeout(() => {
      if (isMounted) runIntegratedPlayback()
    }, 500)
    
    return () => {
      isMounted = false
    }
  }, [words, initialWordCount, currentBpm, musicEnabled])

  const userWords = words.slice(initialWordCount)

  return (
    <div className="relative w-full h-screen">
      {/* 메인 매트릭스 섹션 */}
      <MatrixWordSection 
        words={words}
        initialWordCount={initialWordCount}
        currentBpm={currentBpm}
        hasPlayedInitial={hasPlayedInitial.current}
      />

      {/* 상단 고정 워드 입력 */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <WordInput />
      </div>

      {/* 토글 가능한 컨트롤 패널 */}
      <ControlPanel
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        masterVolume={masterVolume}
        setMasterVolume={setMasterVolume}
        synthVolume={synthVolume}
        setSynthVolume={setSynthVolume}
        bassVolume={bassVolume}
        setBassVolume={setBassVolume}
        drumVolume={drumVolume}
        setDrumVolume={setDrumVolume}
        bpm={bpm}
        setBpm={setBpm}
        currentBpm={currentBpm}
        autoAccelerate={autoAccelerate}
        setAutoAccelerate={setAutoAccelerate}
        bpmToInterval={bpmToInterval}
        userWords={userWords}
        wordPitches={wordPitches}
        getWordPitch={getWordPitch}
        setWordPitch={setWordPitch}
        setWordPitches={setWordPitches}
        isAudioStarted={isAudioStarted}
        playWordWithMusic={playWordWithMusic}
        playMusic={playMusic}
        handleStartAudio={handleStartAudio}
      />
    </div>
  )
}