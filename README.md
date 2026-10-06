# TrackForge

Collaborative issue tracker with a DevSecOps CI/CD pipeline.

**Stack:** React (Vite) + Tailwind, Node/Express, PostgreSQL + Prisma, Redis, Docker, GitHub Actions (Semgrep, Trivy)

## Run with Docker

```bash
cd docker
cp .env.example .env      # then set JWT_SECRET and JWT_REFRESH_SECRET
docker compose up -d --build
docker compose exec backend node prisma/seed.js
```

Open http://localhost:8080 and sign in with `admin@trackforge.dev` / `Password@123`.

## Structure

- `backend/` Express API, Prisma schema and migrations
- `frontend/` React app, served by nginx in Docker
- `docker/` compose file that builds and runs everything
- `.github/workflows/` CI pipeline
