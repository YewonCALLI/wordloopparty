// hooks/useHangulMusicEngine.ts
'use client'

import { useRef, useEffect } from 'react'
import * as Tone from 'tone'

interface HangulMusicEngineProps {
  masterVolume: number
  synthVolume: number
  bassVolume: number
  drumVolume: number
  currentBpm: number
  musicEnabled: boolean
}

export function useHangulMusicEngine({
  masterVolume,
  synthVolume,
  bassVolume,
  drumVolume,
  currentBpm,
  musicEnabled,
}: HangulMusicEngineProps) {
  const synthRef = useRef<Tone.PolySynth | null>(null)
  const bassRef = useRef<Tone.MonoSynth | null>(null)
  const drumRef = useRef<Tone.NoiseSynth | null>(null)
  const reverbRef = useRef<Tone.Reverb | null>(null)
  const delayRef = useRef<Tone.PingPongDelay | null>(null)
  const masterGainRef = useRef<Tone.Gain | null>(null)
  const isAudioStarted = useRef(false)

  const decomposeHangul = (char: string) => {
    const code = char.charCodeAt(0) - 0xAC00
    if (code < 0 || code > 11171) return null
    
    const choseong = Math.floor(code / 588)
    const jungseong = Math.floor((code % 588) / 28)
    const jongseong = code % 28
    
    return { choseong, jungseong, jongseong }
  }

  const choseongToNote = (choseong: number, pitch: number = 1.0): string => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const octaves = [3, 4, 5, 6]
    
    const noteIndex = choseong % notes.length
    const octaveIndex = Math.floor(choseong / 5) % octaves.length
    const baseOctave = octaves[octaveIndex]
    const adjustedOctave = Math.min(6, Math.max(2, Math.round(baseOctave * pitch)))
    
    return `${notes[noteIndex]}${adjustedOctave}`
  }

  const jungseongToSynth = (jungseong: number) => {
    const synthTypes = ['sine', 'sawtooth', 'square', 'triangle']
    return synthTypes[jungseong % synthTypes.length]
  }

  const jongseongToDrum = (jongseong: number): boolean => {
    return jongseong > 0 && jongseong % 3 === 0
  }

  const shouldPlayBass = (): boolean => {
    return Math.random() > 0.7
  }

  const initializeAudio = async () => {
    if (isAudioStarted.current) return
    
    try {
      await Tone.start()
      console.log('[🎵 Tone.js 시작됨]')
      
      masterGainRef.current = new Tone.Gain(masterVolume).toDestination()
      
      reverbRef.current = new Tone.Reverb({
        decay: 4,
        wet: 0.3
      }).connect(masterGainRef.current)
      
      delayRef.current = new Tone.PingPongDelay({
        delayTime: "8n",
        feedback: 0.3,
        wet: 0.2
      }).connect(reverbRef.current)
      
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.8 },
        volume: Tone.gainToDb(synthVolume)
      }).connect(delayRef.current)
      
      bassRef.current = new Tone.MonoSynth({
        oscillator: { type: "square" },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.8, release: 1 },
        filter: { Q: 2, frequency: 300 },
        volume: Tone.gainToDb(bassVolume)
      }).connect(reverbRef.current)
      
      drumRef.current = new Tone.NoiseSynth({
        noise: { type: "brown" },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0 },
        volume: Tone.gainToDb(drumVolume)
      }).connect(reverbRef.current)
      
      isAudioStarted.current = true
      console.log('[🎵 오디오 체인 초기화 완료]')
    } catch (error) {
      console.error('[❌ Tone.js 초기화 실패]', error)
    }
  }

  const playMusic = async (word: string, pitch: number = 1.0) => {
    if (!musicEnabled || !isAudioStarted.current) return
    
    try {
      for (let i = 0; i < word.length; i++) {
        const char = word[i]
        const decomposed = decomposeHangul(char)
        
        if (!decomposed) continue
        
        const { choseong, jungseong, jongseong } = decomposed
        const note = choseongToNote(choseong, pitch)
        const bassNote = choseongToNote(choseong, pitch * 0.5)
        const synthType = jungseongToSynth(jungseong)
        const shouldDrum = jongseongToDrum(jongseong)
        const playBass = shouldPlayBass()
        
        if (synthRef.current) {
          synthRef.current.set({ 
            oscillator: { 
              type: synthType as any 
            } 
          })
          synthRef.current.triggerAttackRelease(note, "8n")
        }
        
        if (bassRef.current && playBass) {
          bassRef.current.triggerAttackRelease(bassNote, "4n")
        }
        
        if (drumRef.current && shouldDrum) {
          drumRef.current.triggerAttackRelease("16n")
        }
        
        console.log(`[🎵 한글 음악] ${char}: 초성${choseong}→${note}, 중성${jungseong}→${synthType}, 종성${jongseong}→${shouldDrum ? 'drum' : 'silent'}`)
        
        if (i < word.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    } catch (error) {
      console.warn('[⚠️ 음악 재생 실패]', error)
    }
  }

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = masterVolume
    }
  }, [masterVolume])

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.value = Tone.gainToDb(synthVolume)
    }
  }, [synthVolume])

  useEffect(() => {
    if (bassRef.current) {
      bassRef.current.volume.value = Tone.gainToDb(bassVolume)
    }
  }, [bassVolume])

  useEffect(() => {
    if (drumRef.current) {
      drumRef.current.volume.value = Tone.gainToDb(drumVolume)
    }
  }, [drumVolume])

  useEffect(() => {
    if (isAudioStarted.current) {
      Tone.getTransport().bpm.value = currentBpm
    }
  }, [currentBpm])

  return {
    initializeAudio,
    playMusic,
    isAudioStarted: isAudioStarted.current,
  }
}