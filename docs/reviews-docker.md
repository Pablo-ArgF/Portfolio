# Reviews API in Docker

The public Astro site is static. The review form sends its multipart request to the separate `review-api` container, which creates a branch, commits the review files, and opens a GitHub pull request for manual approval.

## 1. Configure the server

From a checkout of this repository:

```bash
cp .env.example .env
nano .env
```

Set at least:

```dotenv
GITHUB_TOKEN=github_pat_...
GITHUB_REPOSITORY=Pablo-ArgF/Portfolio
GITHUB_BASE_BRANCH=master
CORS_ALLOWED_ORIGINS=https://pabloaf.com,https://www.pabloaf.com
```

The token must be a fine-grained token with access to `Pablo-ArgF/Portfolio` and these permissions:

- Contents: Read and write
- Pull requests: Read and write

Do not commit `.env` or put the token in `compose.yaml`.

The API is bound to `127.0.0.1:9000` by default. When `cloudflared` runs in its own Docker container, use the server's DMZ address instead:

```dotenv
REVIEW_API_BIND_IP=10.10.30.10
REVIEW_API_PORT=9000
```

Use the actual address assigned to the `publicservices` VM if it differs from `10.10.30.10`.

## 2. Start and verify

```bash
docker compose up -d --build
docker compose ps
curl http://127.0.0.1:9000/healthz
```

The health response must be:

```json
{"status":"ok"}
```

Useful diagnostics:

```bash
docker compose logs --tail=100 review-api
docker inspect --format '{{json .State.Health}}' portfolio-review-api
```

The API does not store pending reviews locally. The GitHub branch and pull request are the source of truth, so the container can be recreated safely.

## 3. Cloudflare Tunnel configuration

Because the current server runs `cloudflared` in Docker, create a Public Hostname for the existing tunnel with:

```yaml
ingress:
  - hostname: pabloaf.com
    service: http://<existing-portfolio-origin>
  - hostname: www.pabloaf.com
    service: http://<existing-portfolio-origin>
  - hostname: landing.pabloaf.com
    service: http://10.10.30.10:9000
  - service: http_status:404
```

If the tunnel is managed through the Cloudflare dashboard, the equivalent entry is:

| Public hostname | Service type | URL |
|---|---|---|
| `landing.pabloaf.com` | HTTP | `http://10.10.30.10:9000` |

Do not point `landing.pabloaf.com` at the old `192.168.2.10` address. Do not use `api.landing.pabloaf.com`; that hostname is obsolete and is not used by the current frontend.

If `cloudflared` is placed in the same Compose project instead, put both services on the same Docker network and use this origin instead:

```yaml
service: http://review-api:3000
```

After changing the route, restart only the tunnel connector and verify from outside the LAN:

```bash
curl https://landing.pabloaf.com/healthz
```

## 4. Request flow

```text
Browser -> https://landing.pabloaf.com/create-review
       -> Cloudflare Tunnel
       -> review-api:3000
       -> GitHub Git Database API
       -> branch review-<slug>-<timestamp>
       -> pull request against master
```

The frontend displays success only for a 2xx response. API errors and requests taking longer than 20 seconds are shown to the user.

## 5. Publishing after approval

Merging the pull request updates `master`, which must still be connected to the existing Astro deployment mechanism. This container is intentionally responsible for review intake and PR creation; it does not execute arbitrary deployment commands or mount the Docker socket. If the current GitHub push webhook is replaced, configure that deployment separately to pull `master`, run the Astro build, and restart the site process.
