# Card Game API

NestJS API backed by PostgreSQL. Docker is used for the local PostgreSQL database; the API runs locally with Node.js.

## Prerequisites

- [Node.js (LTS)](https://nodejs.org/en/download) — includes npm.
- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) — install it, start Docker Desktop, and complete its first-run setup before continuing.

Confirm both are available in a new PowerShell window:

```powershell
node --version
npm --version
docker --version
docker compose version
```

## Start the project (Windows)

Open PowerShell in the project folder and run:

```powershell
# 1. Install API dependencies (only needed after cloning or dependency changes)
npm.cmd install

# 2. Create your local environment file (only needed once)
Copy-Item .env.example .env

# 3. Start PostgreSQL in Docker
docker compose up -d

# 4. Start the API in watch mode
npm.cmd run start:dev
```

The API is ready when the terminal reports that Nest has started. Check it at:

- Health check: <http://localhost:3000/api/health>
- OpenAPI/Swagger docs: <http://localhost:3000/api/docs>

Keep the `npm.cmd run start:dev` terminal open while developing. The API reloads when source files change.

## Supabase authentication

Authenticated API routes use Supabase access tokens. In the Supabase dashboard, copy the **Project URL** (available from **Connect** or **Project Settings → API**) into the local `.env` file:

```env
# Replace with your own Supabase Project URL.
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_JWT_AUDIENCE=authenticated

# The exact URL where the browser app runs locally.
CORS_ORIGINS=http://localhost:4200
```

The frontend signs users in through this same Supabase project and sends the resulting access token to protected API routes as `Authorization: Bearer <access_token>`. The API uses its matching `SUPABASE_URL` to verify that token; it does not perform the browser sign-in itself.

For email sign-in, set Supabase **Authentication → URL Configuration** to the frontend URL and add that URL (for example, `http://localhost:4200/**`) to **Redirect URLs**. The API verifies Supabase JWTs using the project's public signing keys, so keep an asymmetric current signing key (such as ECC P-256 / ES256) enabled in **Project Settings → JWT Keys**.

Do not commit `.env`. The frontend uses the Supabase Project URL and its publishable key; never expose a Supabase `secret`/`service_role` key in the frontend or add it to this API merely for user-token verification.

## Useful Docker commands

```powershell
# See whether PostgreSQL is running and healthy
docker compose ps

# View PostgreSQL logs
docker compose logs -f postgres

# Stop PostgreSQL without deleting its data
docker compose down
```

The database is stored in Docker's `postgres_data` volume and remains after `docker compose down`. Do not use `docker compose down -v` unless you deliberately want to permanently erase local database data.

## Tests and build

```powershell
npm.cmd run build
npm.cmd test -- --runInBand
```

## Database migrations

Schema synchronization is disabled. Create and review a TypeORM migration whenever entities change, then apply compiled migrations with:

```powershell
npm.cmd run migration:run
```

## Deploy on Ubuntu with PM2

This project uses Docker only for PostgreSQL. On the Ubuntu server, install Node.js, Docker Engine with the Compose plugin, and PM2. Use a supported Ubuntu LTS release and a non-root deployment user.

### 1. Install server software

For Ubuntu 22.04 on AMD64, install Node.js 22 LTS and Docker Engine with its Compose plugin as root:

```bash
apt-get update
apt-get install -y ca-certificates curl gnupg git build-essential

# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# Docker Engine and Docker Compose plugin
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu jammy stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
```

These Docker commands follow Docker's official [Ubuntu installation instructions](https://docs.docker.com/engine/install/ubuntu/). Do not use Docker's convenience installation script on a production server.

Install PM2 after Node.js is available:

```bash
sudo npm install --global pm2
node --version
npm --version
docker --version
docker compose version
pm2 --version
```

To let the deployment user run Docker without `sudo`, follow Docker's [post-install steps](https://docs.docker.com/engine/install/linux-postinstall/). This grants that user root-equivalent access to Docker, so only do it for a trusted deployment user.

### 2. Configure and start the application

Clone or upload the repository, then run these commands from its root directory:

```bash
# Install the exact dependency versions in package-lock.json
npm ci

# Create the server-only configuration file
cp .env.example .env

# Edit .env before continuing: set NODE_ENV=production, CORS_ORIGINS,
# database credentials, and production database/TLS settings.
nano .env

# Start the PostgreSQL container
docker compose up -d

# Build, then apply reviewed migrations before the API starts
npm run migration:run

# Build and start (or reload) the API through PM2
npm run pm2:add
```

Confirm the process and database are running:

```bash
pm2 status
pm2 logs card-game-api
docker compose ps
curl http://127.0.0.1:3000/api/health
```

### 3. Start PM2 automatically after a reboot

Run this as the same non-root user that owns the checkout and runs PM2:

```bash
pm2 startup
```

PM2 prints one `sudo` command. Copy and run that exact command, then save the current process list:

```bash
pm2 save
```

After a deployment, run:

```bash
git pull
npm ci
npm run migration:run
npm run pm2:add
pm2 save
```

`npm run pm2:add` builds the API and uses `ecosystem.config.cjs` to start or reload the process named `card-game-api`. To stop it intentionally, use `npm run pm2:remove`.

## Production notes

- Run migrations as a separate step before starting the API.
- Provide secrets through the deployment platform; do not commit `.env`.
- Swagger is enabled outside production by default. Set `SWAGGER_ENABLED=false` in production unless the endpoint is intentionally protected.
- Set `CORS_ORIGINS` to the exact browser origins used by the deployment.
- PostgreSQL is bound to `127.0.0.1:5432`, so it is available to the API on the server but is not publicly reachable.
- Put the API behind a TLS-enabled reverse proxy (such as Nginx or Caddy) before exposing it publicly.
