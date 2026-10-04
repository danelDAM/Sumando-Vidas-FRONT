create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  slug text not null unique,
  title text not null,
  description text,
  goal_amount numeric(12, 2) check (goal_amount is null or goal_amount > 0),
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'closed', 'archived')),
  starts_at date,
  ends_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  slug text not null unique,
  title text not null,
  city text not null,
  starts_on date,
  schedule_status text not null default 'pending' check (schedule_status in ('pending', 'confirmed', 'cancelled', 'completed')),
  distance_km numeric(7, 3) check (distance_km is null or distance_km > 0),
  description text,
  official_url text,
  registration_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_stops (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  stop_number integer not null check (stop_number > 0),
  city text not null,
  title text not null,
  label text,
  distance_km numeric(7, 3) check (distance_km is null or distance_km > 0),
  description text,
  status text not null default 'planned' check (status in ('planned', 'ready', 'in_progress', 'completed', 'cancelled')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, stop_number)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete set null,
  slug text not null unique,
  title text not null,
  description text,
  category text,
  image_url text,
  price_amount numeric(10, 2) not null check (price_amount > 0),
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  is_active boolean not null default true,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  locale text not null default 'es' check (locale in ('es', 'ca', 'eu')),
  title text not null,
  summary text,
  body text,
  image_url text,
  image_alt text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (locale, slug)
);

create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  tier text,
  display_order integer not null default 0,
  is_published boolean not null default false,
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create table public.impact_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null,
  label text not null,
  value numeric(14, 2) not null check (value >= 0),
  unit text not null default 'count',
  as_of date not null default current_date,
  source text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  unique (metric_key, as_of)
);

create table public.transparency_reports (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  report_type text not null check (report_type in ('annual_report', 'financial_report', 'donation_use', 'other')),
  fiscal_year integer check (fiscal_year is null or fiscal_year between 2000 and 2200),
  summary text,
  file_url text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  participant_type text not null check (participant_type in ('person', 'company')),
  display_name text not null,
  legal_name text,
  contact_name text,
  email text,
  phone text,
  publicly_listed boolean not null default false,
  public_consent_at timestamptz,
  status text not null default 'active' check (status in ('active', 'inactive', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not publicly_listed or public_consent_at is not null)
);

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  campaign_stop_id uuid references public.campaign_stops(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  participant_id uuid references public.participants(id) on delete set null,
  donation_type text not null default 'one_time' check (donation_type in ('one_time', 'recurring', 'product')),
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  billing_interval text check (billing_interval in ('month', 'year')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  donor_name text,
  donor_email text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  paid_at timestamptz,
  refunded_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (donation_type <> 'recurring' or billing_interval is not null),
  check (donation_type <> 'product' or product_id is not null)
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  reason text not null check (reason in ('general', 'volunteer', 'company', 'project', 'press')),
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'answered', 'archived', 'spam')),
  internal_notes text,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  processing_status text not null default 'received' check (processing_status in ('received', 'processed', 'failed')),
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index campaigns_project_id_idx on public.campaigns(project_id);
create index events_campaign_date_idx on public.events(campaign_id, starts_on);
create index campaign_stops_campaign_order_idx on public.campaign_stops(campaign_id, stop_number);
create index stories_published_idx on public.stories(status, published_at desc);
create index donations_campaign_status_paid_idx on public.donations(campaign_id, status, paid_at desc);
create index donations_participant_status_paid_idx on public.donations(participant_id, status, paid_at desc);
create index contact_messages_status_created_idx on public.contact_messages(status, created_at desc);

alter table public.projects enable row level security;
alter table public.campaigns enable row level security;
alter table public.events enable row level security;
alter table public.campaign_stops enable row level security;
alter table public.products enable row level security;
alter table public.stories enable row level security;
alter table public.sponsors enable row level security;
alter table public.impact_metrics enable row level security;
alter table public.transparency_reports enable row level security;
alter table public.participants enable row level security;
alter table public.donations enable row level security;
alter table public.contact_messages enable row level security;
alter table public.stripe_webhook_events enable row level security;

create policy "Published projects are readable" on public.projects
  for select to anon, authenticated using (status = 'published');
create policy "Active campaigns are readable" on public.campaigns
  for select to anon, authenticated using (status = 'active');
create policy "Published events are readable" on public.events
  for select to anon, authenticated using (is_published);
create policy "Published campaign stops are readable" on public.campaign_stops
  for select to anon, authenticated using (is_published);
create policy "Published products are readable" on public.products
  for select to anon, authenticated using (is_active and is_published);
create policy "Published stories are readable" on public.stories
  for select to anon, authenticated using (status = 'published' and published_at <= now());
create policy "Published sponsors are readable" on public.sponsors
  for select to anon, authenticated using (
    is_published
    and (starts_on is null or starts_on <= current_date)
    and (ends_on is null or ends_on >= current_date)
  );
create policy "Published impact metrics are readable" on public.impact_metrics
  for select to anon, authenticated using (is_published);
create policy "Published transparency reports are readable" on public.transparency_reports
  for select to anon, authenticated using (status = 'published' and published_at <= now());
create policy "Public contact submissions are accepted" on public.contact_messages
  for insert to anon, authenticated
  with check (status = 'new' and internal_notes is null and responded_at is null);

grant select on public.projects, public.campaigns, public.events, public.campaign_stops,
  public.products, public.stories, public.sponsors, public.impact_metrics,
  public.transparency_reports to anon, authenticated;
grant insert (name, email, reason, message) on public.contact_messages to anon, authenticated;
grant all on public.projects, public.campaigns, public.events, public.campaign_stops,
  public.products, public.stories, public.sponsors, public.impact_metrics,
  public.transparency_reports, public.participants, public.donations,
  public.contact_messages, public.stripe_webhook_events to service_role;

create view public.monthly_leaderboard with (security_invoker = false) as
select
  date_trunc('month', donations.paid_at at time zone 'Europe/Madrid')::date as month,
  participants.id as participant_id,
  participants.display_name,
  participants.participant_type,
  sum(donations.amount) as amount
from public.donations
join public.participants on participants.id = donations.participant_id
where donations.status = 'paid'
  and donations.paid_at is not null
  and participants.status = 'active'
  and participants.publicly_listed
  and participants.public_consent_at is not null
group by 1, 2, 3, 4;

create view public.historic_leaderboard with (security_invoker = false) as
select
  participants.id as participant_id,
  participants.display_name,
  participants.participant_type,
  sum(donations.amount) as amount
from public.donations
join public.participants on participants.id = donations.participant_id
where donations.status = 'paid'
  and participants.status = 'active'
  and participants.publicly_listed
  and participants.public_consent_at is not null
group by 1, 2, 3;

grant select on public.monthly_leaderboard, public.historic_leaderboard to anon, authenticated;