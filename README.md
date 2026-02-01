Perfeito. README completo, mínimo e objetivo (Docker-only):

# Radar de Talentos – API

API backend (POC) do Radar de Talentos.  
Stack: **NestJS + TypeScript + PostgreSQL (TypeORM)**.

## Requisitos
- Docker
- Docker Compose

## Setup

```bash
git clone <repo-url>
cd radar-talentos-api
cp .env.example .env
```

.env (exemplo):
```
PORT=3000
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=radar_talentos
```
Rodar
```bash
docker compose up --build
```
API disponível em:
```
http://localhost:3000
```
Parar / Reset
```bash
docker compose down        # para tudo
docker compose down -v     # para e apaga o banco
```

### Testes
- Testes manuais via Postman
- Endpoint principal:
```
GET / -> Hello World!
GET /radars
```

## Migrations
Executa as migrations dentro do container da API
```bash
docker compose exec api yarn typeorm migration:run
```

### Seed de Talentos
A seed cria Talent Cards sintéticos para testes do Radar.
```bash
docker compose exec api yarn seed
```
