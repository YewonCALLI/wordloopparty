// components/ControlPanel.tsx
'use client'

import { useState } from 'react'
import AudioControls from './AudioControls'
import WordPitchControls from './WordPitchControls'
import BPMControls from './BPMControls'

interface ControlPanelProps {
  // Audio Controls
  musicEnabled: boolean
  setMusicEnabled: (enabled: boolean) => void
  masterVolume: number
  setMasterVolume: (volume: number) => void
  synthVolume: number
  setSynthVolume: (volume: number) => void
  bassVolume: number
  setBassVolume: (volume: number) => void
  drumVolume: number
  setDrumVolume: (volume: number) => void

  // BPM Controls
  bpm: number
  setBpm: (bpm: number) => void
  currentBpm: number
  autoAccelerate: boolean
  setAutoAccelerate: (accelerate: boolean) => void
  bpmToInterval: (bpm: number) => number

  // Word Pitch Controls
  userWords: string[]
  wordPitches: {[key: string]: number}
  getWordPitch: (word: string) => number
  setWordPitch: (word: string, pitch: number) => void
  setWordPitches: React.Dispatch<React.SetStateAction<{[key: string]: number}>>
  isAudioStarted: boolean
  playWordWithMusic: (word: string, speechRate: number, pitch: number) => Promise<void>
  playMusic: (word: string, pitch: number) => Promise<void>

  // Audio Start
  handleStartAudio: () => Promise<void>
}

export default function ControlPanel({
  musicEnabled,
  setMusicEnabled,
  masterVolume,
  setMasterVolume,
  synthVolume,
  setSynthVolume,
  bassVolume,
  setBassVolume,
  drumVolume,
  setDrumVolume,
  bpm,
  setBpm,
  currentBpm,
  autoAccelerate,
  setAutoAccelerate,
  bpmToInterval,
  userWords,
  wordPitches,
  getWordPitch,
  setWordPitch,
  setWordPitches,
  isAudioStarted,
  playWordWithMusic,
  playMusic,
  handleStartAudio
}: ControlPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'audio' | 'bpm'>('audio')

  const togglePanel = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* 토글 버튼 */}
      <button
        onClick={togglePanel}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 bg-white hover:bg-white-500 text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'rotate-180' : ''
        }`}
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="black" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 15l7-7 7 7" 
          />
        </svg>
      </button>

      {/* 컨트롤 패널 */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white/10 transparent opacity-200 backdrop-blur-sm border-t border-white-500/30 transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '70vh' }}
      >
        <div className="max-w-6xl mx-auto">
          {/* 핸들바 */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1 bg-white-500/50 rounded-full"></div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex space-x-1 mb-6 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex-1 py-3 px-4 font-medium transition-all ${
                activeTab === 'audio'
                  ? 'text-white border border-white'
                  : 'text-white hover:text-black hover:bg-white'
              }`}
            >
              오디오
            </button>
            <button
              onClick={() => setActiveTab('bpm')}
              className={`flex-1 py-3 px-4 font-medium transition-all ${
                activeTab === 'bpm'
                  ? 'text-white border border-white'
                  : 'text-white hover:text-black hover:bg-white'
              }`}
            >
             BPM
            </button>

          </div>

          {/* 탭 컨텐츠 */}
          <div className="overflow-y-auto" style={{ maxHeight: '40vh' }}>
            {activeTab === 'audio' && (
              <div className="space-y-4 text-black">
                <AudioControls
                  musicEnabled={musicEnabled}
                  setMusicEnabled={setMusicEnabled}
                  ttsEnabled={true}
                  setTtsEnabled={() => {}}
                  masterVolume={masterVolume}
                  setMasterVolume={setMasterVolume}
                  synthVolume={synthVolume}
                  setSynthVolume={setSynthVolume}
                  bassVolume={bassVolume}
                  setBassVolume={setBassVolume}
                  drumVolume={drumVolume}
                  setDrumVolume={setDrumVolume}
                />
              </div>
            )}

            {activeTab === 'bpm' && (
              <div className="space-y-4 text-black">
                <BPMControls
                  bpm={bpm}
                  setBpm={setBpm}
                  currentBpm={currentBpm}
                  autoAccelerate={autoAccelerate}
                  setAutoAccelerate={setAutoAccelerate}
                  musicEnabled={musicEnabled}
                  ttsEnabled={true}
                  bpmToInterval={bpmToInterval}
                />
              </div>
            )}

          </div>
        </div>
      </div>

      {/* 배경 오버레이 (패널이 열려있을 때) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={togglePanel}
        />
      )}
    </>
  )
}