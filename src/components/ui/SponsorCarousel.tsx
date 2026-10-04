import type { PublicSponsor } from "../../services/publicData";

type SponsorCarouselProps = {
  sponsors: PublicSponsor[];
  speed?: number;
};

export function SponsorCarousel({
  sponsors,
  speed = 20,
}: SponsorCarouselProps) {
  const visibleSponsors = sponsors.filter((sponsor) => sponsor.logo_url);
  const duration = `${Math.max(12, visibleSponsors.length * speed)}s`;

  if (visibleSponsors.length === 0) {
    return null;
  }

  return (
    <div className="sponsor-marquee-viewport" aria-label="Patrocinadores">
      <div className="sponsor-marquee" style={{ "--marquee-duration": duration } as React.CSSProperties}>
        {[0, 1].map((groupIndex) => (
          <div className="sponsor-marquee-group" key={groupIndex} aria-hidden={groupIndex === 1}>
            {visibleSponsors.map((sponsor) => (
              <div className="sponsor-slide" key={`${groupIndex}-${sponsor.id}`}>
                {sponsor.website_url ? (
                  <a href={sponsor.website_url} target="_blank" rel="noreferrer" aria-label={sponsor.name}>
                    <img src={sponsor.logo_url!} alt={groupIndex === 0 ? sponsor.name : ""} />
                  </a>
                ) : (
                  <img src={sponsor.logo_url!} alt={groupIndex === 0 ? sponsor.name : ""} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SponsorCarousel;
