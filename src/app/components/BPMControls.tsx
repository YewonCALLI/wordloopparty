// components/BPMControls.tsx
'use client'

interface BPMControlsProps {
  bpm: number
  setBpm: (bpm: number) => void
  currentBpm: number
  autoAccelerate: boolean
  setAutoAccelerate: (accelerate: boolean) => void
  musicEnabled: boolean
  ttsEnabled: boolean
  bpmToInterval: (bpm: number) => number
}

export default function BPMControls({
  bpm,
  setBpm,
  currentBpm,
  autoAccelerate,
  setAutoAccelerate,
  musicEnabled,
  ttsEnabled,
  bpmToInterval,
}: BPMControlsProps) {
  return (
    <div className="mb-6 p-6 bg-gray-900 border-2 border-red-500 rounded-lg shadow-2xl">
      <div className="flex flex-col gap-6">
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
            
            현재: {currentBpm} BPM

        </div>
        
      </div>
    </div>
  )
}