import { CategoriaResiduo } from '../types';

export const API_TIMEOUT_MS = 8000;
export const API_DEFAULT_PORT = 3000;

export const SPLASH_DELAY_MS = 2000;
export const MAP_ANIMATION_DURATION_MS = 800;
export const POINTS_PER_DISPOSAL = 10;
export const MIN_PASSWORD_LENGTH = 6;

export const EARTH_RADIUS_KM = 6371;
export const METERS_PER_KM = 1000;

export const DEFAULT_REGION = {
  latitude: -21.7975,
  longitude: -50.8789,
  latitudeDelta: 0.035,
  longitudeDelta: 0.035,
} as const;

export const FOCUSED_REGION_DELTA = 0.02;

export const STORAGE_KEYS = {
  FAVORITOS: '@reciclaspot:favoritos',
  PERFIL_FOTOS: '@reciclaspot:perfil_fotos',
  USUARIO_LOGADO: '@reciclaspot:usuario_logado',
} as const;

export const SQLITE_DB_NAME = 'reciclaspot_local.db';

export const DEFAULT_DISPOSAL_RULES = [
  'Entregue os materiais limpos e previamente separados.',
  'Limite de descarte diário de 1m³ por cidadão.',
  'Não são aceitos resíduos hospitalares ou lixo orgânico.',
] as const;

export interface MaterialFiltro {
  label: string;
  valor: CategoriaResiduo;
  queryMaterial: string;
  cor: string;
}

export const FILTROS_MATERIAIS: MaterialFiltro[] = [
  { label: 'E-lixo', valor: 'Eletrônicos', queryMaterial: 'eletronico', cor: '#009970' },
  { label: 'Óleo', valor: 'Óleo Usado', queryMaterial: 'oleo', cor: '#E59819' },
  { label: 'Papel', valor: 'Recicláveis Gerais', queryMaterial: 'papel', cor: '#4E9AA8' },
  { label: 'Pilhas', valor: 'Pilhas/Baterias', queryMaterial: 'pilha', cor: '#74B583' },
];
