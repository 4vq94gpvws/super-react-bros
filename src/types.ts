export type GameStatus = 'menu' | 'playing' | 'gameover' | 'win'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface Player extends Rect {
  vx: number
  vy: number
  onGround: boolean
  facingRight: boolean
  invincible: number
  dead: boolean
}

export interface Enemy extends Rect {
  vx: number
  vy: number
  dead: boolean
  id: number
}

export interface Coin extends Rect {
  collected: boolean
  id: number
}

export interface Solid extends Rect {
  type: 'ground' | 'brick' | 'question' | 'pipe' | 'platform'
}

export interface Level {
  solids: Solid[]
  coins: Coin[]
  enemies: Enemy[]
  flagX: number
  startX: number
  startY: number
}

export interface GameData {
  status: GameStatus
  player: Player
  level: Level
  score: number
  coins: number
  lives: number
  cameraX: number
  time: number
}
