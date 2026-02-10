export function FallingStars() {
  const starOffsets = [-500, -412, -325, -237, -150];

  return (
    <>
      {starOffsets.map((offset, i) => (
        <div
          key={i}
          className="star-with-trail"
          style={{
            position: "absolute",
            left: `calc(50% + ${offset}px)`,
            top: "-20px",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            backgroundColor: "#444",
            animationName: "starFall",
            animationDuration: "4.5s",
            animationTimingFunction: "ease-in",
            animationIterationCount: "3",
            animationDelay: `${i * 0.5}s`,
            boxShadow: "0 0 4px 1px rgba(70, 70, 70, 0.4)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}
    </>
  );
}
