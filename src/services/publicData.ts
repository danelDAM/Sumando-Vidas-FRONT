import { getSupabaseClient } from "./supabase";

export type PublicProject = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  status: string;
};

export type PublicCampaign = {
  id: string;
  project_id: string | null;
  slug: string;
  title: string;
  description: string | null;
  goal_amount: number | null;
  currency: string;
  status: string;
};

export type PublicEvent = {
  id: string;
  project_id: string | null;
  campaign_id: string | null;
  slug: string;
  title: string;
  city: string;
  starts_on: string | null;
  schedule_status: "pending" | "confirmed" | "cancelled" | "completed";
  distance_km: number | null;
  description: string | null;
  official_url: string | null;
  registration_url: string | null;
};

export type PublicCampaignStop = {
  id: string;
  event_id: string | null;
  stop_number: number;
  city: string;
  title: string;
  label: string | null;
  distance_km: number | null;
  description: string | null;
  status: string;
};

export type PublicProduct = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  price_amount: number;
  currency: string;
};

export type PublicStory = {
  id: string;
  slug: string;
  locale: string;
  title: string;
  summary: string | null;
  body: string | null;
  image_url: string | null;
  image_alt: string | null;
};

export type PublicSponsor = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  tier: string | null;
  display_order: number;
};

export type PublicImpactMetric = {
  id: string;
  metric_key: string;
  label: string;
  value: number;
  unit: string;
  as_of: string;
};

export type PublicTransparencyReport = {
  id: string;
  slug: string;
  title: string;
  report_type: string;
  fiscal_year: number | null;
  summary: string | null;
  file_url: string;
  published_at: string | null;
};

export type PublicLeaderboardEntry = {
  participant_id: string;
  display_name: string;
  participant_type: "person" | "company";
  amount: number;
};

export type PublicCityLeaderboardEntry = {
  campaign_stop_id: string;
  campaign_id: string;
  stop_number: number;
  city: string;
  title: string;
  currency: string;
  amount: number;
};

type QueryResult = { message: string } | null;

function throwOnError(error: QueryResult) {
  if (error) {
    throw new Error(error.message);
  }
}

export async function getPublicHomeData(locale: string) {
  const client = getSupabaseClient();
  const [projectsResult, eventsResult, sponsorsResult, metricsResult] = await Promise.all([
    client.from("projects").select("id, slug, title, summary, description, status").eq("status", "published").order("title"),
    client.from("events").select("*").eq("is_published", true).order("starts_on", { ascending: true, nullsFirst: false }),
    client.from("sponsors").select("id, name, logo_url, website_url, tier, display_order").eq("is_published", true).order("display_order"),
    client.from("impact_metrics").select("id, metric_key, label, value, unit, as_of").eq("is_published", true).order("as_of", { ascending: false }),
  ]);

  throwOnError(projectsResult.error);
  throwOnError(eventsResult.error);
  throwOnError(sponsorsResult.error);
  throwOnError(metricsResult.error);

  const stories = await getPublicStories(locale);

  return {
    projects: (projectsResult.data ?? []) as PublicProject[],
    events: (eventsResult.data ?? []) as PublicEvent[],
    stories,
    sponsors: (sponsorsResult.data ?? []) as PublicSponsor[],
    metrics: (metricsResult.data ?? []) as PublicImpactMetric[],
  };
}

export async function getPublicProjects() {
  const client = getSupabaseClient();
  const [projectsResult, campaignsResult] = await Promise.all([
    client.from("projects").select("id, slug, title, summary, description, status").eq("status", "published").order("title"),
    client.from("campaigns").select("id, project_id, slug, title, description, goal_amount, currency, status").eq("status", "active"),
  ]);

  throwOnError(projectsResult.error);
  throwOnError(campaignsResult.error);

  return {
    projects: (projectsResult.data ?? []) as PublicProject[],
    campaigns: (campaignsResult.data ?? []) as PublicCampaign[],
  };
}

export async function getPublicEvents() {
  const { data, error } = await getSupabaseClient()
    .from("events")
    .select("*")
    .eq("is_published", true)
    .order("starts_on", { ascending: true, nullsFirst: false });

  throwOnError(error);
  return (data ?? []) as PublicEvent[];
}

