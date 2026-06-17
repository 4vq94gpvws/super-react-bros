interface Props {
  onStart: () => void
}

export default function StartScreen({ onStart }: Props) {
  return (
    <div className="overlay">
      <h1>Super React Bros</h1>
      <p>
        Een klassieke side-scrolling platformer gebouwd in React.
        <br />
        Loop, spring over gaten, verzamel munten, stamp op Goomba's en bereik de vlag!
      </p>
      <button onClick={onStart}>Start spel</button>
    </div>
  )
}
