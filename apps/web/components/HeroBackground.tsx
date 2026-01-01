interface HeroBackgroundProps {
  imageUrl: string;
}

export default function HeroBackground({ imageUrl }: HeroBackgroundProps) {
  return (
    <div 
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('${imageUrl}')`,
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/40"></div>
    </div>
  );
}

