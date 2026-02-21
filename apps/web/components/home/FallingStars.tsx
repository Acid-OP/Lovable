export function FallingStars() {
  const stars = [
    { startX: -350, delay: 0 },
    { startX: -280, delay: 1.2 },
    { startX: -420, delay: 2.5 },
    { startX: -310, delay: 3.8 },
    { startX: -370, delay: 5.1 },
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
            opacity: 0,
            animationName: "starToMountain",
            animationDuration: "4s",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDelay: `${star.delay}s`,
            animationFillMode: "forwards",
          }}
        />
      ))}
    </>
  );
}
