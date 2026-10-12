// Simplified outline of mainland Spain and city coordinates as [longitude, latitude].
// Used by the Por Ellos scroll story to draw the board and place each stop.

export const spainOutline: [number, number][] = [
  // Bay of Biscay and Cantabrian coast, east to west
  [-1.78, 43.37], [-1.98, 43.32], [-2.5, 43.43], [-2.95, 43.42], [-3.45, 43.45], [-3.8, 43.47],
  [-4.5, 43.4], [-5.2, 43.48], [-5.66, 43.56], [-5.85, 43.66], [-6.5, 43.57], [-7.04, 43.55],
  [-7.68, 43.79], [-8.25, 43.53], [-8.4, 43.38], [-8.95, 43.22], [-9.27, 42.88], [-8.9, 42.6],
  [-8.82, 42.3], [-8.87, 41.87],
  // Border with Portugal, north to south
  [-8.17, 42.1], [-7.9, 41.86], [-7.2, 41.88], [-6.55, 41.95], [-6.2, 41.58], [-6.93, 41.03],
  [-6.8, 40.3], [-7.0, 39.67], [-7.5, 39.66], [-7.0, 39.2], [-7.3, 38.9], [-7.3, 38.4],
  [-7.0, 38.0], [-7.5, 37.6], [-7.42, 37.18],
  // Gulf of Cádiz and Mediterranean coast, west to east
  [-6.95, 37.22], [-6.4, 36.85], [-6.29, 36.53], [-5.6, 36.01], [-5.45, 36.13], [-5.0, 36.45],
  [-4.42, 36.7], [-3.5, 36.72], [-2.46, 36.83], [-2.19, 36.72], [-1.9, 37.1], [-0.98, 37.58],
  [-0.69, 37.63], [-0.75, 37.9], [-0.5, 38.2], [-0.48, 38.34], [0.23, 38.73], [-0.2, 39.0],
  [-0.32, 39.45], [-0.1, 39.9], [0.3, 40.3], [0.85, 40.7], [1.25, 41.1], [1.7, 41.22],
  [2.2, 41.4], [2.8, 41.65], [3.2, 41.9], [3.32, 42.32], [3.17, 42.43],
  // Pyrenees border with France and Andorra, east to west
  [2.5, 42.35], [1.75, 42.45], [1.4, 42.6], [0.7, 42.85], [0.0, 42.7], [-0.5, 42.8],
  [-1.0, 43.0], [-1.4, 43.05],
];

export const cityCoordinates: Record<string, [number, number]> = {
  malaga: [-4.42, 36.72],
  donosti: [-1.98, 43.32],
  donostia: [-1.98, 43.32],
  "san sebastian": [-1.98, 43.32],
  madrid: [-3.7, 40.42],
  valencia: [-0.38, 39.47],
  barcelona: [2.17, 41.39],
  sevilla: [-5.98, 37.39],
  bilbao: [-2.93, 43.26],
  zaragoza: [-0.88, 41.65],
};

export function normalizeCity(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
