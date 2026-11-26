import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalPerfilFotos, PontoColeta, Usuario } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

async function getJsonItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[Storage] Falha ao ler chave ${key}:`, error);
    return fallback;
  }
}

async function setJsonItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[Storage] Falha ao salvar chave ${key}:`, error);
    throw error;
  }
}

export const storageService = {
  async obterFavoritos(): Promise<PontoColeta[]> {
    return getJsonItem<PontoColeta[]>(STORAGE_KEYS.FAVORITOS, []);
  },

  async salvarFavoritos(favoritos: PontoColeta[]): Promise<void> {
    await setJsonItem(STORAGE_KEYS.FAVORITOS, favoritos);
  },

  async obterPerfilFotos(): Promise<LocalPerfilFotos> {
    return getJsonItem<LocalPerfilFotos>(STORAGE_KEYS.PERFIL_FOTOS, {});
  },

  async salvarPerfilFotos(fotos: LocalPerfilFotos): Promise<void> {
    const atual = await this.obterPerfilFotos();
    await setJsonItem(STORAGE_KEYS.PERFIL_FOTOS, {
      fotoPerfilUri: fotos.fotoPerfilUri ?? atual.fotoPerfilUri,
      ultimaFotoDescarte: fotos.ultimaFotoDescarte ?? atual.ultimaFotoDescarte,
    });
  },

  async obterUsuarioLogado(): Promise<Usuario | null> {
    return getJsonItem<Usuario | null>(STORAGE_KEYS.USUARIO_LOGADO, null);
  },

  async salvarUsuarioLogado(usuario: Usuario): Promise<void> {
    await setJsonItem(STORAGE_KEYS.USUARIO_LOGADO, usuario);
  },

  async removerUsuarioLogado(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USUARIO_LOGADO);
    } catch (error) {
      console.warn('[Storage] Falha ao remover sessão do usuário:', error);
    }
  },
};
