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
    <div className="mb-6 p-6 border-2 border-gray-600 rounded-lg shadow-2xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <label className="text-white min-w-16">BPM</label>
          <input
            type="range"
            min="30"
            max="1000"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="flex-1 h-4 border border-white rounded-lg appearance-none cursor-pointer accent-white"
            disabled={autoAccelerate}
          />
          <span className="font-mono text-white w-16">{bpm}</span>
            
            <span className="font-mono text-white">

                {currentBpm} BPM
            </span>

        </div>
        
      </div>
    </div>
  )
}