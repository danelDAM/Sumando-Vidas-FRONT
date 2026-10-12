-- Race order for Por Ellos: Barcelona, Málaga, Madrid, Donosti, Valencia.
-- Existing rows are renumbered in place so their ids, and the donations linked to them, are kept.
-- Position-specific texts (first stop, second stop, final stop) move with the position.
do $$
declare
  por_ellos uuid := (select id from public.campaigns where slug = 'por-ellos');
begin
  -- Temporary numbers first: (campaign_id, stop_number) is unique.
  update public.campaign_stops
  set stop_number = stop_number + 100
  where campaign_id = por_ellos;

  update public.campaign_stops as stop
  set
    stop_number = next.stop_number,
    label = next.label,
    description = next.description,
    updated_at = now()
  from (
    values
      ('Barcelona', 1, 'Parada 1', 'Inicio del reto y primera llamada a sumar donaciones al proyecto.'),
      ('Málaga', 2, 'Parada 2', 'Segunda parada para conectar deporte, historia personal y apoyo a familias.'),
      ('Madrid', 3, 'Parada 3', 'Una carrera clave para movilizar empresas, corredores y donantes.'),
      ('Donosti', 4, 'Parada 4', 'Una nueva oportunidad para ampliar el alcance del proyecto y sumar apoyos.'),
      ('Valencia', 5, 'Meta final', 'La última parada del recorrido, pensada como gran cierre de campaña.')
  ) as next(city, stop_number, label, description)
  where stop.campaign_id = por_ellos
    and stop.city = next.city;

  if exists (select 1 from public.campaign_stops where campaign_id = por_ellos and stop_number > 100) then
    raise exception 'Unexpected Por Ellos stop city; reorder aborted.';
  end if;
end $$;
