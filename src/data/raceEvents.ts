export type RaceEvent = {
  city: string;
  title: string;
  date: string;
  dateLabel: string;
  distance: string;
  description: string;
  officialUrl: string;
  registrationUrl?: string;
  status: "confirmed" | "pending";
};

export const raceEvents: RaceEvent[] = [
  {
    city: "Valencia",
    title: "Medio Maratón Valencia Trinidad Alfonso Zurich",
    date: "2026-10-25",
    dateLabel: "25 de octubre de 2026",
    distance: "21,097 km",
    description: "La gran cita valenciana del running popular, con salida y meta en una ciudad volcada con el deporte.",
    officialUrl: "https://www.valenciaciudaddelrunning.com/medio/medio-maraton/",
    status: "confirmed",
  },
  {
    city: "Donosti",
    title: "Media Maratón de Donosti",
    date: "",
    dateLabel: "Fecha por confirmar",
    distance: "21,1 km",
    description: "Una parada en San Sebastián para llevar el reto Por Ellos a la comunidad runner del norte.",
    officialUrl: "https://www.sansilvestredonostiarra.com/",
    status: "pending",
  },
  {
    city: "Sevilla",
    title: "Media Maratón de Sevilla",
    date: "",
    dateLabel: "Fecha por confirmar",
    distance: "21,1 km",
    description: "Una carrera urbana en Sevilla que suma visibilidad, corredores y solidaridad al proyecto.",
    officialUrl: "https://www.mediamaratonsevilla.es/",
    status: "pending",
  },
  {
    city: "Barcelona",
    title: "Media Maratón de Barcelona",
    date: "",
    dateLabel: "Fecha por confirmar",
    distance: "21,1 km",
    description: "Barcelona se incorpora al recorrido como una nueva oportunidad para correr por las familias.",
    officialUrl: "https://www.barcelonahalf.com/",
    status: "pending",
  },
  {
    city: "Málaga",
    title: "XXXVI TotalEnergies Media Maratón Ciudad de Málaga",
    date: "2027-03-07",
    dateLabel: "7 de marzo de 2027",
    distance: "21,097 km",
    description: "La ciudad que vio nacer el reto acogerá una de sus paradas más especiales.",
    officialUrl: "https://www.mediamaratonmalaga.com/",
    registrationUrl: "https://www.mediamaratonmalaga.com/web-evento/13023-xxxvi-totalenergies-media-maraton-ciudad-de-malaga",
    status: "confirmed",
  },
  {
    city: "Madrid",
    title: "Movistar Madrid Medio Maratón",
    date: "2027-04-04",
    dateLabel: "4 de abril de 2027",
    distance: "21,097 km",
    description: "La gran fiesta del atletismo popular en Madrid será otra parada clave del recorrido solidario.",
    officialUrl: "https://www.mediomaratonmadrid.es/",
    registrationUrl: "https://www.mediomaratonmadrid.es/web-evento/13064-movistar-madrid-medio-maraton-2027",
    status: "confirmed",
  },
];
