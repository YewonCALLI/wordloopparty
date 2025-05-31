// components/WordLoop.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient'
import AudioControls from './AudioControls'
import WordPitchControls from './WordPitchControls'
import BPMControls from './BPMControls'
import { useHangulMusicEngine } from '../hooks/useHangulMusicEngine'
import MatrixWordSection from './MatrixWordSection'

export default function WordLoop() {
  const [words, setWords] = useState<string[]>([])
  const [initialWordCount, setInitialWordCount] = useState(0)
  const [bpm, setBpm] = useState(60)
  const [autoAccelerate, setAutoAccelerate] = useState(false)
  const [currentBpm, setCurrentBpm] = useState(60)
  const [wordPitches, setWordPitches] = useState<{[key: string]: number}>({})
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [ttsEnabled, setTtsEnabled] = useState(true)
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
    return new Promise((resolve) => {
      if (!ttsEnabled || !('speechSynthesis' in window)) {
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
        utterance.pitch = pitch
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

  const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  const playWordWithMusic = async (word: string, speechRate: number, pitch: number) => {
    const musicPromise = playMusic(word, pitch)
    const ttsPromise = ttsEnabled ? speakWord(word, speechRate, pitch) : Promise.resolve()
    
    await Promise.all([musicPromise, ttsPromise])
  }

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
      speechSynthesis.cancel()
    }
  }, [words, initialWordCount, currentBpm, musicEnabled, ttsEnabled])

  const handleStartAudio = async () => {
    await initializeAudio()
  }

  const userWords = words.slice(initialWordCount)

  return (
    <div>

      <MatrixWordSection 
        words={words}
        initialWordCount={initialWordCount}
        currentBpm={currentBpm}
        hasPlayedInitial={hasPlayedInitial.current}
      />

      
      {!isAudioStarted && (
        <div className="mb-6 p-6 bg-purple-900 border-2 border-purple-500 rounded-lg text-center">
          <button
            onClick={handleStartAudio}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white text-xl font-bold rounded-lg transition-all animate-pulse"
          >
            🔊 음악 시작하기!
          </button>
        </div>
      )}

      <AudioControls
        musicEnabled={musicEnabled}
        setMusicEnabled={setMusicEnabled}
        ttsEnabled={ttsEnabled}
        setTtsEnabled={setTtsEnabled}
        masterVolume={masterVolume}
        setMasterVolume={setMasterVolume}
        synthVolume={synthVolume}
        setSynthVolume={setSynthVolume}
        bassVolume={bassVolume}
        setBassVolume={setBassVolume}
        drumVolume={drumVolume}
        setDrumVolume={setDrumVolume}
      />

      <BPMControls
        bpm={bpm}
        setBpm={setBpm}
        currentBpm={currentBpm}
        autoAccelerate={autoAccelerate}
        setAutoAccelerate={setAutoAccelerate}
        musicEnabled={musicEnabled}
        ttsEnabled={ttsEnabled}
        bpmToInterval={bpmToInterval}
      />

      {userWords.length > 0 && (
        <div className="mb-6">
          <WordPitchControls
            userWords={userWords}
            wordPitches={wordPitches}
            getWordPitch={getWordPitch}
            setWordPitch={setWordPitch}
            setWordPitches={setWordPitches}
            isAudioStarted={isAudioStarted}
            playWordWithMusic={playWordWithMusic}
            playMusic={playMusic}
          />
        </div>
      )}

      

    </div>
  )
}