import { EARTH_RADIUS_KM, METERS_PER_KM } from './constants';

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calcula a distância geodésica em quilômetros entre duas coordenadas (Haversine).
 */
export function calcularDistanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const values = [lat1, lon1, lat2, lon2];
  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error('Coordenadas inválidas para cálculo de distância.');
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 100) / 100;
}

/**
 * Formata uma distância em quilômetros para exibição amigável ("850 m" ou "2.4 km").
 */
export function formatarDistancia(distanciaKm: number): string {
  if (!Number.isFinite(distanciaKm) || distanciaKm < 0) {
    return '--';
  }

  if (distanciaKm < 1) {
    const metros = Math.round(distanciaKm * METERS_PER_KM);
    return `${metros} m`;
  }

  return `${distanciaKm.toFixed(1)} km`;
}
