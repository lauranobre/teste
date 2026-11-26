import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiClientError, apiService } from '../services/api';
import { localDatabase } from '../services/localDatabase';
import { Coordenadas, PontoColeta } from '../types';
import { calcularDistanciaKm, formatarDistancia } from '../utils/distance';

interface UseEcopontosOptions {
  material?: string;
  userCoords?: Coordenadas | null;
}

export function useEcopontos({ material, userCoords }: UseEcopontosOptions = {}) {
  const [rawPontos, setRawPontos] = useState<PontoColeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [offlineCacheDisponivel, setOfflineCacheDisponivel] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchEcopontos = useCallback(
    async (isRefresh = false) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const dados = await apiService.getEcopontos(material, controller.signal);
        setRawPontos(dados);
        setOfflineCacheDisponivel(false);

        if (!material) {
          await localDatabase.sincronizarEcopontosCache(dados);
        }
      } catch (err) {
        if (err instanceof ApiClientError && err.isCanceled) {
          return;
        }

        const cached = await localDatabase.listarEcopontosCache();
        setOfflineCacheDisponivel(cached.length > 0);

        const mensagem =
          err instanceof Error
            ? err.message
            : 'Erro ao carregar dados. Verifique sua conexão.';
        setError(mensagem);
      } finally {
        if (abortControllerRef.current === controller) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [material]
  );

  useEffect(() => {
    let canceled = false;
    async function run() {
      await fetchEcopontos(false);
    }
    if (!canceled) run();
    return () => {
      canceled = true;
      abortControllerRef.current?.abort();
    };
  }, [fetchEcopontos]);

  const carregarCacheOffline = useCallback(async () => {
    const cached = await localDatabase.listarEcopontosCache();
    if (cached.length > 0) {
      setRawPontos(cached);
      setError(null);
    }
  }, []);

  const ecopontos = useMemo(() => {
    if (!userCoords) {
      return rawPontos;
    }

    return rawPontos.map((ponto) => {
      try {
        const distanciaKm = calcularDistanciaKm(
          userCoords.latitude,
          userCoords.longitude,
          ponto.latitude,
          ponto.longitude
        );
        return {
          ...ponto,
          distanciaKm: formatarDistancia(distanciaKm),
        };
      } catch {
        return ponto;
      }
    });
  }, [rawPontos, userCoords]);

  return {
    ecopontos,
    loading,
    refreshing,
    error,
    offlineCacheDisponivel,
    recarregar: () => fetchEcopontos(false),
    pullToRefresh: () => fetchEcopontos(true),
    carregarCacheOffline,
  };
}
