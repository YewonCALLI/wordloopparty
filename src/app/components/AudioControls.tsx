// components/AudioControls.tsx
'use client'

interface AudioControlsProps {
  musicEnabled: boolean
  setMusicEnabled: (enabled: boolean) => void
  ttsEnabled: boolean
  setTtsEnabled: (enabled: boolean) => void
  masterVolume: number
  setMasterVolume: (volume: number) => void
  synthVolume: number
  setSynthVolume: (volume: number) => void
  bassVolume: number
  setBassVolume: (volume: number) => void
  drumVolume: number
  setDrumVolume: (volume: number) => void
}

export default function AudioControls({
  musicEnabled,
  setMusicEnabled,
  ttsEnabled,
  setTtsEnabled,
  masterVolume,
  setMasterVolume,
  synthVolume,
  setSynthVolume,
  bassVolume,
  setBassVolume,
  drumVolume,
  setDrumVolume,
}: AudioControlsProps) {
  return (
    <div className="mb-6 p-4 bg-gray-800 border border-gray-600 rounded-lg">
      <h4 className="text-lg font-bold text-white mb-3">🎛 오디오 설정</h4>
      
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={musicEnabled}
            onChange={(e) => setMusicEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-white">🎵 음악 (Tone.js)</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={ttsEnabled}
            onChange={(e) => setTtsEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-white">🗣 음성 (TTS)</span>
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <label className="text-white font-semibold min-w-20">🔊 마스터:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={masterVolume}
            onChange={(e) => setMasterVolume(Number(e.target.value))}
            className="flex-1 h-3 bg-gradient-to-r from-gray-600 to-blue-500 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-white font-mono w-12 text-sm">
            {(masterVolume * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-white font-semibold min-w-20">🎹 신스:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={synthVolume}
            onChange={(e) => setSynthVolume(Number(e.target.value))}
            className="flex-1 h-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-white font-mono w-12 text-sm">
            {(synthVolume * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-white font-semibold min-w-20">🎸 베이스:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={bassVolume}
            onChange={(e) => setBassVolume(Number(e.target.value))}
            className="flex-1 h-2 bg-gradient-to-r from-orange-600 to-red-500 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-white font-mono w-12 text-sm">
            {(bassVolume * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-white font-semibold min-w-20">🥁 드럼:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={drumVolume}
            onChange={(e) => setDrumVolume(Number(e.target.value))}
            className="flex-1 h-2 bg-gradient-to-r from-green-600 to-yellow-500 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-white font-mono w-12 text-sm">
            {(drumVolume * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setMasterVolume(0.1)
              setSynthVolume(0.2)
              setBassVolume(0.2)
              setDrumVolume(0.1)
            }}
            className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded"
          >
            🔇 조용히
          </button>
          
          <button
            onClick={() => {
              setMasterVolume(0.3)
              setSynthVolume(0.4)
              setBassVolume(0.5)
              setDrumVolume(0.3)
            }}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded"
          >
            🔊 기본값
          </button>
          
          <button
            onClick={() => {
              setMasterVolume(0.6)
              setSynthVolume(0.7)
              setBassVolume(0.8)
              setDrumVolume(0.6)
            }}
            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded"
          >
            🔥 파티!
          </button>

          <button
            onClick={() => {
              setMasterVolume(0)
              setSynthVolume(0)
              setBassVolume(0)
              setDrumVolume(0)
            }}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded"
          >
            🚫 음소거
          </button>
        </div>
      </div>
    </div>
  )
}