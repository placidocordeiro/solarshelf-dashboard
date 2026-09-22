# SolarShelf Dashboard

Dashboard web para gerenciamento de produtos, pallets e tags.

## Requisitos

- Node.js 20+
- npm

## Desenvolvimento

```bash
npm install
cp .env.example .env
npm run dev
```

Aplicacao abre em `http://localhost:5173`.

## Variaveis de ambiente

Configure `VITE_API_URL` em `.env`:

```env
VITE_API_URL=http://localhost:3000
```

`.env` contem configuracao local e nao deve ser commitado. Use `.env.example` como referencia.

## Scripts

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # build de producao
npm run preview  # pre-visualiza build
npm run lint     # verifica codigo
```
