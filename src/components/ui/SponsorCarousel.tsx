type SponsorCarouselProps = {
  images?: string[];
  speed?: number;
};

export function SponsorCarousel({
  images = ["/images/sponsor1.png", "/images/toggaLogo.png"],
  speed = 40,
}: SponsorCarouselProps) {
  const validImages = images.filter(Boolean);
  const duration = `${Math.max(12, validImages.length * speed)}s`;

  return (
    <div className="sponsor-marquee-viewport" aria-label="Patrocinadores">
      <div className="sponsor-marquee" style={{ "--marquee-duration": duration } as React.CSSProperties}>
        {[0, 1].map((groupIndex) => (
          <div className="sponsor-marquee-group" key={groupIndex} aria-hidden={groupIndex === 1}>
            {validImages.map((src, index) => (
              <div className="sponsor-slide" key={`${groupIndex}-${src}-${index}`}>
                <img
                  className={src.includes("toggaLogo") ? "sponsor-logo-togga" : undefined}
                  src={src}
                  alt={groupIndex === 0 ? `Patrocinador ${index + 1}` : ""}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SponsorCarousel;
