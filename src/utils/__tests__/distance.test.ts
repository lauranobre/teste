import { calcularDistanciaKm, formatarDistancia } from '../distance';

describe('Utilitários de distância', () => {
  test('retorna 0 quando as coordenadas de origem e destino são idênticas', () => {
    expect(calcularDistanciaKm(-21.7972, -50.8791, -21.7972, -50.8791)).toBe(0);
  });

  test('calcula corretamente a distância aproximada entre dois ecopontos', () => {
    const distancia = calcularDistanciaKm(-21.7972, -50.8791, -21.8015, -50.8742);
    expect(distancia).toBeGreaterThan(0.5);
    expect(distancia).toBeLessThan(1.0);
  });

  test('lança erro quando alguma coordenada não é finita', () => {
    expect(() => calcularDistanciaKm(Number.NaN, -50.8791, -21.8, -50.8)).toThrow(
      'Coordenadas inválidas para cálculo de distância.'
    );
  });

  test('formata distâncias menores que 1 km em metros', () => {
    expect(formatarDistancia(0.65)).toBe('650 m');
  });

  test('formata distâncias maiores ou iguais a 1 km com uma casa decimal', () => {
    expect(formatarDistancia(2.34)).toBe('2.3 km');
  });

  test('retorna "--" para distâncias negativas ou inválidas', () => {
    expect(formatarDistancia(-1)).toBe('--');
    expect(formatarDistancia(Number.NaN)).toBe('--');
  });
});
