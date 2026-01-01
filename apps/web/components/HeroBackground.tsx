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
      {/* Overlay for better text readability - soft for snowy mountains */}
      <div className="absolute inset-0 bg-linear-to-b from-blue-900/10 via-purple-900/5 to-blue-900/20"></div>
    </div>
  );
}

