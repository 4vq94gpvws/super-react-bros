import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from '../constants'
import type { GameData, Player, Enemy, Coin, Solid } from '../types'

export function drawGame(ctx: CanvasRenderingContext2D, game: GameData) {
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  drawSky(ctx)
  const cam = game.cameraX

  drawSolids(ctx, game.level.solids, cam)
  drawCoins(ctx, game.level.coins, cam)
  drawEnemies(ctx, game.level.enemies, cam)
  drawFlag(ctx, game.level.flagX * TILE_SIZE, 3 * TILE_SIZE, cam)
  drawPlayer(ctx, game.player, cam)
}

function drawSky(ctx: CanvasRenderingContext2D) {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
  grad.addColorStop(0, '#5c94fc')
  grad.addColorStop(1, '#a8d0fc')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // Pixel clouds
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  drawCloud(ctx, 80, 60, 3)
  drawCloud(ctx, 360, 90, 2)
  drawCloud(ctx, 560, 50, 3)
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const s = scale
  ctx.fillRect(x, y + 8 * s, 24 * s, 8 * s)
  ctx.fillRect(x + 4 * s, y, 16 * s, 8 * s)
  ctx.fillRect(x + 8 * s, y - 8 * s, 8 * s, 8 * s)
}

function drawSolids(ctx: CanvasRenderingContext2D, solids: Solid[], cam: number) {
  for (const s of solids) {
    const x = Math.floor(s.x - cam)
    if (x + s.w < 0 || x > CANVAS_WIDTH) continue
    const y = Math.floor(s.y)

    if (s.type === 'ground') {
      ctx.fillStyle = '#00aa00'
      ctx.fillRect(x, y, s.w, 8)
      ctx.fillStyle = '#8b4513'
      ctx.fillRect(x, y + 8, s.w, s.h - 8)
      ctx.fillStyle = '#5d2e0c'
      for (let i = 0; i < s.w; i += 16) {
        ctx.fillRect(x + i, y + 16, 2, s.h - 16)
      }
    } else if (s.type === 'brick') {
      ctx.fillStyle = '#b84a22'
      ctx.fillRect(x, y, s.w, s.h)
      ctx.strokeStyle = '#5a1f0d'
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, s.w, s.h)
      ctx.beginPath()
      ctx.moveTo(x, y + s.h / 2)
      ctx.lineTo(x + s.w, y + s.h / 2)
      ctx.moveTo(x + s.w / 2, y)
      ctx.lineTo(x + s.w / 2, y + s.h / 2)
      ctx.stroke()
    } else if (s.type === 'question') {
      ctx.fillStyle = '#ffcc00'
      ctx.fillRect(x, y, s.w, s.h)
      ctx.strokeStyle = '#b8860b'
      ctx.lineWidth = 3
      ctx.strokeRect(x, y, s.w, s.h)
      ctx.fillStyle = '#b8860b'
      ctx.font = 'bold 18px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('?', x + s.w / 2, y + s.h / 2 + 1)
    } else if (s.type === 'pipe') {
      ctx.fillStyle = '#00aa00'
      ctx.fillRect(x, y, s.w, s.h)
      ctx.fillStyle = '#007700'
      ctx.fillRect(x + s.w - 10, y, 10, s.h)
      // Pipe lip
      ctx.fillStyle = '#00cc00'
      ctx.fillRect(x - 4, y, s.w + 8, 12)
      ctx.fillStyle = '#008800'
      ctx.fillRect(x + s.w - 6, y, 6, 12)
    } else if (s.type === 'platform') {
      ctx.fillStyle = '#d2691e'
      ctx.fillRect(x, y, s.w, s.h)
      ctx.fillStyle = '#8b4513'
      ctx.fillRect(x, y + s.h - 4, s.w, 4)
    }
  }
}

