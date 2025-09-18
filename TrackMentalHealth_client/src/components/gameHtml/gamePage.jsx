import React, { useState } from "react";
import { FaMousePointer } from "react-icons/fa"; // icon for "Click Game"
import { GiMeditation } from "react-icons/gi";   // icon for "Breathing"

const GamePage = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    { id: "clickgame", name: "Click Game", url: "/TrackMentalHealth/clickgame.html", icon: <FaMousePointer /> },
    { id: "breathing", name: "Breathing", url: "/TrackMentalHealth/breathing.html", icon: <GiMeditation /> },
  ];

  if (selectedGame) {
    return (
      <div style={{ height: "100vh" }}>
        <button
          onClick={() => setSelectedGame(null)}
          style={{
            margin: "10px",
            padding: "8px 16px",
            borderRadius: "8px",
            backgroundColor: "#f0f0f0",
            cursor: "pointer"
          }}
        >
          ← Back
        </button>
        <iframe
          src={selectedGame.url}
          style={{ width: "100%", height: "95%", border: "none" }}
          title={selectedGame.name}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Select a Game</h2>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => setSelectedGame(game)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "15px",
              padding: "20px 32px",       // tăng kích thước nút
              cursor: "pointer",
              border: "2px solid #ccc",   // viền rõ hơn
              borderRadius: "14px",
              backgroundColor: "#fff",
              fontSize: "20px",           // chữ lớn hơn
              fontWeight: "600",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              transition: "all 0.25s ease-in-out"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f9ff";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <span style={{ fontSize: "28px" }}>{game.icon}</span> {/* icon to hơn */}
            <span>{game.name}</span>
          </button>

        ))}
      </div>
    </div>
  );
};

export default GamePage;