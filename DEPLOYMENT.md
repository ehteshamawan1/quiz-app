# Deployment Guide (Ubuntu 22.04, Docker + Nginx + SSL)

This guide is written for a server agent to deploy this repo on a VPS. It is intentionally detailed and prescriptive to avoid missed steps. The target domain is `studying.lingo` and the VPS is Ubuntu 22.04.

## 0) Assumptions

- You have SSH access to the VPS with a non-root user that can sudo.
- DNS for `studying.lingo` points to the VPS IP.
- You are deploying the `main` branch of `https://github.com/ehteshamawan1/quiz-app`.
- You will use Docker Compose and Nginx as a reverse proxy with Let's Encrypt SSL.

If any of these differ, adjust as needed.

---

## 1) System Preparation

Update system and install required packages:

```bash
sudo apt update
sudo apt install -y git curl nginx certbot python3-certbot-nginx
```

---

## 2) Install Docker + Compose

```bash
curl -fsSL https://get.docker.com | sudo bash
sudo usermod -aG docker $USER
newgrp docker
```

Verify:

```bash
docker --version
docker compose version
```

---

## 3) Clone the Repository

```bash
sudo mkdir -p /opt/quiz-app
sudo chown $USER:$USER /opt/quiz-app
cd /opt/quiz-app
git clone https://github.com/ehteshamawan1/quiz-app .
```

---

## 4) Environment Configuration

Copy the sample environment file and edit:

```bash
cp .env.example .env
nano .env
```

### Required values to confirm in `.env`

You must ensure the backend can connect to Postgres, has a JWT secret, and knows its public base URL (if required).

Check `.env.example` in the repo for the exact keys. Common fields:

- `DATABASE_URL` or `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`
- `NODE_ENV`
- `APP_URL` or `API_URL` (if present)

If you are unsure, inspect backend config in `apps/backend/src` for env usage.

---

## 5) Persistent Uploads Directory

The backend serves uploaded files from `/uploads/`. Create a host directory so uploads persist:

```bash
mkdir -p /opt/quiz-app/uploads/images
```

---

## 6) Start Docker Services

Build and start all services:

```bash
cd /opt/quiz-app
docker compose pull
docker compose build
docker compose up -d
```

Check containers:

```bash
docker ps
```

You should see at least:
- frontend service
- backend service
- database service

---

## 7) Run DB Migrations and Seeders

The backend includes scripts for migrations and seed data. Identify the backend container name:

```bash
docker ps
```

Then run:

```bash
docker exec -it <backend_container> npm --prefix apps/backend run db:migrate
docker exec -it <backend_container> npm --prefix apps/backend run db:seed
```

If you want to run everything at once:

```bash
docker exec -it <backend_container> npm --prefix apps/backend run db:setup
```

---

## 8) Configure Nginx Reverse Proxy

Create Nginx config file:

```bash
sudo nano /etc/nginx/sites-available/studying.lingo
```

Paste this config (adjust ports to match `docker-compose.yml`):

```nginx
server {
    server_name studying.lingo;

    # Frontend (Vite build/preview or static service)
    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploaded files
    location /uploads/ {
        proxy_pass http://127.0.0.1:3000/uploads/;
    }
}
```

Enable the site and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/studying.lingo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 9) SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d studying.lingo
```

Verify auto-renew:

```bash
sudo systemctl status certbot.timer
```

---

## 10) Verify Deployment

- Open `https://studying.lingo` and ensure the frontend loads.
- Ensure API requests work (e.g. login/registration).
- Upload a flashcard image and verify it loads from `/uploads/`.
- Play a quiz and confirm sounds work.

---

## 11) Updating the Deployment

When you need to update:

```bash
cd /opt/quiz-app
git pull
docker compose build
docker compose up -d

# If migrations changed:
docker exec -it <backend_container> npm --prefix apps/backend run db:migrate
```

---

## 12) Troubleshooting

**Check logs**

```bash
docker compose logs -f
```

**Check backend logs only**

```bash
docker logs -f <backend_container>
```

**Check Nginx**

```bash
sudo nginx -t
sudo systemctl status nginx
sudo journalctl -u nginx -n 200 --no-pager
```

**Check DB**

```bash
docker exec -it <db_container> psql -U <db_user> -d <db_name>
```

---

## 13) Notes

- The backend serves static uploads via `/uploads/` (already configured in `apps/backend/src/main.ts`).
- If the compose file exposes different ports, update Nginx accordingly.
- If you switch to a static build for frontend, update the Nginx frontend proxy or serve static files directly.