export async function getPorEllosPublicData() {
  const client = getSupabaseClient();
  const [projectResult, campaignResult] = await Promise.all([
    client.from("projects").select("id, slug, title, summary, description, status").eq("slug", "por-ellos").maybeSingle(),
    client.from("campaigns").select("id, project_id, slug, title, description, goal_amount, currency, status").eq("slug", "por-ellos").eq("status", "active").maybeSingle(),
  ]);

  throwOnError(projectResult.error);
  throwOnError(campaignResult.error);

  if (!projectResult.data || !campaignResult.data) {
    throw new Error("La campaña Por Ellos no está publicada.");
  }

  const [stopsResult, eventsResult, productsResult, cityLeaderboardResult] = await Promise.all([
    client.from("campaign_stops").select("id, event_id, stop_number, city, title, label, distance_km, description, status").eq("campaign_id", campaignResult.data.id).eq("is_published", true).order("stop_number"),
    client.from("events").select("*").eq("campaign_id", campaignResult.data.id).eq("is_published", true).order("starts_on", { ascending: true, nullsFirst: false }),
    client.from("products").select("id, slug, title, description, category, image_url, price_amount, currency").eq("campaign_id", campaignResult.data.id).eq("is_active", true).eq("is_published", true).order("title"),
    client.from("public_city_leaderboard").select("campaign_stop_id, campaign_id, stop_number, city, title, currency, amount").eq("campaign_id", campaignResult.data.id).order("amount", { ascending: false }).order("stop_number"),
  ]);

  throwOnError(stopsResult.error);
  throwOnError(eventsResult.error);
  throwOnError(productsResult.error);
  throwOnError(cityLeaderboardResult.error);

  return {
    project: projectResult.data as PublicProject,
    campaign: campaignResult.data as PublicCampaign,
    stops: (stopsResult.data ?? []) as PublicCampaignStop[],
    events: (eventsResult.data ?? []) as PublicEvent[],
    products: (productsResult.data ?? []) as PublicProduct[],
    cityLeaderboard: (cityLeaderboardResult.data ?? []) as PublicCityLeaderboardEntry[],
  };
}

export async function getPublicStories(locale: string) {
  const client = getSupabaseClient();
  const queryStories = (requestedLocale: string) => client
    .from("stories")
    .select("id, slug, locale, title, summary, body, image_url, image_alt")
    .eq("locale", requestedLocale)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const localizedResult = await queryStories(locale);
  throwOnError(localizedResult.error);

  if ((localizedResult.data ?? []).length > 0 || locale === "es") {
    return (localizedResult.data ?? []) as PublicStory[];
  }

  const fallbackResult = await queryStories("es");
  throwOnError(fallbackResult.error);
  return (fallbackResult.data ?? []) as PublicStory[];
}

export async function getPublicHeroesData() {
  const client = getSupabaseClient();
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = dateParts.find((part) => part.type === "year")?.value;
  const month = dateParts.find((part) => part.type === "month")?.value;
  const currentMonth = `${year}-${month}-01`;

  const [projectResult, monthlyResult, historicResult] = await Promise.all([
    client.from("projects").select("id, slug, title, summary, description, status").eq("slug", "heroes-que-suman").eq("status", "published").maybeSingle(),
    client.from("monthly_leaderboard").select("participant_id, display_name, participant_type, amount").eq("month", currentMonth).order("amount", { ascending: false }),
    client.from("historic_leaderboard").select("participant_id, display_name, participant_type, amount").order("amount", { ascending: false }),
  ]);

  throwOnError(projectResult.error);
  throwOnError(monthlyResult.error);
  throwOnError(historicResult.error);

  return {
    project: projectResult.data as PublicProject | null,
    monthly: (monthlyResult.data ?? []) as PublicLeaderboardEntry[],
    historic: (historicResult.data ?? []) as PublicLeaderboardEntry[],
  };
}

export async function getPublicTransparencyReports() {
  const { data, error } = await getSupabaseClient()
    .from("transparency_reports")
    .select("id, slug, title, report_type, fiscal_year, summary, file_url, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  throwOnError(error);
  return (data ?? []) as PublicTransparencyReport[];
}