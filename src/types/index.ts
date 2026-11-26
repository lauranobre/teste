import { ImageSourcePropType } from 'react-native';

export type CategoriaResiduo =
  | 'Eletrônicos'
  | 'Óleo Usado'
  | 'Pilhas/Baterias'
  | 'Recicláveis Gerais'
  | 'Medicamentos';

export interface PontoColeta {
  id: string;
  nome: string;
  categoria: CategoriaResiduo;
  endereco: string;
  bairro: string;
  horarioFuncionamento: string;
  latitude: number;
  longitude: number;
  imagemUri: ImageSourcePropType | string;
  telefoneContato: string;
  aceitaEntulho: boolean;
  distanciaKm?: string;
  verificado?: boolean;
  materiaisAceitos?: string[];
  regras?: string[];
  statusProjeto?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  username?: string;
  email: string;
  pontosReciclagem: number;
  descartesRealizados?: number;
  kgsReciclados?: number;
  fotoPerfilUri: ImageSourcePropType | string;
}

export interface CriarUsuarioDTO {
  nome: string;
  email: string;
  senha: string;
  username?: string;
}

export interface LoginDTO {
  email: string;
  senha: string;
}

export interface Coordenadas {
  latitude: number;
  longitude: number;
}

export interface LocalPerfilFotos {
  fotoPerfilUri?: string;
  ultimaFotoDescarte?: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Cadastro: undefined;
  MainTabs: undefined;
  Detalhes: { ponto: PontoColeta };
};

export type TabParamList = {
  Home: undefined;
  Mapa: undefined;
  Favoritos: undefined;
  Perfil: undefined;
};
