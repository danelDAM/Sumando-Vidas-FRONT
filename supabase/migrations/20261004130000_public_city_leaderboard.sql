create or replace view public.public_city_leaderboard
with (security_invoker = false) as
select
  campaign_stops.id as campaign_stop_id,
  campaign_stops.campaign_id,
  campaign_stops.stop_number,
  campaign_stops.city,
  campaign_stops.title,
  campaigns.currency,
  coalesce(sum(donations.amount), 0)::numeric(12, 2) as amount
from public.campaign_stops
join public.campaigns on campaigns.id = campaign_stops.campaign_id
left join public.donations
  on donations.campaign_stop_id = campaign_stops.id
  and donations.status = 'paid'
  and donations.paid_at is not null
  and donations.currency = campaigns.currency
where campaign_stops.is_published
  and campaigns.status = 'active'
group by
  campaign_stops.id,
  campaign_stops.campaign_id,
  campaign_stops.stop_number,
  campaign_stops.city,
  campaign_stops.title,
  campaigns.currency;

revoke all on public.public_city_leaderboard from public, anon, authenticated;
grant select on public.public_city_leaderboard to anon, authenticated;
