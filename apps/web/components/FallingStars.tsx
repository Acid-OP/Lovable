import React from "react";

export default function FallingStars() {
  // Stars fall from top, diagonally down to land exactly on mountain
  const stars = [
    { startX: -220, delay: 0 },
    { startX: -180, delay: 2.5 },
    { startX: -140, delay: 5 },
  ];

  return (
    <>
      {stars.map((star, i) => (
        <div
          key={i}
          className="star-with-trail-loader"
          style={{
            position: "absolute",
            left: `calc(50% + ${star.startX}px)`,
            top: "10px",
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            backgroundColor: "#333",
            boxShadow: "0 0 6px 2px rgba(50, 50, 50, 0.7)",
            pointerEvents: "none",
            zIndex: 0,
            animationName: "starToMountain",
            animationDuration: "4s",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </>
  );
}
