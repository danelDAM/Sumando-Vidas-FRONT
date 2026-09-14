import React from "react";

type SponsorCarouselProps = {
  images?: string[];
  speed?: number; // seconds per loop multiplier
};

export function SponsorCarousel({
  images = [
    "/images/sponsor1.png",
    "/images/sponsor2.png",
    "/images/sponsor3.png",
    "/images/sponsor4.png",
  ],
  speed = 6,
}: SponsorCarouselProps) {
  // duplicate images to create seamless loop
  const list = [...images, ...images];
  const duration = `${Math.max(12, images.length * speed)}s`;

  return (
    <div className="sponsor-marquee-viewport" aria-hidden="false">
      <div className="sponsor-marquee" style={{ ["--marquee-duration"]: duration } as React.CSSProperties}>
        <div
          className="sponsor-marquee-track"
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            alignItems: "center",
            gap: "18px",
            padding: "12px 24px",
            width: "max-content",
            animation: `marquee ${duration} linear infinite`,
            willChange: "transform",
            transform: "translateX(0)",
          }}
        >
          {list.map((src, i) => (
            <div
              className="sponsor-slide"
              key={i}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}
            >
              <img
                src={src}
                alt={`Patrocinador ${((i % images.length) + 1)}`}
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = "none";
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SponsorCarousel;
