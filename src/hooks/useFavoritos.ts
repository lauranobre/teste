import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { localDatabase } from '../services/localDatabase';
import { storageService } from '../services/storage';
import { PontoColeta } from '../types';

export function useFavoritos() {
  const [favoritos, setFavoritos] = useState<PontoColeta[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [salvando, setSalvando] = useState<boolean>(false);

  const recarregarFavoritos = useCallback(async () => {
    setCarregando(true);
    try {
      if (Platform.OS !== 'web') {
        const sqliteFavoritos = await localDatabase.listarFavoritos();
        if (sqliteFavoritos.length > 0) {
          setFavoritos(sqliteFavoritos);
          return;
        }
      }

      const storageFavoritos = await storageService.obterFavoritos();
      setFavoritos(storageFavoritos);
    } catch (error) {
      console.warn('[Favoritos] Erro ao carregar favoritos:', error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    let canceled = false;
    async function run() {
      await recarregarFavoritos();
    }
    if (!canceled) run();
    return () => { canceled = true; };
  }, [recarregarFavoritos]);

  const isFavorito = useCallback(
    (pontoId: string) => favoritos.some((item) => item.id === pontoId),
    [favoritos]
  );

  const toggleFavorito = useCallback(
    async (ponto: PontoColeta): Promise<boolean> => {
      setSalvando(true);
      const jaFavorito = favoritos.some((item) => item.id === ponto.id);

      try {
        const novaLista = jaFavorito
          ? favoritos.filter((item) => item.id !== ponto.id)
          : [ponto, ...favoritos];

        if (Platform.OS !== 'web') {
          if (jaFavorito) {
            await localDatabase.removerFavorito(ponto.id);
          } else {
            await localDatabase.salvarFavorito(ponto);
          }
        }

        await storageService.salvarFavoritos(novaLista);
        setFavoritos(novaLista);
        return !jaFavorito;
      } finally {
        setSalvando(false);
      }
    },
    [favoritos]
  );

  return {
    favoritos,
    carregando,
    salvando,
    isFavorito,
    toggleFavorito,
    recarregarFavoritos,
  };
}
