import type { TFunction } from "i18next";
import type { PublicCampaign, PublicCampaignStop, PublicEvent, PublicProduct, PublicProject } from "../services/publicData";

// Supabase stores this content in Spanish only. Known rows are translated through `content.*`
// locale keys; rows without keys keep their database text.
function translate(t: TFunction, key: string, value: string): string;
function translate(t: TFunction, key: string, value: string | null): string | null;
function translate(t: TFunction, key: string, value: string | null) {
  return value === null ? null : t(key, { defaultValue: value });
}

function cityKey(city: string) {
  return city.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function localizeProject(t: TFunction, project: PublicProject): PublicProject {
  const key = `content.projects.${project.slug}`;
  return {
    ...project,
    summary: translate(t, `${key}.summary`, project.summary),
    description: translate(t, `${key}.description`, project.description),
  };
}

export function localizeCampaign(t: TFunction, campaign: PublicCampaign): PublicCampaign {
  const key = `content.campaigns.${campaign.slug}`;
  return {
    ...campaign,
    title: translate(t, `${key}.title`, campaign.title),
    description: translate(t, `${key}.description`, campaign.description),
  };
}

// Official race names have no title key and keep their database text.
export function localizeEvent(t: TFunction, event: PublicEvent): PublicEvent {
  const key = `content.events.${event.slug}`;
  return {
    ...event,
    title: translate(t, `${key}.title`, event.title),
    description: translate(t, `${key}.description`, event.description),
  };
}

// Label and description belong to the position in the race, the title to the city.
export function localizeStop(t: TFunction, stop: PublicCampaignStop): PublicCampaignStop {
  const positionKey = `content.stopPositions.${stop.stop_number}`;
  return {
    ...stop,
    title: translate(t, `content.stops.${cityKey(stop.city)}.title`, stop.title),
    label: translate(t, `${positionKey}.label`, stop.label),
    description: translate(t, `${positionKey}.description`, stop.description),
  };
}

export function localizeProduct(t: TFunction, product: PublicProduct): PublicProduct {
  const key = `content.products.${product.slug}`;
  return {
    ...product,
    title: translate(t, `${key}.title`, product.title),
    description: translate(t, `${key}.description`, product.description),
    category: translate(t, `${key}.category`, product.category),
  };
}
