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

---

## Collaborators

- **Kristina Hristova Beneva**

- **Aya Issa**

- **Karolann Mauger**

- **Leïa Plourde**

- **Juba Redjradj**