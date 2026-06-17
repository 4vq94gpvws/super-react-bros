interface Props {
  score: number
  coins: number
  onRestart: () => void
}

export default function GameOverScreen({ score, coins, onRestart }: Props) {
  return (
    <div className="overlay gameover">
      <h2>Game Over</h2>
      <p>
        Score: {score} &nbsp;|&nbsp; Munten: {coins}
        <br />
        Druk op Enter of klik op Opnieuw.
      </p>
      <button onClick={onRestart}>Opnieuw spelen</button>
    </div>
  )
}
