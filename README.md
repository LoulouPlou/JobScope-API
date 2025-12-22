# JobScope API

A comprehensive RESTful API providing IT job market data collection, processing, analysis, and distribution for Canada's technology sector. This API powers the JobScope mobile application with secure endpoints for job search, user management, favorites, and advanced labor market analytics.

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**
- **MongoDB Compass** (recommended for database management)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/LoulouPlou/JobScope-API.git
cd JobScope-API
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up MongoDB connections**

Create three separate database connections in MongoDB Compass:

- **Development**: `mongodb://localhost:27017/jobscope_dev`
- **Test**: `mongodb://localhost:27017/jobscope_test`
- **Production**: Use MongoDB Atlas connection string

4. **Configure environment variables**

```bash
# Create environment files from template
cp .env.example .env.development
cp .env.example .env.test
cp .env.example .env.production
```

Edit each file with your configuration:

```env
# Environment
NODE_ENV=development

# Server Ports
HTTP_PORT=3000
HTTPS_PORT=3443
ENABLE_HTTP=true
ENABLE_HTTPS=true
REDIRECT_HTTP_TO_HTTPS=false

# HTTPS/SSL Configuration
SSL_KEY_PATH=./ssl/key.pem
SSL_CERT_PATH=./ssl/cert.pem

# Database
MONGO_URI=mongodb://localhost:27017/jobscope_dev

# Security
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# CORS
ALLOWED_ORIGINS=*

# Bcrypt
BCRYPT_SALT_ROUNDS=10

# ScrapingDog API Key
SCRAPING_API_KEY=your_scrapingdog_api_key_here
```

**Generate secure JWT secrets:**
```bash
openssl rand -hex 32
```

5. **Set up HTTPS/SSL certificates** (optional for local development)

```bash
# Create SSL directory
mkdir ssl

# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes
```

### Running the Application

#### Development Mode
```bash
npm run start:dev
```
- HTTP: `http://localhost:3000`
- HTTPS: `https://localhost:3443`

#### Test Mode
```bash
npm run start:test
```
- HTTP: `http://localhost:3001`

#### Production Mode
```bash
npm run build
npm run start:prod
```
- HTTPS: `https://localhost:443`

### Database Seeding

The application automatically seeds the database with sample data on first run. To manually seed:

```bash
npm run seed
```

## Features Overview

### Core Functionality
- **Job Search & Filtering**: Advanced search with filters for job type, experience level, location, and keywords
- **User Authentication**: Secure JWT-based authentication with role-based access control (user/admin)
- **Favorites Management**: Save and organize job listings for later review
- **Market Analytics**: Two comprehensive dashboards with interactive visualizations

### Analytics Dashboards

#### Dashboard 1: Market Overview
- Top 10 programming languages in demand
- Top 5 cities with most opportunities
- Top 10 hard skills vs top 10 soft skills comparison
- Job type distribution (full-time, part-time, contract, internship)

#### Dashboard 2: Domain-Specific Analysis
Available domains: Web Development, Data Science, DevOps, Mobile, QA & Security, Design, Management

For each domain:
- Skills distribution radar chart
- Top 5 cities
- Seniority level distribution
- Top 5 technologies

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- Helmet.js security headers
- CORS protection
- Input validation and sanitization

### Admin Panel
- User management (view, edit, delete users)
- Role assignment
- User activity monitoring
- Pagination support for large datasets

## Tech Stack

### Core Technologies
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs

### Security & Middleware
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **express-rate-limit**: Rate limiting
- **express-validator**: Input validation

### Development Tools
- **Testing**: Jest, Supertest, Artillery/k6
- **Code Quality**: ESLint, Prettier
- **API Testing**: Postman, Newman
- **CI/CD**: GitHub Actions
- **Documentation**: Swagger/OpenAPI

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |

### User Profile (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update user profile | Yes |

### Jobs (`/api/jobs`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/jobs/search` | Search jobs with filters | Optional |
| GET | `/api/jobs/recent` | Get 3 recent jobs | No |
| GET | `/api/jobs/:id` | Get job details | Optional |
| GET | `/api/jobs/personalized` | Get personalized recommendations | Yes |

**Search Query Parameters:**
- `title` (string): Job title keyword
- `jobType` (array): Full-time, Part-time, Contract, Internship
- `experience` (array): Junior, Mid, Senior, Lead
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 10)

