interface Props {
  score: number
  coins: number
  onRestart: () => void
}

export default function WinScreen({ score, coins, onRestart }: Props) {
  return (
    <div className="overlay win">
      <h2>Gewonnen!</h2>
      <p>
        Je hebt de vlag bereikt.
        <br />
        Score: {score} &nbsp;|&nbsp; Munten: {coins}
      </p>
      <button onClick={onRestart}>Speel opnieuw</button>
    </div>
  )
}
