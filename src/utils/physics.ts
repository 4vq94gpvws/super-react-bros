import {
  GRAVITY,
  MOVE_ACCEL,
  MAX_SPEED,
  JUMP_FORCE,
  FRICTION,
  BOUNCE,
  MAX_FALL,
  INVINCIBLE_TIME,
  CANVAS_HEIGHT,
  TILE_SIZE,
  CANVAS_WIDTH,
  WORLD_WIDTH,
} from '../constants'
import type { GameData, Player, Enemy, Solid } from '../types'

function rectsOverlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export function updateGame(game: GameData, keys: Set<string>) {
  if (game.status !== 'playing') return

  const { player, level } = game

  // Horizontal input
  if (player.invincible <= 0) {
    if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) {
      player.vx -= MOVE_ACCEL
      player.facingRight = false
    }
    if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) {
      player.vx += MOVE_ACCEL
      player.facingRight = true
    }
  }

  player.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, player.vx))

  const noInput =
    !keys.has('ArrowLeft') &&
    !keys.has('ArrowRight') &&
    !keys.has('a') &&
    !keys.has('A') &&
    !keys.has('d') &&
    !keys.has('D')

  if (noInput || player.invincible > 0) {
    player.vx *= FRICTION
    if (Math.abs(player.vx) < 0.1) player.vx = 0
  }

  // Jump
  if (
    (keys.has('ArrowUp') || keys.has(' ') || keys.has('w') || keys.has('W')) &&
    player.onGround
  ) {
    player.vy = JUMP_FORCE
    player.onGround = false
  }

  // Gravity
  player.vy += GRAVITY
  player.vy = Math.min(player.vy, MAX_FALL)

  // Horizontal movement & collision
  player.x += player.vx
  for (const s of level.solids) {
    if (rectsOverlap(player, s)) {
      if (player.vx > 0) player.x = s.x - player.w
      else if (player.vx < 0) player.x = s.x + s.w
      player.vx = 0
    }
  }

  // Vertical movement & collision
  player.y += player.vy
  player.onGround = false
  for (const s of level.solids) {
    if (rectsOverlap(player, s)) {
      if (player.vy > 0) {
        player.y = s.y - player.h
        player.onGround = true
      } else if (player.vy < 0) {
        player.y = s.y + s.h
        // Question block hit
        if (s.type === 'question') {
          s.type = 'brick'
          game.coins += 1
          game.score += 200
        }
      }
      player.vy = 0
    }
  }

  // World bounds
  if (player.x < 0) player.x = 0
  if (player.x + player.w > WORLD_WIDTH) player.x = WORLD_WIDTH - player.w

  // Invincibility frames
  if (player.invincible > 0) player.invincible--

  // Enemies
  for (const e of level.enemies) {
    if (e.dead) continue

    e.x += e.vx
    let hitWall = false
    for (const s of level.solids) {
      if (rectsOverlap(e, s)) {
        if (e.vx > 0) e.x = s.x - e.w
        else if (e.vx < 0) e.x = s.x + s.w
        e.vx *= -1
        hitWall = true
        break
      }
    }

    e.vy += GRAVITY
    e.vy = Math.min(e.vy, MAX_FALL)
    e.y += e.vy
    e.onGround = false
    for (const s of level.solids) {
      if (rectsOverlap(e, s)) {
        if (e.vy > 0) {
          e.y = s.y - e.h
          e.vy = 0
        } else if (e.vy < 0) {
          e.y = s.y + s.h
          e.vy = 0
        }
      }
    }

    // Turn around at platform edges
    if (!hitWall && e.vy === 0) {
      const frontX = e.vx > 0 ? e.x + e.w + 2 : e.x - 2
      const probe = { x: frontX, y: e.y + e.h + 4, w: 4, h: 8 }
      const hasGround = level.solids.some((s) => rectsOverlap(probe, s))
      if (!hasGround) e.vx *= -1
    }

    // Player interaction
    if (rectsOverlap(player, e)) {
      if (player.vy > 0 && player.y + player.h - player.vy <= e.y + 6) {
        e.dead = true
        player.vy = BOUNCE
        game.score += 100
      } else if (player.invincible <= 0) {
        game.lives--
        player.invincible = INVINCIBLE_TIME
        player.vy = -6
        player.vx = player.x < e.x ? -5 : 5
        if (game.lives <= 0) game.status = 'gameover'
      }
    }
  }

  // Coins
  for (const c of level.coins) {
    if (!c.collected && rectsOverlap(player, c)) {
      c.collected = true
      game.coins += 1
      game.score += 200
    }
  }

  // Win flag
  if (player.x + player.w >= level.flagX * TILE_SIZE) {
    game.status = 'win'
    game.score += 1000
  }

  // Fall into pit
  if (player.y > CANVAS_HEIGHT) {
    game.lives--
    if (game.lives <= 0) {
      game.status = 'gameover'
    } else {
      player.x = level.startX
      player.y = level.startY
      player.vx = 0
      player.vy = 0
      player.invincible = INVINCIBLE_TIME
    }
  }

  // Camera
  game.cameraX = Math.max(
    0,
    Math.min(player.x + player.w / 2 - CANVAS_WIDTH / 2, WORLD_WIDTH - CANVAS_WIDTH)
  )

  game.time += 1 / 60
}
