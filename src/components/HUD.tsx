interface HUDProps {
  score: number
  coins: number
  lives: number
  time: number
}

export default function HUD({ score, coins, lives, time }: HUDProps) {
  return (
    <div className="hud">
      <span>Score {score.toString().padStart(6, '0')}</span>
      <span>🪙 {coins}</span>
      <span>❤️ {lives}</span>
      <span>Time {time.toString().padStart(3, '0')}</span>
    </div>
  )
}
