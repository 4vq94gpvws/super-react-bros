import { TILE_SIZE, CANVAS_HEIGHT } from '../constants'
import type { Level, Solid, Coin, Enemy } from '../types'

let idCounter = 0

function solid(x: number, y: number, w: number, h: number, type: Solid['type']): Solid {
  return {
    x: x * TILE_SIZE,
    y: y * TILE_SIZE,
    w: w * TILE_SIZE,
    h: h * TILE_SIZE,
    type,
  }
}

function coin(x: number, y: number): Coin {
  return {
    x: x * TILE_SIZE + 8,
    y: y * TILE_SIZE + 8,
    w: 16,
    h: 16,
    collected: false,
    id: ++idCounter,
  }
}

function enemy(x: number, y: number): Enemy {
  return {
    x: x * TILE_SIZE,
    y: y * TILE_SIZE - 28,
    w: 28,
    h: 28,
    vx: 1,
    vy: 0,
    dead: false,
    id: ++idCounter,
  }
}

export function buildLevel(): Level {
  const solids: Solid[] = []
  const coins: Coin[] = []
  const enemies: Enemy[] = []

  // Ground segments (tile x ranges). Gaps require jumps.
  const groundSegments = [
    [0, 20],
    [25, 45],
    [50, 70],
    [75, 95],
    [100, 119],
  ]
  groundSegments.forEach(([start, end]) => {
    for (let x = start; x <= end; x++) {
      solids.push(solid(x, 13, 1, 2, 'ground'))
    }
  })

  // Brick & question blocks
  const blocks: [number, number, Solid['type']][] = [
    [10, 9, 'brick'],
    [11, 9, 'question'],
    [12, 9, 'brick'],
    [14, 6, 'brick'],
    [15, 6, 'question'],
    [16, 6, 'brick'],
    [35, 9, 'brick'],
    [36, 9, 'question'],
    [37, 9, 'brick'],
    [60, 9, 'brick'],
    [61, 9, 'question'],
    [62, 9, 'brick'],
    [82, 6, 'brick'],
    [83, 6, 'question'],
    [84, 6, 'brick'],
  ]
  blocks.forEach(([x, y, t]) => solids.push(solid(x, y, 1, 1, t)))

  // Floating platforms
  const platforms: [number, number, number][] = [
    [22, 10, 3],
    [46, 10, 3],
    [71, 10, 3],
    [96, 10, 3],
    [30, 7, 4],
    [55, 7, 4],
    [80, 7, 4],
    [105, 9, 4],
  ]
  platforms.forEach(([x, y, w]) => solids.push(solid(x, y, w, 1, 'platform')))

  // Pipes (x, y tile, height in tiles)
  const pipes: [number, number, number][] = [
    [15, 11, 2],
    [30, 11, 2],
    [55, 11, 2],
    [80, 11, 2],
  ]
  pipes.forEach(([x, y, h]) => solids.push(solid(x, y, 2, h, 'pipe')))

  // Coins
  const coinPositions: [number, number][] = [
    [10.5, 8],
    [11.5, 8],
    [12.5, 8],
    [22, 9],
    [23, 9],
    [24, 9],
    [35.5, 8],
    [36.5, 8],
    [37.5, 8],
    [46, 9],
    [47, 9],
    [48, 9],
    [60.5, 8],
    [61.5, 8],
    [62.5, 8],
    [71, 9],
    [72, 9],
    [73, 9],
    [82.5, 7],
    [83.5, 7],
    [84.5, 7],
    [96, 9],
    [97, 9],
    [98, 9],
    [105, 8],
    [106, 8],
    [107, 8],
  ]
  coinPositions.forEach(([x, y]) => coins.push(coin(x, y)))

  // Goomba-like enemies
  const enemyPositions: [number, number][] = [
    [8, 13],
    [28, 13],
    [38, 13],
    [52, 13],
    [65, 13],
    [78, 13],
    [88, 13],
    [108, 13],
  ]
  enemyPositions.forEach(([x, y]) => enemies.push(enemy(x, y)))

  return {
    solids,
    coins,
    enemies,
    flagX: 115,
    startX: 2 * TILE_SIZE,
    startY: 11 * TILE_SIZE,
  }
}
