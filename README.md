# JobScope-API

L'objectif de cette API RESTful est de fournir un système complet et performant de collecte, traitement, analyse et distribution de données d'offres d'emploi dans le domaine des technologies de l'information au Canada. 

L'API alimente une application mobile en exposant des endpoints sécurisés permettant la recherche d'emplois filtrée, la gestion de profils utilisateurs, la sauvegarde de favoris, et l'accès à des analyses avancées du marché du travail.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/LoulouPlou/JobScope-API.git
cd JobScope-API
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create MongoDB Connections

Before running the application, you **must create database connections in MongoDB Compass**:

1. Open **MongoDB Compass**.
2. Create **three separate connections**, one for each environment:

   - `mongodb://localhost:27017/jobscope_dev`
   - `mongodb://localhost:27017/jobscope_test`

For production, you need to **set up a MongoDB Atlas cluster**:

   - Use the connection string provided to you

### 4. Set up environment files

```bash
# Copy the example environment file
cp .env.example .env.development
cp .env.example .env.test
cp .env.example .env.production
```

Edit each environment file with your specific configuration.

**Generate secure JWT secrets:**
```bash
openssl rand -hex 32

```

### 5. Set up HTTPS/SSL certificates

```bash
# Create SSL directory
mkdir ssl

# Generate self-signed certificate (for development/testing)
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes
```

---

## Running the Application

### Development Environment

```bash
npm run start:dev
```

**Access:**
- HTTP: `http://localhost:3000`
- HTTPS: `https://localhost:3443`

### Test Environment

```bash
npm run start:test
```

**Access:**
- HTTP: `http://localhost:3001`

### Production Environment

```bash
npm run build
npm run start:prod
```

**Access:**
- HTTPS: `https://localhost:443`

---

## Configuration

The application uses the `config` package for multi-environment configuration.

### Configuration Files Structure

```
config/
├── default.json                      # Base configuration
├── development.json                  # Development overrides
├── test.json                         # Test overrides
├── production.json                   # Production overrides
└── custom-environment-variables.json # Environment variable mapping
```

---

## Available Scripts

| Script | Description | Environment |
|--------|-------------|-------------|
| `npm run start:dev` | Run development server | Development |
| `npm run start:test` | Run test server | Test |
| `npm run build` | Build TypeScript | Production |
| `npm run start:prod` | Start production server | Production |

- Linting & formatting:
  - `npm run lint` / `npm run lint:fix` (ESLint)
  - `npm run format` (Prettier)
- Postman/Newman:
  - Start the API in test mode: `npm run start:test`
  - Run the collection: `npm run test:newman`
  - Uses `postman/JobScope API.postman_collection.json` with `postman/local.postman_environment.json` (base_url `http://localhost:3001`)

---

## Testing & CI Policy

- All new backend features must include tests (at least integration tests).
- We use Jest + Supertest for testing.
- The target global test coverage is **70% or higher**.
- Locally, Jest enforces a 70% global coverage threshold. If coverage is below 70%, `npm test` fails.
- In CI (GitHub Actions), the pipeline **does not fail** on low coverage, but logs a warning and marks the build as **UNSTABLE** if coverage is below 70%.
- The CI workflow (`.github/workflows/ci.yml`) runs on:
  - every push to `main` or `dev`
  - every Pull Request targeting `main` or `dev`.
- All Pull Requests must:
  - have a green CI result (tests passing),
  - be reviewed and approved by at least one teammate before merging,
  - prefer “Squash and merge” for a clean history.
- Postman/Newman (end-to-end API checks):
  - Collection: `postman/JobScope API.postman_collection.json`
  - Local environment: `postman/local.postman_environment.json` (base_url `http://localhost:3001`)
  - Prereqs: MongoDB running locally (`mongodb://localhost:27017/jobscope_test`) then `npm run start:test`
  - Run: `npm run test:newman` (uses the collection above with dynamic variables and status/error assertions)

## Load Testing (k6)

- Script: `test/load/k6-smoke.js` (light smoke/ramp on auth, jobs, analytics, favorites).
- Local prerequisite: install `k6` (e.g., `brew install k6` or the official binary).
- Local run (test env, port 3001):
  1. Start Mongo (e.g., `docker run -p 27017:27017 mongo:6`) if needed.
  2. In one terminal: `npm run start:test`.
  3. In another terminal: `mkdir -p reports && BASE_URL=http://localhost:3001 k6 run test/load/k6-smoke.js --summary-export=reports/k6-summary.json --out json=reports/k6-results.json`.
- CI exports k6 reports as artifacts (`reports/k6-summary.json`, `reports/k6-results.json`).
- Dedicated GitHub Actions workflow: `.github/workflows/load-test.yml` (manual trigger and weekly schedule). It is kept separate from the fast CI to avoid slowing down builds.

---

## Collaborators

- **Kristina Hristova Beneva**

- **Aya Issa**

- **Karolann Mauger**

- **Leïa Plourde**

- **Juba Redjradj**
