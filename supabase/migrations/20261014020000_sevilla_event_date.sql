-- Medio Maratón de Sevilla: confirmed date (moved from 29 Nov to 13 Dec 2026 because of the general election)
-- and the official site, which is mediomaratondesevilla.es (the seeded domain does not exist).
update public.events
set
  starts_on = '2026-12-13',
  schedule_status = 'confirmed',
  distance_km = 21.097,
  official_url = 'https://www.mediomaratondesevilla.es/',
  registration_url = 'https://www.mediomaratondesevilla.es/web-evento/12859-mms26',
  updated_at = now()
where slug = 'media-maraton-sevilla';
