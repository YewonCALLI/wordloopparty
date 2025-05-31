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
    <div className="mb-6 p-4  border border-gray-600 rounded-lg">
      <h4 className="text-lg font-bold text-white mb-3">오디오 설정</h4>
      

      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <label className="text-white  min-w-20">master</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={masterVolume}
            onChange={(e) => setMasterVolume(Number(e.target.value))}
            className="flex-1 h-3 border border-white rounded-lg appearance-none cursor-pointer accent-white"
          />
          <span className="text-white font-mono w-12 text-sm">
            {(masterVolume * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-white min-w-20">synthe</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={synthVolume}
            onChange={(e) => setSynthVolume(Number(e.target.value))}
            className="flex-1 h-2 border border-white rounded-lg appearance-none cursor-pointer accent-white"
          />
          <span className="text-white font-mono w-12 text-sm">
            {(synthVolume * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-white min-w-20">base</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={bassVolume}
            onChange={(e) => setBassVolume(Number(e.target.value))}
            className="flex-1 h-2 border border-white rounded-lg appearance-none cursor-pointer accent-white"
          />
          <span className="text-white font-mono w-12 text-sm">
            {(bassVolume * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-white min-w-20">drum</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={drumVolume}
            onChange={(e) => setDrumVolume(Number(e.target.value))}
            className="flex-1 h-2 border border-white rounded-lg appearance-none cursor-pointer accent-white"
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
            className="px-3 py-2 text-white text-sm rounded"
          >
            quiet
          </button>
          
          <button
            onClick={() => {
              setMasterVolume(0.3)
              setSynthVolume(0.4)
              setBassVolume(0.5)
              setDrumVolume(0.3)
            }}
            className="px-3 py-2 text-white text-sm rounded"
          >
            init
          </button>
          
          <button
            onClick={() => {
              setMasterVolume(0.6)
              setSynthVolume(0.7)
              setBassVolume(0.8)
              setDrumVolume(0.6)
            }}
            className="px-3 py-2 text-white text-sm rounded"
          >
            for party
          </button>

          <button
            onClick={() => {
              setMasterVolume(0)
              setSynthVolume(0)
              setBassVolume(0)
              setDrumVolume(0)
            }}
            className="px-3 py-2 text-white text-sm rounded"
          >
            silence
          </button>
        </div>
      </div>
    </div>
  )
}