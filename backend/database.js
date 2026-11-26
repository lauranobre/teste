const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');

const DB_PATH = path.join(__dirname, 'reciclaspot.db');

let dbInstance = null;

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = new DatabaseSync(DB_PATH);
  dbInstance.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS ecopontos (
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
      criadoEm TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      pontosReciclagem INTEGER NOT NULL DEFAULT 0,
      descartesRealizados INTEGER NOT NULL DEFAULT 0,
      kgsReciclados REAL NOT NULL DEFAULT 0,
      fotoPerfilUri TEXT NOT NULL,
      criadoEm TEXT NOT NULL
    );
  `);

  seedInitialData(dbInstance);
  return dbInstance;
}

function seedInitialData(db) {
  const ecopontosCount = db.prepare('SELECT COUNT(*) AS total FROM ecopontos').get();

  if (ecopontosCount.total === 0) {
    const insertEcoponto = db.prepare(`
      INSERT INTO ecopontos (
        id, nome, categoria, endereco, bairro, horarioFuncionamento,
        latitude, longitude, imagemUri, telefoneContato, aceitaEntulho,
        verificado, materiaisAceitos, regras, statusProjeto, criadoEm
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultRules = JSON.stringify([
      'Entregue os materiais limpos e previamente separados.',
      'Limite de descarte diário de 1m³ por cidadão.',
      'Não são aceitos resíduos hospitalares ou lixo orgânico.',
    ]);

    const initialEcopontos = [
      {
        id: '1',
        nome: 'Ecoponto Central Verde',
        categoria: 'Eletrônicos',
        endereco: 'Av. Brasil, 1200',
        bairro: 'Centro',
        horarioFuncionamento: 'Seg a Sáb, 08h às 18h',
        latitude: -21.7972,
        longitude: -50.8791,
        imagemUri: 'imagem1.jpg',
        telefoneContato: '(18) 99999-0001',
        aceitaEntulho: 0,
        verificado: 1,
        materiaisAceitos: JSON.stringify(['Eletrônicos', 'Cabos', 'Celulares']),
        regras: defaultRules,
        statusProjeto: 'Projeto finalizado',
      },
      {
        id: '2',
        nome: 'Cooperativa Recicla Mais',
        categoria: 'Recicláveis Gerais',
        endereco: 'Rua das Flores, 450',
        bairro: 'Jardim Paulista',
        horarioFuncionamento: 'Seg a Sex, 07h às 17h',
        latitude: -21.8015,
        longitude: -50.8742,
        imagemUri: 'images2.jpg',
        telefoneContato: '(18) 98888-1002',
        aceitaEntulho: 0,
        verificado: 1,
        materiaisAceitos: JSON.stringify(['Papel', 'Plástico', 'Vidro', 'Metal']),
        regras: defaultRules,
        statusProjeto: null,
      },
      {
        id: '3',
        nome: 'Scapento Coleta Tech',
        categoria: 'Eletrônicos',
        endereco: 'Rua Amanhã, 25',
        bairro: 'Figueiras',
        horarioFuncionamento: 'Seg a Sáb, 07h às 19h',
        latitude: -21.7938,
        longitude: -50.8835,
        imagemUri: 'images3.jpg',
        telefoneContato: '(18) 99999-0002',
        aceitaEntulho: 0,
        verificado: 1,
        materiaisAceitos: JSON.stringify(['Eletrônicos', 'Eletrodomésticos', 'Monitores']),
        regras: defaultRules,
        statusProjeto: null,
      },
      {
        id: '4',
        nome: 'Ponto Verde Pilhas & Baterias',
        categoria: 'Pilhas/Baterias',
        endereco: 'Rua Vergueiro, 1890',
        bairro: 'Vila Mariana',
        horarioFuncionamento: 'Ter a Sáb, 09h às 18h',
        latitude: -21.8041,
        longitude: -50.8819,
        imagemUri: 'images4.jpg',
        telefoneContato: '(18) 96666-3004',
        aceitaEntulho: 0,
        verificado: 1,
        materiaisAceitos: JSON.stringify(['Pilhas', 'Baterias', 'Lâmpadas']),
        regras: defaultRules,
        statusProjeto: null,
      },
      {
        id: '5',
        nome: 'Ecoponto Beija-Flor',
        categoria: 'Óleo Usado',
        endereco: 'Av. Max Wirth, 8',
        bairro: 'Beija-Flor',
        horarioFuncionamento: 'Seg a Sex, 08h às 18h',
        latitude: -21.7912,
        longitude: -50.8756,
        imagemUri: 'images5.jpg',
        telefoneContato: '(18) 99978-0001',
        aceitaEntulho: 0,
        verificado: 1,
        materiaisAceitos: JSON.stringify(['Óleo de Cozinha', 'Gordura Vegetal']),
        regras: defaultRules,
        statusProjeto: null,
      },
      {
        id: '6',
        nome: 'Coleta Limpa Farmácia',
        categoria: 'Medicamentos',
        endereco: 'Rua Teodoro Sampaio, 980',
        bairro: 'Pinheiros',
        horarioFuncionamento: 'Seg a Sex, 08h30 às 17h30',
        latitude: -21.7995,
        longitude: -50.886,
        imagemUri: 'imagem1.jpg',
        telefoneContato: '(18) 94444-5006',
        aceitaEntulho: 0,
        verificado: 1,
        materiaisAceitos: JSON.stringify(['Medicamentos Vencidos', 'Cartelas', 'Frascos']),
        regras: defaultRules,
        statusProjeto: null,
      },
    ];

    const now = new Date().toISOString();
    for (const p of initialEcopontos) {
      insertEcoponto.run(
        p.id,
        p.nome,
        p.categoria,
        p.endereco,
        p.bairro,
        p.horarioFuncionamento,
        p.latitude,
        p.longitude,
        p.imagemUri,
        p.telefoneContato,
        p.aceitaEntulho,
        p.verificado,
        p.materiaisAceitos,
        p.regras,
        p.statusProjeto,
        now
      );
    }
  }

  const usuariosCount = db.prepare('SELECT COUNT(*) AS total FROM usuarios').get();
  if (usuariosCount.total === 0) {
    const insertUsuario = db.prepare(`
      INSERT INTO usuarios (
        id, nome, username, email, senha, pontosReciclagem,
        descartesRealizados, kgsReciclados, fotoPerfilUri, criadoEm
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    const defaultPasswordHash = hashPassword('123456');

    const initialUsers = [
      {
        id: '1',
        nome: 'Ana Silva',
        username: 'Eco-ana',
        email: 'ana@email.com',
        pontosReciclagem: 150,
        descartesRealizados: 15,
        kgsReciclados: 5.4,
        fotoPerfilUri: 'imagem1.jpg',
      },
      {
        id: '2',
        nome: 'Carlos Souza',
        username: 'Eco-carlos',
        email: 'carlos@email.com',
        pontosReciclagem: 320,
        descartesRealizados: 32,
        kgsReciclados: 9.8,
        fotoPerfilUri: 'images2.jpg',
      },
      {
        id: '3',
        nome: 'Mariana Costa',
        username: 'Eco-mariana1234',
        email: 'mariana@email.com',
        pontosReciclagem: 450,
        descartesRealizados: 45,
        kgsReciclados: 12.3,
        fotoPerfilUri: 'images3.jpg',
      },
    ];

    for (const u of initialUsers) {
      insertUsuario.run(
        u.id,
        u.nome,
        u.username,
        u.email,
        defaultPasswordHash,
        u.pontosReciclagem,
        u.descartesRealizados,
        u.kgsReciclados,
        u.fotoPerfilUri,
        now
      );
    }
  }
}

function mapEcopontoRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    nome: row.nome,
    categoria: row.categoria,
    endereco: row.endereco,
    bairro: row.bairro,
    horarioFuncionamento: row.horarioFuncionamento,
    latitude: row.latitude,
    longitude: row.longitude,
    imagemUri: row.imagemUri,
    telefoneContato: row.telefoneContato,
    aceitaEntulho: Boolean(row.aceitaEntulho),
    verificado: Boolean(row.verificado),
    materiaisAceitos: JSON.parse(row.materiaisAceitos || '[]'),
    regras: JSON.parse(row.regras || '[]'),
    statusProjeto: row.statusProjeto || undefined,
  };
}

function mapUsuarioRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    nome: row.nome,
    username: row.username,
    email: row.email,
    pontosReciclagem: row.pontosReciclagem,
    descartesRealizados: row.descartesRealizados,
    kgsReciclados: row.kgsReciclados,
    fotoPerfilUri: row.fotoPerfilUri,
  };
}

function listarEcopontos({ material, busca } = {}) {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM ecopontos ORDER BY CAST(id AS INTEGER) ASC').all();
  let ecopontos = rows.map(mapEcopontoRow);

  if (material) {
    const filtroNorm = normalizeText(material);
    ecopontos = ecopontos.filter((p) => {
      const catNorm = normalizeText(p.categoria);
      const materiaisNorm = (p.materiaisAceitos || []).map(normalizeText);
      return (
        catNorm.includes(filtroNorm) ||
        filtroNorm.includes(catNorm) ||
        materiaisNorm.some((m) => m.includes(filtroNorm) || filtroNorm.includes(m))
      );
    });
  }

  if (busca) {
    const termoNorm = normalizeText(busca);
    ecopontos = ecopontos.filter((p) => {
      return (
        normalizeText(p.nome).includes(termoNorm) ||
        normalizeText(p.bairro).includes(termoNorm) ||
        normalizeText(p.endereco).includes(termoNorm)
      );
    });
  }

  return ecopontos;
}

function buscarEcopontoPorId(id) {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM ecopontos WHERE id = ?').get(String(id));
  return mapEcopontoRow(row);
}

function criarEcoponto(payload) {
  const db = getDatabase();
  const id = String(Date.now());
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO ecopontos (
      id, nome, categoria, endereco, bairro, horarioFuncionamento,
      latitude, longitude, imagemUri, telefoneContato, aceitaEntulho,
      verificado, materiaisAceitos, regras, statusProjeto, criadoEm
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    payload.nome,
    payload.categoria || 'Recicláveis Gerais',
    payload.endereco,
    payload.bairro,
    payload.horarioFuncionamento || 'Seg a Sex, 08h às 18h',
    Number(payload.latitude) || -21.7972,
    Number(payload.longitude) || -50.8791,
    payload.imagemUri || 'imagem1.jpg',
    payload.telefoneContato || '(18) 99999-0000',
    payload.aceitaEntulho ? 1 : 0,
    payload.verificado === false ? 0 : 1,
    JSON.stringify(payload.materiaisAceitos || [payload.categoria || 'Recicláveis Gerais']),
    JSON.stringify(
      payload.regras || ['Entregue os materiais limpos e previamente separados.']
    ),
    payload.statusProjeto || null,
    now
  );

  return buscarEcopontoPorId(id);
}

function listarUsuarios() {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM usuarios ORDER BY criadoEm DESC').all();
  return rows.map(mapUsuarioRow);
}

function criarUsuario({ nome, email, senha, username }) {
  const db = getDatabase();
  const emailNorm = String(email || '').trim().toLowerCase();

  const existente = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(emailNorm);
  if (existente) {
    const err = new Error('Este e-mail já está cadastrado.');
    err.statusCode = 409;
    throw err;
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const nomeTrim = String(nome || '').trim();
  const generatedUsername =
    username?.trim() ||
    `Eco-${normalizeText(nomeTrim).replace(/[^a-z0-9]/g, '').slice(0, 12) || 'cidadao'}`;

  db.prepare(`
    INSERT INTO usuarios (
      id, nome, username, email, senha, pontosReciclagem,
      descartesRealizados, kgsReciclados, fotoPerfilUri, criadoEm
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    nomeTrim,
    generatedUsername,
    emailNorm,
    hashPassword(senha),
    0,
    0,
    0,
    'imagem1.jpg',
    now
  );

  const created = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
  return mapUsuarioRow(created);
}

function autenticarUsuario(email, senha) {
  const db = getDatabase();
  const emailNorm = String(email || '').trim().toLowerCase();
  const row = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(emailNorm);

  if (!row || row.senha !== hashPassword(senha)) {
    return null;
  }

  return mapUsuarioRow(row);
}

module.exports = {
  DB_PATH,
  getDatabase,
  listarEcopontos,
  buscarEcopontoPorId,
  criarEcoponto,
  listarUsuarios,
  criarUsuario,
  autenticarUsuario,
};
