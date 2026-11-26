import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { CategoriaResiduo, PontoColeta } from '../types';
import { SQLITE_DB_NAME } from '../utils/constants';

interface EcopontoRow {
  id: string;
  nome: string;
  categoria: string;
  endereco: string;
  bairro: string;
  horarioFuncionamento: string;
  latitude: number;
  longitude: number;
  imagemUri: string;
  telefoneContato: string;
  aceitaEntulho: number;
  verificado: number;
  materiaisAceitos: string;
  regras: string;
  statusProjeto: string | null;
}

class LocalDatabaseService {
  private dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

  private async getDb(): Promise<SQLite.SQLiteDatabase | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    if (!this.dbPromise) {
      this.dbPromise = this.initialize();
    }

    try {
      return await this.dbPromise;
    } catch (error) {
      this.dbPromise = null;
      console.warn('[SQLite] Banco local indisponível:', error);
      return null;
    }
  }

  private async initialize(): Promise<SQLite.SQLiteDatabase> {
    const db = await SQLite.openDatabaseAsync(SQLITE_DB_NAME);

    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS ecopontos_cache (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        categoria TEXT NOT NULL,
        endereco TEXT NOT NULL,
        bairro TEXT NOT NULL,
        horarioFuncionamento TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        imagemUri TEXT NOT NULL,
        telefoneContato TEXT NOT NULL,
        aceitaEntulho INTEGER NOT NULL DEFAULT 0,
        verificado INTEGER NOT NULL DEFAULT 1,
        materiaisAceitos TEXT NOT NULL,
        regras TEXT NOT NULL,
        statusProjeto TEXT
      );

      CREATE TABLE IF NOT EXISTS favoritos (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        categoria TEXT NOT NULL,
        endereco TEXT NOT NULL,
        bairro TEXT NOT NULL,
        horarioFuncionamento TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        imagemUri TEXT NOT NULL,
        telefoneContato TEXT NOT NULL,
        aceitaEntulho INTEGER NOT NULL DEFAULT 0,
        verificado INTEGER NOT NULL DEFAULT 1,
        materiaisAceitos TEXT NOT NULL,
        regras TEXT NOT NULL,
        statusProjeto TEXT,
        salvoEm TEXT NOT NULL
      );
    `);

    return db;
  }

  private mapRowToPonto(row: EcopontoRow): PontoColeta {
    return {
      id: row.id,
      nome: row.nome,
      categoria: row.categoria as CategoriaResiduo,
      endereco: row.endereco,
      bairro: row.bairro,
      horarioFuncionamento: row.horarioFuncionamento,
      latitude: row.latitude,
      longitude: row.longitude,
      imagemUri: row.imagemUri,
      telefoneContato: row.telefoneContato,
      aceitaEntulho: Boolean(row.aceitaEntulho),
      verificado: Boolean(row.verificado),
      materiaisAceitos: JSON.parse(row.materiaisAceitos || '[]') as string[],
      regras: JSON.parse(row.regras || '[]') as string[],
      statusProjeto: row.statusProjeto ?? undefined,
    };
  }

  async sincronizarEcopontosCache(pontos: PontoColeta[]): Promise<void> {
    const db = await this.getDb();
    if (!db) return;

    try {
      for (const ponto of pontos) {
        const imagemTexto = typeof ponto.imagemUri === 'string' ? ponto.imagemUri : 'imagem1.jpg';
        await db.runAsync(
          `INSERT OR REPLACE INTO ecopontos_cache (
            id, nome, categoria, endereco, bairro, horarioFuncionamento,
            latitude, longitude, imagemUri, telefoneContato, aceitaEntulho,
            verificado, materiaisAceitos, regras, statusProjeto
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            ponto.id,
            ponto.nome,
            ponto.categoria,
            ponto.endereco,
            ponto.bairro,
            ponto.horarioFuncionamento,
            ponto.latitude,
            ponto.longitude,
            imagemTexto,
            ponto.telefoneContato,
            ponto.aceitaEntulho ? 1 : 0,
            ponto.verificado === false ? 0 : 1,
            JSON.stringify(ponto.materiaisAceitos ?? [ponto.categoria]),
            JSON.stringify(ponto.regras ?? []),
            ponto.statusProjeto ?? null,
          ]
        );
      }
    } catch (error) {
      console.warn('[SQLite] Erro ao sincronizar cache de ecopontos:', error);
    }
  }

  async listarEcopontosCache(): Promise<PontoColeta[]> {
    const db = await this.getDb();
    if (!db) return [];

    try {
      const rows = await db.getAllAsync<EcopontoRow>(
        'SELECT * FROM ecopontos_cache ORDER BY CAST(id AS INTEGER) ASC;'
      );
      return rows.map((row) => this.mapRowToPonto(row));
    } catch (error) {
      console.warn('[SQLite] Erro ao ler cache de ecopontos:', error);
      return [];
    }
  }

  async listarFavoritos(): Promise<PontoColeta[]> {
    const db = await this.getDb();
    if (!db) return [];

    try {
      const rows = await db.getAllAsync<EcopontoRow>(
        'SELECT * FROM favoritos ORDER BY salvoEm DESC;'
      );
      return rows.map((row) => this.mapRowToPonto(row));
    } catch (error) {
      console.warn('[SQLite] Erro ao listar favoritos:', error);
      return [];
    }
  }

  async salvarFavorito(ponto: PontoColeta): Promise<void> {
    const db = await this.getDb();
    if (!db) return;

    const imagemTexto = typeof ponto.imagemUri === 'string' ? ponto.imagemUri : 'imagem1.jpg';
    await db.runAsync(
      `INSERT OR REPLACE INTO favoritos (
        id, nome, categoria, endereco, bairro, horarioFuncionamento,
        latitude, longitude, imagemUri, telefoneContato, aceitaEntulho,
        verificado, materiaisAceitos, regras, statusProjeto, salvoEm
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        ponto.id,
        ponto.nome,
        ponto.categoria,
        ponto.endereco,
        ponto.bairro,
        ponto.horarioFuncionamento,
        ponto.latitude,
        ponto.longitude,
        imagemTexto,
        ponto.telefoneContato,
        ponto.aceitaEntulho ? 1 : 0,
        ponto.verificado === false ? 0 : 1,
        JSON.stringify(ponto.materiaisAceitos ?? [ponto.categoria]),
        JSON.stringify(ponto.regras ?? []),
        ponto.statusProjeto ?? null,
        new Date().toISOString(),
      ]
    );
  }

  async removerFavorito(id: string): Promise<void> {
    const db = await this.getDb();
    if (!db) return;

    await db.runAsync('DELETE FROM favoritos WHERE id = ?;', [id]);
  }

  async verificarFavorito(id: string): Promise<boolean> {
    const db = await this.getDb();
    if (!db) return false;

    const row = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM favoritos WHERE id = ?;',
      [id]
    );
    return Boolean(row);
  }
}

export const localDatabase = new LocalDatabaseService();
