import React, { useEffect, useMemo, useRef, useState } from 'react'

type MetronomeState = 'stopped' | 'playing'

function createAudioContext() {
	const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext
	return new Ctx()
}

function playClick(audioContext: AudioContext, isStrong: boolean) {
	const oscillator = audioContext.createOscillator()
	const gainNode = audioContext.createGain()

	// Strong beat slightly higher pitch and louder
	oscillator.type = 'square'
	oscillator.frequency.value = isStrong ? 1200 : 900

	const now = audioContext.currentTime
	const duration = 0.03
	const peak = isStrong ? 0.6 : 0.45

	gainNode.gain.setValueAtTime(0.0001, now)
	gainNode.gain.exponentialRampToValueAtTime(peak, now + 0.005)
	gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration)

	oscillator.connect(gainNode)
	gainNode.connect(audioContext.destination)

	oscillator.start(now)
	oscillator.stop(now + duration)
}

function getRandomIntInclusive(min: number, max: number) {
	const low = Math.ceil(min)
	const high = Math.floor(max)
	return Math.floor(Math.random() * (high - low + 1)) + low
}

export function App() {
	const [lowestBpm, setLowestBpm] = useState<number>(60)
	const [highestBpm, setHighestBpm] = useState<number>(120)
	const [state, setState] = useState<MetronomeState>('stopped')
	const [currentBpm, setCurrentBpm] = useState<number | null>(null)

	const audioContextRef = useRef<AudioContext | null>(null)
	const nextTimerRef = useRef<number | null>(null)
	const strongBeatToggleRef = useRef<boolean>(true)
	const isPlayingRef = useRef<boolean>(false)

	useEffect(() => {
		return () => {
			if (nextTimerRef.current !== null) {
				window.clearTimeout(nextTimerRef.current)
				nextTimerRef.current = null
			}
			if (audioContextRef.current) {
				audioContextRef.current.close().catch(() => undefined)
			}
		}
	}, [])

	const clampedLowest = useMemo(() => Math.max(20, Math.min(300, lowestBpm || 0)), [lowestBpm])
	const clampedHighest = useMemo(() => Math.max(clampedLowest, Math.min(300, highestBpm || 0)), [clampedLowest, highestBpm])

	function scheduleNextTick() {
		// Choose random BPM for the NEXT interval
		const bpm = getRandomIntInclusive(clampedLowest, clampedHighest)
		setCurrentBpm(bpm)
		const msPerBeat = 60000 / bpm

		// flip strong/weak for a tick-tock feel
		strongBeatToggleRef.current = !strongBeatToggleRef.current

		// Play immediately at schedule call time
		if (!audioContextRef.current) return
		playClick(audioContextRef.current, strongBeatToggleRef.current)

		// schedule next
		nextTimerRef.current = window.setTimeout(() => {
			if (!isPlayingRef.current) return
			scheduleNextTick()
		}, msPerBeat)
	}

	async function start() {
		if (state === 'playing') return
		if (!audioContextRef.current) {
			audioContextRef.current = createAudioContext()
		}
		// Required on some browsers to resume after user gesture
		await audioContextRef.current.resume()
		isPlayingRef.current = true
		setState('playing')
		// kick off immediately
		scheduleNextTick()
	}

	function stop() {
		isPlayingRef.current = false
		setState('stopped')
		setCurrentBpm(null)
		if (nextTimerRef.current !== null) {
			window.clearTimeout(nextTimerRef.current)
			nextTimerRef.current = null
		}
	}

	return (
		<div className="app">
			<div className="card">
				<h2 className="title">Random BPM Metronome</h2>
				<p className="subtitle">Every tick picks a new BPM between your low/high bounds.</p>
				<div className="grid">
					<label className="field">
						<span className="label">Lowest BPM</span>
						<input className="input" type="number" min={20} max={300} value={lowestBpm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLowestBpm(Number(e.target.value))} />
					</label>
					<label className="field">
						<span className="label">Highest BPM</span>
						<input className="input" type="number" min={20} max={300} value={highestBpm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHighestBpm(Number(e.target.value))} />
					</label>
				</div>
				<div className="actions">
					<button className="btn" onClick={start} disabled={state === 'playing'}>Play</button>
					<button className="btn secondary" onClick={stop} disabled={state === 'stopped'}>Stop</button>
				</div>
				<div className="bpmRow">
					<div>
						<div className="muted">Current BPM</div>
						<div className="bpmValue">{currentBpm ?? '—'}</div>
					</div>
					<div className="rangeNote muted">Range: {clampedLowest}–{clampedHighest} BPM</div>
				</div>
			</div>
		</div>
	)
}


