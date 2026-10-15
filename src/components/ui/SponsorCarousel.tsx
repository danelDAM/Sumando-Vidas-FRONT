import { useTranslation } from "react-i18next";
import type { PublicSponsor } from "../../services/publicData";

type SponsorCarouselProps = {
  sponsors: PublicSponsor[];
  secondsPerLogo?: number;
};

// Minimum logos per group so a single group is wider than the viewport.
const MIN_LOGOS_PER_GROUP = 8;

export function SponsorCarousel({
  sponsors,
  secondsPerLogo = 3.5,
}: SponsorCarouselProps) {
  const { t } = useTranslation();
  const visibleSponsors = sponsors.filter((sponsor) => sponsor.logo_url);

  if (visibleSponsors.length === 0) {
    return null;
  }

  const repeats = Math.ceil(MIN_LOGOS_PER_GROUP / visibleSponsors.length);
  const track = Array.from({ length: repeats }, () => visibleSponsors).flat();
  const duration = `${track.length * secondsPerLogo}s`;
  const title = t("home.sponsors.title");

  return (
    <section className="sponsor-strip" aria-label={title}>
      <p className="sponsor-strip-title">{title}</p>
      <div className="sponsor-marquee-viewport">
        <div className="sponsor-marquee" style={{ "--marquee-duration": duration } as React.CSSProperties}>
          {[0, 1].map((groupIndex) => (
            <ul className="sponsor-marquee-group" key={groupIndex} aria-hidden={groupIndex === 1 || undefined}>
              {track.map((sponsor, index) => {
                // Only the first copy of each logo is exposed to assistive tech and keyboard.
                const isPrimary = groupIndex === 0 && index < visibleSponsors.length;
                const logo = <img src={sponsor.logo_url!} alt={isPrimary ? sponsor.name : ""} loading="lazy" />;

                return (
                  <li className="sponsor-slide" key={`${groupIndex}-${index}-${sponsor.id}`} aria-hidden={!isPrimary || undefined}>
                    {sponsor.website_url ? (
                      <a href={sponsor.website_url} target="_blank" rel="noreferrer" tabIndex={isPrimary ? undefined : -1}>
                        {logo}
                      </a>
                    ) : (
                      logo
                    )}
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SponsorCarousel;