function drawCoins(ctx: CanvasRenderingContext2D, coins: Coin[], cam: number) {
  for (const c of coins) {
    if (c.collected) continue
    const x = Math.floor(c.x - cam)
    const y = Math.floor(c.y)
    if (x + c.w < 0 || x > CANVAS_WIDTH) continue

    ctx.fillStyle = '#ffcc00'
    ctx.beginPath()
    ctx.ellipse(x + c.w / 2, y + c.h / 2, c.w / 2, c.h / 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#b8860b'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#fff7cc'
    ctx.fillRect(x + 4, y + 4, 4, 4)
  }
}

function drawEnemies(ctx: CanvasRenderingContext2D, enemies: Enemy[], cam: number) {
  for (const e of enemies) {
    if (e.dead) continue
    const x = Math.floor(e.x - cam)
    const y = Math.floor(e.y)
    if (x + e.w < 0 || x > CANVAS_WIDTH) continue

    // Body
    ctx.fillStyle = '#8b4513'
    ctx.fillRect(x + 2, y + 4, e.w - 4, e.h - 8)
    // Feet
    ctx.fillStyle = '#3e1d0a'
    const footW = 8
    const step = Math.floor(Date.now() / 120) % 2 === 0
    ctx.fillRect(x + 4 + (step ? 2 : 0), y + e.h - 4, footW, 4)
    ctx.fillRect(x + e.w - 12 - (step ? 2 : 0), y + e.h - 4, footW, 4)
    // Eyes
    ctx.fillStyle = '#fff'
    ctx.fillRect(x + 6, y + 8, 6, 8)
    ctx.fillRect(x + e.w - 12, y + 8, 6, 8)
    ctx.fillStyle = '#000'
    ctx.fillRect(x + 8 + (e.vx > 0 ? 2 : 0), y + 10, 3, 4)
    ctx.fillRect(x + e.w - 10 + (e.vx > 0 ? 2 : 0), y + 10, 3, 4)
    // Eyebrows
    ctx.fillStyle = '#000'
    ctx.fillRect(x + 5, y + 6, 8, 2)
    ctx.fillRect(x + e.w - 13, y + 6, 8, 2)
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player, cam: number) {
  const x = Math.floor(player.x - cam)
  const y = Math.floor(player.y)
  const w = player.w
  const h = player.h

  // Blink while invincible
  if (player.invincible > 0 && Math.floor(Date.now() / 80) % 2 === 0) return

  // Shoes
  ctx.fillStyle = '#5c2e08'
  ctx.fillRect(x + 2, y + h - 6, 10, 6)
  ctx.fillRect(x + w - 12, y + h - 6, 10, 6)

  // Overalls
  ctx.fillStyle = '#0044cc'
  ctx.fillRect(x + 4, y + h - 18, w - 8, 14)
  // Straps
  ctx.fillRect(x + 6, y + h - 22, 4, 6)
  ctx.fillRect(x + w - 10, y + h - 22, 4, 6)

  // Shirt / arms
  ctx.fillStyle = '#ff0000'
  ctx.fillRect(x, y + h - 26, w, 10)
  ctx.fillRect(player.facingRight ? x + w - 4 : x - 4, y + h - 24, 6, 6)

  // Head / face
  ctx.fillStyle = '#ffccaa'
  ctx.fillRect(x + 4, y + 8, w - 8, 14)

  // Hat
  ctx.fillStyle = '#ff0000'
  ctx.fillRect(x + 2, y, w - 4, 8)
  ctx.fillRect(player.facingRight ? x + w - 8 : x, y + 4, 10, 6)

  // Mustache / eyes
  ctx.fillStyle = '#000'
  ctx.fillRect(x + (player.facingRight ? w - 10 : 4), y + 16, 8, 3)
  ctx.fillStyle = '#000'
  ctx.fillRect(x + (player.facingRight ? w - 6 : 6), y + 12, 3, 4)
}

function drawFlag(ctx: CanvasRenderingContext2D, poleX: number, poleY: number, cam: number) {
  const x = Math.floor(poleX - cam)
  if (x < -20 || x > CANVAS_WIDTH + 20) return
  // Pole
  ctx.fillStyle = '#888'
  ctx.fillRect(x, poleY, 4, CANVAS_HEIGHT - poleY - 16)
  // Ball on top
  ctx.fillStyle = '#ffcc00'
  ctx.fillRect(x - 3, poleY - 6, 10, 10)
  // Flag
  ctx.fillStyle = '#ff004d'
  ctx.beginPath()
  ctx.moveTo(x + 4, poleY + 8)
  ctx.lineTo(x + 44, poleY + 28)
  ctx.lineTo(x + 4, poleY + 48)
  ctx.closePath()
  ctx.fill()
}
