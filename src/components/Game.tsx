import { useEffect, useRef, useState, useCallback } from 'react'
import { CANVAS_WIDTH, CANVAS_HEIGHT, WORLD_WIDTH } from '../constants'
import type { GameData, GameStatus, Player } from '../types'
import { buildLevel } from '../utils/level'
import { updateGame } from '../utils/physics'
import { drawGame } from '../utils/draw'
import HUD from './HUD'
import StartScreen from './StartScreen'
import GameOverScreen from './GameOverScreen'
import WinScreen from './WinScreen'

function createPlayer(x: number, y: number): Player {
  return {
    x,
    y,
    w: 24,
    h: 32,
    vx: 0,
    vy: 0,
    onGround: false,
    facingRight: true,
    invincible: 0,
    dead: false,
  }
}

function createGameData(): GameData {
  const level = buildLevel()
  return {
    status: 'playing',
    player: createPlayer(level.startX, level.startY),
    level,
    score: 0,
    coins: 0,
    lives: 3,
    cameraX: 0,
    time: 0,
  }
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<GameStatus>('menu')
  const [hud, setHud] = useState({ score: 0, coins: 0, lives: 3, time: 0 })
  const gameRef = useRef<GameData>(createGameData())
  const keysRef = useRef<Set<string>>(new Set())
  const rafRef = useRef<number | null>(null)

  const updateHud = useCallback((g: GameData) => {
    setHud((prev) => {
      const t = Math.floor(g.time)
      if (
        prev.score === g.score &&
        prev.coins === g.coins &&
        prev.lives === g.lives &&
        prev.time === t
      ) {
        return prev
      }
      return { score: g.score, coins: g.coins, lives: g.lives, time: t }
    })
  }, [])

  const startGame = () => {
    gameRef.current = createGameData()
    setHud({ score: 0, coins: 0, lives: 3, time: 0 })
    setStatus('playing')
    canvasRef.current?.focus()
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)
      ) {
        e.preventDefault()
      }
      keysRef.current.add(e.key)

      if (e.key === ' ' && status === 'menu') startGame()
      if (
        (e.key === 'Enter' || e.key === ' ') &&
        (status === 'gameover' || status === 'win')
      ) {
        startGame()
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [status])

  useEffect(() => {
    if (status !== 'playing') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      return
    }

    let last = performance.now()
    let accumulator = 0
    const step = 1000 / 60

    const loop = (t: number) => {
      const dtRaw = t - last
      last = t
      accumulator += Math.min(dtRaw, 50)

      while (accumulator >= step) {
        updateGame(gameRef.current, keysRef.current)
        accumulator -= step
      }

      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) drawGame(ctx, gameRef.current)
      updateHud(gameRef.current)

      if (gameRef.current.status !== 'playing') {
        setStatus(gameRef.current.status)
        return
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [status, updateHud])

  return (
    <div className="game-container">
      <HUD {...hud} />
      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          tabIndex={0}
          className="game-canvas"
        />
        {status === 'menu' && <StartScreen onStart={startGame} />}
        {status === 'gameover' && (
          <GameOverScreen
            score={hud.score}
            coins={hud.coins}
            onRestart={startGame}
          />
        )}
        {status === 'win' && (
          <WinScreen score={hud.score} coins={hud.coins} onRestart={startGame} />
        )}
      </div>
      <div className="controls-hint">
        ← → lopen · ↑ / spatie springen · Enter herstarten
      </div>
    </div>
  )
}
