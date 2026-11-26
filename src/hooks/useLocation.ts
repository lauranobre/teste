import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Coordenadas } from '../types';

export function useLocation(autoFetch = true) {
  const [coords, setCoords] = useState<Coordenadas | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const atualizarLocalizacao = useCallback(async (): Promise<Coordenadas | null> => {
    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        if (mountedRef.current) {
          setError(
            'Permissão de localização negada. Ative o GPS nas configurações para centralizar o mapa.'
          );
        }
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const novaPosicao: Coordenadas = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      if (mountedRef.current) {
        setCoords(novaPosicao);
      }

      return novaPosicao;
    } catch {
      if (mountedRef.current) {
        setError('Não foi possível obter sua localização atual.');
      }
      return null;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!autoFetch) return;
    let canceled = false;
    async function run() {
      await atualizarLocalizacao();
    }
    if (!canceled) run();
    return () => { canceled = true; };
  }, [autoFetch, atualizarLocalizacao]);

  return {
    coords,
    loading,
    error,
    atualizarLocalizacao,
  };
}
