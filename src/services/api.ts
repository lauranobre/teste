import { create as axiosCreate, isCancel } from 'axios';
import type { AxiosError, AxiosInstance } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { CriarUsuarioDTO, LoginDTO, PontoColeta, Usuario } from '../types';
import { API_DEFAULT_PORT, API_TIMEOUT_MS } from '../utils/constants';

export class ApiClientError extends Error {
  statusCode?: number;
  isTimeout: boolean;
  isNetworkError: boolean;
  isCanceled: boolean;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      isTimeout?: boolean;
      isNetworkError?: boolean;
      isCanceled?: boolean;
    }
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = options?.statusCode;
    this.isTimeout = Boolean(options?.isTimeout);
    this.isNetworkError = Boolean(options?.isNetworkError);
    this.isCanceled = Boolean(options?.isCanceled);
  }
}

export function resolveApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) {
      return `http://${host}:${API_DEFAULT_PORT}`;
    }
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_DEFAULT_PORT}`;
  }

  return `http://localhost:${API_DEFAULT_PORT}`;
}

function normalizeAxiosError(error: AxiosError<{ erro?: string; message?: string }>): ApiClientError {
  if (isCancel(error) || error.code === 'ERR_CANCELED') {
    return new ApiClientError('Requisição cancelada.', { isCanceled: true });
  }

  if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
    return new ApiClientError(
      'A conexão demorou mais que o esperado. Verifique sua internet e tente novamente.',
      { isTimeout: true }
    );
  }

  if (!error.response) {
    return new ApiClientError(
      'Erro ao carregar dados. Verifique sua conexão ou se o servidor local está ativo.',
      { isNetworkError: true }
    );
  }

  const serverMessage = error.response.data?.erro || error.response.data?.message;
  return new ApiClientError(
    serverMessage || 'Não foi possível concluir a comunicação com o servidor.',
    { statusCode: error.response.status }
  );
}

class ReciclaSpotApiService {
  readonly client: AxiosInstance;

  constructor() {
    this.client = axiosCreate({
      baseURL: resolveApiBaseUrl(),
      timeout: API_TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        if (!config.baseURL) {
          config.baseURL = resolveApiBaseUrl();
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ erro?: string; message?: string }>) =>
        Promise.reject(normalizeAxiosError(error))
    );
  }

  async getEcopontos(material?: string, signal?: AbortSignal): Promise<PontoColeta[]> {
    const params = material ? { material } : undefined;
    const response = await this.client.get<PontoColeta[]>('/ecopontos', {
      params,
      signal,
    });
    return response.data;
  }

  async getEcopontoById(id: string, signal?: AbortSignal): Promise<PontoColeta> {
    const response = await this.client.get<PontoColeta>(
      `/ecopontos/${encodeURIComponent(id)}`,
      { signal }
    );
    return response.data;
  }

  async cadastrarUsuario(payload: CriarUsuarioDTO, signal?: AbortSignal): Promise<Usuario> {
    const response = await this.client.post<{ usuario: Usuario; mensagem?: string }>(
      '/usuarios',
      payload,
      { signal }
    );
    return response.data.usuario;
  }

  async loginUsuario(payload: LoginDTO, signal?: AbortSignal): Promise<Usuario> {
    const response = await this.client.post<{ usuario: Usuario }>(
      '/auth/login',
      payload,
      { signal }
    );
    return response.data.usuario;
  }
}

export const apiService = new ReciclaSpotApiService();
export const api = apiService.client;
