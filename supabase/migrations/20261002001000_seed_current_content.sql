insert into public.projects (slug, title, summary, description, status)
values
  (
    'por-ellos',
    'Por Ellos',
    'Una campaña deportiva y solidaria para recaudar el máximo dinero posible en apoyo a niños y familias afectados por el cáncer infantil.',
    'Felipe, fundador de Sumando Vidas y superviviente de cáncer de niño, correrá junto a un equipo de la asociación las cinco grandes medias maratones de España. Cada carrera será una oportunidad para visibilizar la causa, sumar donaciones y construir comunidad alrededor de las familias.',
    'published'
  ),
  (
    'heroes-que-suman',
    'Héroes que suman',
    'Un reto mensual para que empresas y personas conviertan su apoyo al cáncer infantil en una clasificación que inspira a seguir sumando.',
    null,
    'published'
  )
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  status = excluded.status,
  updated_at = now();

insert into public.campaigns (project_id, slug, title, description, goal_amount, status)
values
  (
    (select id from public.projects where slug = 'por-ellos'),
    'por-ellos',
    'Campaña Por Ellos',
    'Recaudación solidaria vinculada al reto de las cinco medias maratones.',
    50000,
    'active'
  ),
  (
    (select id from public.projects where slug = 'heroes-que-suman'),
    'heroes-que-suman',
    'Reto mensual Héroes que suman',
    'Clasificación mensual de aportaciones de personas y empresas.',
    null,
    'active'
  )
on conflict (slug) do update set
  project_id = excluded.project_id,
  title = excluded.title,
  description = excluded.description,
  goal_amount = excluded.goal_amount,
  status = excluded.status,
  updated_at = now();

insert into public.events (
  project_id, campaign_id, slug, title, city, starts_on, schedule_status,
  distance_km, description, official_url, registration_url, is_published
)
values
  (
    (select id from public.projects where slug = 'por-ellos'),
    (select id from public.campaigns where slug = 'por-ellos'),
    'media-maraton-valencia',
    'Medio Maratón Valencia Trinidad Alfonso Zurich',
    'Valencia', '2026-10-25', 'confirmed', 21.097,
    'La gran cita valenciana del running popular, con salida y meta en una ciudad volcada con el deporte.',
    'https://www.valenciaciudaddelrunning.com/medio/medio-maraton/', null, true
  ),
  (
    (select id from public.projects where slug = 'por-ellos'),
    (select id from public.campaigns where slug = 'por-ellos'),
    'media-maraton-donosti',
    'Media Maratón de Donosti',
    'Donosti', null, 'pending', 21.1,
    'Una parada en San Sebastián para llevar el reto Por Ellos a la comunidad runner del norte.',
    'https://www.sansilvestredonostiarra.com/', null, true
  ),
  (
    (select id from public.projects where slug = 'por-ellos'),
    (select id from public.campaigns where slug = 'por-ellos'),
    'media-maraton-sevilla',
    'Media Maratón de Sevilla',
    'Sevilla', null, 'pending', 21.1,
    'Una carrera urbana en Sevilla que suma visibilidad, corredores y solidaridad al proyecto.',
    'https://www.mediamaratonsevilla.es/', null, true
  ),
  (
    (select id from public.projects where slug = 'por-ellos'),
    (select id from public.campaigns where slug = 'por-ellos'),
    'media-maraton-barcelona',
    'Media Maratón de Barcelona',
    'Barcelona', null, 'pending', 21.1,
    'Barcelona se incorpora al recorrido como una nueva oportunidad para correr por las familias.',
    'https://www.barcelonahalf.com/', null, true
  ),
  (
    (select id from public.projects where slug = 'por-ellos'),
    (select id from public.campaigns where slug = 'por-ellos'),
    'media-maraton-malaga',
    'XXXVI TotalEnergies Media Maratón Ciudad de Málaga',
    'Málaga', '2027-03-07', 'confirmed', 21.097,
    'La ciudad que vio nacer el reto acogerá una de sus paradas más especiales.',
    'https://www.mediamaratonmalaga.com/',
    'https://www.mediamaratonmalaga.com/web-evento/13023-xxxvi-totalenergies-media-maraton-ciudad-de-malaga', true
  ),
  (
    (select id from public.projects where slug = 'por-ellos'),
    (select id from public.campaigns where slug = 'por-ellos'),
    'movistar-madrid-medio-maraton',
    'Movistar Madrid Medio Maratón',
    'Madrid', '2027-04-04', 'confirmed', 21.097,
    'La gran fiesta del atletismo popular en Madrid será otra parada clave del recorrido solidario.',
    'https://www.mediomaratonmadrid.es/',
    'https://www.mediomaratonmadrid.es/web-evento/13064-movistar-madrid-medio-maraton-2027', true
  )