### Favorites (`/api/favorites`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/favorites` | List user favorites | Yes |
| POST | `/api/favorites/:jobId` | Add job to favorites | Yes |
| DELETE | `/api/favorites/:jobId` | Remove from favorites | Yes |

### Analytics (`/api/analytics`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/dashboard/overview` | Get overview dashboard | No |
| GET | `/api/analytics/dashboard/domain/:domain` | Get domain-specific dashboard | No |

**Valid domains:** Web, Mobile, DevOps, Data, QA & Security, Design, Management

### Admin (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | List all users (paginated) | Admin |
| GET | `/api/admin/users/:id` | Get user details | Admin |
| PUT | `/api/admin/users/:id` | Update user | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |

## Testing

### Test Coverage

The project includes comprehensive test suites:
- **Unit Tests**: Service layer logic
- **Integration Tests**: API endpoints and database operations
- **Load Tests**: Performance and stress testing with k6

### Running Tests

```bash
# Run all tests
npm test

# Run all test with coverage reports
npm run test:cov
```

### API Testing with Postman/Newman

```bash
# Start test server
npm run start:test

# Run Postman collection
npm run test:newman
```

### Load Testing with k6

```bash
# Install k6 (macOS)
brew install k6

# Install k6 (windows via bash cmd)
choco install k6

# Create reports folder and run smoke test
mkdir -p reports && BASE_URL=http://localhost:3001 k6 run test/load/k6-smoke.js --summary-export=reports/k6-summary.json --out json=reports/k6-results.json

# Run smoke test if you already have reports folder
BASE_URL=http://localhost:3001 k6 run test/load/k6-smoke.js --summary-export=reports/k6-summary.json --out json=reports/k6-results.json
```

### CI/CD Pipeline

All tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

## Documentation

### Configuration Files

The application uses the `config` package for multi-environment configuration:

```
config/
├── default.json                      # Base configuration
├── development.json                  # Development overrides
├── test.json                         # Test overrides
├── production.json                   # Production overrides
└── custom-environment-variables.json # Environment variable mapping
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start development server |
| `npm run start:test` | Start test server |
| `npm run start:prod` | Start production server |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm test` | Run all tests with coverage |
| `npm run lint` | Check code style |
| `npm run lint:fix` | Fix code style issues |
| `npm run format` | Format code with Prettier |
| `npm run test:newman` | Run Postman collection tests |

## Collaborators

### Development Team

| Name | Role | Responsibilities |
|------|------|-----------------|
| **Kristina Hristova Beneva** | Infrastructure & Security Lead | Node.js/Express/TypeScript setup, MongoDB configuration, JWT authentication, security (rate limiting, HTTPS, Helmet, CORS), documentation, Routes CRUD |
| **Leïa Plourde** | Data Integration Lead | External API integration, data collection scripts, data cleaning, normalization, validation, complex aggregations |
| **Aya Issa** | Backend Developer | TypeScript interfaces, Mongoose models, CRUD routes, middleware, error handling, pagination |
| **Juba Redjradj** | Backend Developer | Routes & endpoints, authentication middleware, data validation, standardized error handling, unit tests |
| **Karolann Mauger** | QA & DevOps Engineer | Integration tests, security tests, load tests (Artillery/k6), Postman collections, CI/CD pipeline, deployment |


## Related Projects

- **Figma Design**: [JobScope UI](https://www.figma.com/design/2DlADMSS6JSM79s7wyOxq6/JobScope?node-id=0-1&p=f&t=5HtndrcXqvOW7RfS-0)
- **Trello Board**: [Project Management](https://trello.com/b/nHx9785o/jobscope-api)
- **Mobile App Repository**: [JobScope-Frontend](https://github.com/kbeneva/JobScope-Frontend)
- **API Documentation**: [Deployed API](https://jobscope-api.onrender.com)

## External API

The project uses **Scrapingdog Google Jobs API** for data collection:
- Returns 10 results per request
- Requires keyword-based search strategy
- Focused on Canadian IT job market
- Data extraction via regex and keywords for structured information

Before running **data-scraper**, create an account on [ScrapingDog](https://www.scrapingdog.com/) to obtain an API key and add it to your `.env` file.  
If you don’t have a key, comment out lines 45 to 56.

```bash
# Run Data Scraper Job
npm run scrape
```

**Note**: The automated job scraper (cron job) was planned for Render deployment but encountered API availability issues during final testing. Historical logs available as proof of concept. Also note that this script uploads data directly to production, as it was intended to be deployed.
