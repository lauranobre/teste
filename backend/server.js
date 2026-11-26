const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const {
  DB_PATH,
  getDatabase,
  listarEcopontos,
  buscarEcopontoPorId,
  criarEcoponto,
  listarUsuarios,
  criarUsuario,
  autenticarUsuario,
} = require('./database');

const PORT = Number(process.env.PORT || 3000);
const ASSETS_DIR = path.resolve(__dirname, '..', 'src', 'assets', 'images');

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString('utf8');
      if (body.length > 1024 * 1024) {
        reject(new Error('Corpo da requisição muito grande.'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        const err = new Error('JSON inválido no corpo da requisição.');
        err.statusCode = 400;
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function serveImage(res, filename) {
  const safeName = path.basename(filename);
  const fullPath = path.join(ASSETS_DIR, safeName);

  if (!fullPath.startsWith(ASSETS_DIR) || !fs.existsSync(fullPath)) {
    sendJson(res, 404, { erro: 'Imagem não encontrada.' });
    return;
  }

  const ext = path.extname(safeName).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

  res.writeHead(200, {
    'Content-Type': mimeType,
    'Access-Control-Allow-Origin': '*',
  });
  fs.createReadStream(fullPath).pipe(res);
}

function createServer() {
  getDatabase();

  return http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      res.end();
      return;
    }

    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = requestUrl.pathname;

    try {
      if (req.method === 'GET' && pathname === '/health') {
        sendJson(res, 200, {
          status: 'ok',
          service: 'reciclaspot-api',
          database: path.basename(DB_PATH),
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (req.method === 'GET' && pathname.startsWith('/assets/images/')) {
        const filename = pathname.replace('/assets/images/', '');
        serveImage(res, filename);
        return;
      }

      if (req.method === 'GET' && pathname === '/ecopontos') {
        const material = requestUrl.searchParams.get('material') || undefined;
        const busca = requestUrl.searchParams.get('busca') || undefined;
        const ecopontos = listarEcopontos({ material, busca });
        sendJson(res, 200, ecopontos);
        return;
      }

      if (req.method === 'GET' && pathname.startsWith('/ecopontos/')) {
        const id = decodeURIComponent(pathname.replace('/ecopontos/', ''));
        const ponto = buscarEcopontoPorId(id);
        if (!ponto) {
          sendJson(res, 404, { erro: 'Ecoponto não encontrado.' });
          return;
        }
        sendJson(res, 200, ponto);
        return;
      }

      if (req.method === 'POST' && pathname === '/ecopontos') {
        const body = await readRequestBody(req);
        if (!body.nome || !body.endereco || !body.bairro) {
          sendJson(res, 400, { erro: 'Nome, endereço e bairro são obrigatórios.' });
          return;
        }
        const novo = criarEcoponto(body);
        sendJson(res, 201, novo);
        return;
      }

      if (req.method === 'GET' && pathname === '/usuarios') {
        const usuarios = listarUsuarios();
        sendJson(res, 200, usuarios);
        return;
      }

      if (req.method === 'POST' && pathname === '/usuarios') {
        const body = await readRequestBody(req);
        const { nome, email, senha, username } = body;

        if (!nome || !String(nome).trim() || !email || !String(email).trim() || !senha) {
          sendJson(res, 400, { erro: 'Nome, e-mail e senha são obrigatórios.' });
          return;
        }

        if (String(senha).length < 6) {
          sendJson(res, 400, { erro: 'A senha deve ter pelo menos 6 caracteres.' });
          return;
        }

        const usuario = criarUsuario({ nome, email, senha, username });
        sendJson(res, 201, {
          mensagem: 'Cidadão cadastrado com sucesso!',
          usuario,
        });
        return;
      }

      if (req.method === 'POST' && pathname === '/auth/login') {
        const body = await readRequestBody(req);
        const { email, senha } = body;

        if (!email || !senha) {
          sendJson(res, 400, { erro: 'Informe e-mail e senha.' });
          return;
        }

        const usuario = autenticarUsuario(email, senha);
        if (!usuario) {
          sendJson(res, 401, { erro: 'E-mail ou senha inválidos.' });
          return;
        }

        sendJson(res, 200, { usuario });
        return;
      }

      sendJson(res, 404, { erro: 'Rota não encontrada.' });
    } catch (error) {
      const status = error.statusCode || 500;
      sendJson(res, status, {
        erro: error.message || 'Erro interno no servidor.',
      });
    }
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[ReciclaSpot API] Servidor rodando em http://0.0.0.0:${PORT}`);
    console.log(`[ReciclaSpot API] Banco SQLite ativo em: ${DB_PATH}`);
  });
}

module.exports = { createServer };
