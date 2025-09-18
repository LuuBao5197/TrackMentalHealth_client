export default function GamePage() {
  return (
    <div style={{ width: "100%", height: "600px" }}>
      <iframe
        src="/game.html"
        title="Mini Game"
        style={{ width: "100%", height: "100%", border: "none" }}
      />
    </div>
  );
}
