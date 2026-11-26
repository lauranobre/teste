# ReciclaSpot 🌱♻️

Aplicativo mobile em **React Native + Expo** desenvolvido para conectar cidadãos aos pontos de coleta seletiva (ecopontos) da cidade, com integração à API RESTful, persistência local em **SQLite (`expo-sqlite`)** e **AsyncStorage**, geolocalização em mapa e captura de comprovantes de descarte.

---

## ✨ Funcionalidades

- **Autenticação & Cadastro de Cidadãos (`POST /usuarios`, `POST /auth/login`):** Criação de conta com validação de formulário e sessão persistida localmente.
- **Catálogo Dinâmico de Ecopontos (`GET /ecopontos`):** Listagem filtrável por material (`?material=eletronico`, óleo, papel, pilhas) e busca textual por nome, bairro ou endereço.
- **Resiliência de Rede:**
  - *Pull-to-Refresh* (`RefreshControl`) na listagem principal e nos favoritos.
  - Limite de tempo de espera (*Timeout* de 8s) via Axios + `AbortController`.
  - Estado visual de erro amigável com botão **"Tentar Novamente"** e opção de leitura do cache offline em SQLite.
- **Mapa Geolocalizado (`expo-location` + `react-native-maps`):** Localização atual do usuário, cálculo automático de distância em quilômetros e marcadores interativos.
- **Detalhes & Rotas (`GET /ecopontos/:id`):** Atualização dos dados do ecoponto, horários formatados, materiais aceitos, regras de descarte e abertura de rota no aplicativo de mapas.
- **Favoritos Offline (`expo-sqlite` + `AsyncStorage`):** Persistência relacional local com SQLite (`openDatabaseAsync`, `execAsync`, `runAsync`, `getAllAsync`, `getFirstAsync`) e fallback em `AsyncStorage`.
- **Perfil & Registro de Descarte (`expo-image-picker`):** Atualização de foto de perfil e registro fotográfico de comprovante de descarte com pontuação.

---

## 🧱 Arquitetura em Camadas

```text
ReciclaSpot/
├── backend/                  # Servidor REST local + Banco SQLite (Node.js)
│   ├── database.js           # Schema SQLite (ecopontos e usuarios) + seed inicial
│   ├── server.js             # API HTTP REST (GET /ecopontos, GET /ecopontos/:id, POST /usuarios)
│   └── reciclaspot.db        # Arquivo SQLite gerado automaticamente ao iniciar a API
├── src/
│   ├── components/           # EcopontoCard, ErrorState, LoadingState
│   ├── hooks/                # useEcopontos, useLocation, useFavoritos
│   ├── navigation/           # AppNavigator, TabNavigator
│   ├── screens/              # Splash, Login, Cadastro, Home, Mapa, Detalhes, Favoritos, Perfil
│   ├── services/             # api.ts (Axios), localDatabase.ts (expo-sqlite), storage.ts (AsyncStorage)
│   ├── theme/                # colors.ts e styles.ts (estilos compartilhados DRY)
│   ├── types/                # Interfaces TypeScript e tipos de navegação
│   └── utils/                # distance.ts, schedule.ts, validation.ts, image.ts, constants.ts
├── docs/figma/               # Protótipos de tela e Design System
├── eas.json                  # Perfis de build EAS (incluindo preview APK)
└── App.tsx
```

---

## 🚀 Como Executar no VS Code

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar o Banco de Dados + API REST local
Em um terminal do VS Code, execute:
```bash
npm run api
```
O servidor será iniciado em `http://0.0.0.0:3000` e criará automaticamente o banco SQLite em `backend/reciclaspot.db` com os ecopontos e usuários iniciais:
- **Usuário demo:** `ana@email.com` | **Senha:** `123456`
- **Endpoints disponíveis:**
  - `GET /health`
  - `GET /ecopontos` (opcional: `?material=eletronico&busca=centro`)
  - `GET /ecopontos/:id`
  - `POST /usuarios`
  - `POST /auth/login`

> **Observação de rede no dispositivo físico:** O app detecta automaticamente o IP do host do Expo (`Constants.expoConfig.hostUri`). Caso utilize outra URL/porta, defina `EXPO_PUBLIC_API_URL=http://SEU_IP:3000`.

### 3. Iniciar o Aplicativo Expo
Em outro terminal do VS Code:
```bash
npx expo start
```

---

## 🧪 Testes, Tipagem e Lint

```bash
npm test          # Executa os testes unitários com Jest
npm run typecheck # Verifica tipagem estrita TypeScript (tsc --noEmit)
npm run lint      # Executa análise estática ESLint
```

---

## 📦 Build Android (APK) via EAS

Certifique-se de estar autenticado na conta Expo (`npx eas-cli@latest login`) e execute:

```bash
npx eas-cli@latest build -p android --profile preview
```

---

## 🖼️ Telas do Protótipo (Figma)

- [Capa](docs/figma/capa.png) | [Login](docs/figma/login.png) | [Home](docs/figma/home.png)
- [Mapa](docs/figma/mapa.png) | [Detalhes](docs/figma/detalhes.png) | [Favoritos](docs/figma/favoritos.png) | [Perfil](docs/figma/perfil.png)
