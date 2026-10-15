-- Por Ellos: the Seville half marathon replaces the Málaga one as stop 2.
-- The stop row is updated in place so its id, position and linked donations are kept.
-- The Málaga event is unpublished (not deleted) because it is no longer part of the campaign.
do $$
declare
  por_ellos uuid := (select id from public.campaigns where slug = 'por-ellos');
  sevilla_event uuid := (select id from public.events where slug = 'media-maraton-sevilla');
begin
  if sevilla_event is null then
    raise exception 'Event media-maraton-sevilla not found; replacement aborted.';
  end if;

  update public.campaign_stops
  set
    event_id = sevilla_event,
    city = 'Sevilla',
    title = 'Media Maratón de Sevilla',
    status = 'planned',
    updated_at = now()
  where campaign_id = por_ellos
    and city = 'Málaga';

  update public.events
  set is_published = true, updated_at = now()
  where id = sevilla_event;

  update public.events
  set is_published = false, updated_at = now()
  where slug = 'media-maraton-malaga';
end $$;
