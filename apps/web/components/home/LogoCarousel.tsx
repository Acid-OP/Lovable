const companies = [
  "Google",
  "Meta",
  "Amazon",
  "Microsoft",
  "Apple",
  "Netflix",
  "Uber",
  "Airbnb",
];

export function LogoCarousel() {
  return (
    <div className="mt-12 sm:mt-16 lg:mt-20">
      <p className="text-center text-[14px] text-gray-500 mb-8 font-medium tracking-wide">
        TRUSTED BY DEVELOPERS FROM
      </p>
      <div className="logo-carousel-container">
        <div className="logo-carousel">
          {/* First set of logos */}
          {companies.map((company) => (
            <div key={company} className="logo-item">
              {company}
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {companies.map((company) => (
            <div key={`${company}-duplicate`} className="logo-item">
              {company}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