on conflict (slug) do update set
  project_id = excluded.project_id,
  campaign_id = excluded.campaign_id,
  title = excluded.title,
  city = excluded.city,
  starts_on = excluded.starts_on,
  schedule_status = excluded.schedule_status,
  distance_km = excluded.distance_km,
  description = excluded.description,
  official_url = excluded.official_url,
  registration_url = excluded.registration_url,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.campaign_stops (
  campaign_id, event_id, stop_number, city, title, label,
  distance_km, description, status, is_published
)
values
  (
    (select id from public.campaigns where slug = 'por-ellos'),
    (select id from public.events where slug = 'media-maraton-malaga'),
    1, 'Málaga', 'Media Maratón de Málaga', 'Parada 1', 21.1,
    'Inicio del reto y primera llamada a sumar donaciones al proyecto.', 'ready', true
  ),
  (
    (select id from public.campaigns where slug = 'por-ellos'),
    (select id from public.events where slug = 'media-maraton-donosti'),
    2, 'Donosti', 'Media Maratón de Donosti', 'Parada 2', 21.1,
    'Segunda parada para conectar deporte, historia personal y apoyo a familias.', 'planned', true
  ),
  (
    (select id from public.campaigns where slug = 'por-ellos'),
    (select id from public.events where slug = 'movistar-madrid-medio-maraton'),
    3, 'Madrid', 'Media Maratón de Madrid', 'Parada 3', 21.1,
    'Una carrera clave para movilizar empresas, corredores y donantes.', 'planned', true
  ),
  (
    (select id from public.campaigns where slug = 'por-ellos'),
    (select id from public.events where slug = 'media-maraton-valencia'),
    4, 'Valencia', 'Media Maratón de Valencia', 'Parada 4', 21.1,
    'Una nueva oportunidad para ampliar el alcance del proyecto y sumar apoyos.', 'ready', true
  ),
  (
    (select id from public.campaigns where slug = 'por-ellos'),
    (select id from public.events where slug = 'media-maraton-barcelona'),
    5, 'Barcelona', 'Media Maratón de Barcelona', 'Meta final', 21.1,
    'La última parada del recorrido, pensada como gran cierre de campaña.', 'planned', true
  )
on conflict (campaign_id, stop_number) do update set
  event_id = excluded.event_id,
  city = excluded.city,
  title = excluded.title,
  label = excluded.label,
  distance_km = excluded.distance_km,
  description = excluded.description,
  status = excluded.status,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.products (
  campaign_id, slug, title, description, category, image_url,
  price_amount, currency, is_active, is_published
)
values
  ((select id from public.campaigns where slug = 'por-ellos'), 'dorsal-solidario', 'Dorsal solidario', 'Tu dorsal simbólico para apoyar la campaña en la parada elegida.', 'Corredor', '/images/dorsalSolidarioImagen.png', 18, 'EUR', true, true),
  ((select id from public.campaigns where slug = 'por-ellos'), 'pack-apoyo-familiar', 'Pack apoyo familiar', 'Un pequeño apoyo simbólico para reforzar la visibilidad del proyecto.', 'Familias', '/images/packApoyoFamiliarImagen.png', 24, 'EUR', true, true),
  ((select id from public.campaigns where slug = 'por-ellos'), 'medalla-comunidad', 'Medalla de la comunidad', 'Medalla para celebrar la solidaridad y la fuerza de la comunidad.', 'Recuerdo', '/images/medallaSolidariaImagen.jpg', 22, 'EUR', true, true),
  ((select id from public.campaigns where slug = 'por-ellos'), 'taza-solidaria', 'Taza solidaria', 'Un detalle sencillo para llevar la causa en cada desayuno o reunión.', 'Regalo', '/images/tazaSolidariaImagen.jpg', 16, 'EUR', true, true),
  ((select id from public.campaigns where slug = 'por-ellos'), 'kit-caminata-solidaria', 'Kit caminata solidaria', 'Incluye materiales simbólicos para correr, animar y compartir la campaña.', 'Reto', '/images/kitCaminataSolidariaImagen.jpg', 28, 'EUR', true, true),
  ((select id from public.campaigns where slug = 'por-ellos'), 'pack-meta-solidaria', 'Pack meta solidaria', 'Un recuerdo para celebrar la última etapa del reto Por Ellos.', 'Cierre', '/images/packMetaSolidariaImagen.jpg', 30, 'EUR', true, true)
on conflict (slug) do update set
  campaign_id = excluded.campaign_id,
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  image_url = excluded.image_url,
  price_amount = excluded.price_amount,
  currency = excluded.currency,
  is_active = excluded.is_active,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.stories (
  slug, locale, title, summary, body, image_url, image_alt, status, published_at
)
values (
  'historia-de-felipe',
  'es',
  'La historia de Felipe',
  'La historia del fundador de Sumando Vidas y su compromiso con la oncología infantil.',
  'A los 12 años, al malagueño le diagnosticaron un linfoma de no Hodgkin de células T y, estando en la UCI, una amiga le acercó a esta sagrada imagen a través de una pulsera y una estampa. Desde entonces, no se ha separado de ella. Tras superarlo, se propuso estudiar Medicina y especializarse en oncología infantil para poder ayudar a todos los niños con su misma condición. Finalmente, mientras cursaba la carrera, decidió fundar la asociación.',
  '/images/fotoFelipeMedina.png',
  'Historia del fundador de la asociación',
  'published',
  now()
)
on conflict (locale, slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  image_url = excluded.image_url,
  image_alt = excluded.image_alt,
  status = excluded.status,
  published_at = excluded.published_at,
  updated_at = now();