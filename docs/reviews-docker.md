# Reviews and deployment in Docker

The stack contains three containers:

- `review-api`: receives a review and opens the GitHub pull request.
- `site-deployer`: receives the verified GitHub `push` webhook, builds the merged Astro site, and publishes the new `dist` atomically.
- `portfolio-site`: Nginx serving the currently published static release.

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
DEPLOY_BRANCH=master
CORS_ALLOWED_ORIGINS=https://pabloaf.com,https://www.pabloaf.com
GITHUB_WEBHOOK_SECRET=the_same_secret_as_the_github_webhook
```

If the old secret is unknown, generate a new one and replace it in both places:

```bash
openssl rand -hex 32
```

The GitHub token must be a fine-grained token with access to `Pablo-ArgF/Portfolio` and these permissions:

- Contents: Read and write
- Pull requests: Read and write

Do not commit `.env` or put the token in `compose.yaml`.

The current repository uses `master`, not `main`. If you rename the default branch later, change both `GITHUB_BASE_BRANCH` and `DEPLOY_BRANCH`.

The review API is bound to `127.0.0.1:9000` and the deploy webhook to `127.0.0.1:9001` by default. Because the current `cloudflared` runs in Docker, use the server's DMZ address instead:

```dotenv
REVIEW_API_BIND_IP=10.10.30.10
REVIEW_API_PORT=9000
DEPLOY_WEBHOOK_BIND_IP=10.10.30.10
DEPLOY_WEBHOOK_PORT=9001
SITE_PORT=8080
```

Use the actual address assigned to the `publicservices` VM if it differs from `10.10.30.10`.

## 2. Start and verify

```bash
docker compose up -d --build
docker compose ps
curl http://127.0.0.1:9000/healthz
curl http://127.0.0.1:9001/healthz
```

Both health endpoints must respond with HTTP 200. The deployer health response also reports the last build status.

Useful diagnostics:

```bash
docker compose logs --tail=100 review-api
docker compose logs --tail=100 site-deployer
docker inspect --format '{{json .State.Health}}' portfolio-review-api
docker inspect --format '{{json .State.Health}}' portfolio-site-deployer
```

The review API does not store pending reviews locally. The GitHub branch and pull request are the source of truth, so the containers can be recreated safely.

## 3. GitHub webhook configuration

In GitHub, open `Settings > Webhooks > Add webhook` or edit the existing webhook and use:

```text
Payload URL: https://webhooks.pabloaf.com/hooks/astro-deploy
Content type: application/json
Secret: exactly the value of GITHUB_WEBHOOK_SECRET
SSL verification: enabled
Events: Just the push event
Active: enabled
```

The endpoint validates `X-Hub-Signature-256`, checks the repository, and ignores every branch other than `refs/heads/master`. It answers quickly with `202` and builds asynchronously, so GitHub does not time out while Astro installs dependencies and compiles.

The deployment sequence is:

```text
push master -> clone master -> pnpm install --frozen-lockfile -> pnpm build
            -> publish dist as a new release -> switch Nginx symlink atomically
```

To make an approved review merge automatically, enable `Allow auto-merge` in `Settings > General > Pull Requests`, then click `Enable auto-merge` on the pull request. If branch protection requires one approval, your approval will satisfy it and GitHub will merge when all other requirements pass.

## 4. Cloudflare Tunnel configuration

Because `cloudflared` runs in Docker, configure the existing tunnel with these routes. Keep any other routes that are unrelated to the portfolio:

```yaml
ingress:
  - hostname: pabloaf.com
    service: http://10.10.30.10:8080
  - hostname: www.pabloaf.com
    service: http://10.10.30.10:8080
  - hostname: landing.pabloaf.com
    service: http://10.10.30.10:9000
  - hostname: webhooks.pabloaf.com
    service: http://10.10.30.10:9001
  - service: http_status:404
```

Dashboard equivalents:

| Public hostname | Service type | URL |
|---|---|---|
| `pabloaf.com` | HTTP | `http://10.10.30.10:8080` |
| `www.pabloaf.com` | HTTP | `http://10.10.30.10:8080` |
| `landing.pabloaf.com` | HTTP | `http://10.10.30.10:9000` |
| `webhooks.pabloaf.com` | HTTP | `http://10.10.30.10:9001` |

Do not point `landing.pabloaf.com` at the old `192.168.2.10` address. Do not use `api.landing.pabloaf.com`; that hostname is obsolete and is not used by the current frontend.

If `pabloaf.com` is still served by the old PM2/Caddy deployment, verify the new site first:

```bash
curl http://10.10.30.10:8080/
```

Only after it returns the expected site should you move the `pabloaf.com` and `www.pabloaf.com` routes to port `8080`.

When managing DNS from the command line instead of the Cloudflare dashboard, create the additional tunnel hostname with the tunnel's existing name or ID:

```bash
cloudflared tunnel route dns <TUNNEL_NAME_OR_ID> webhooks.pabloaf.com
```

Verify the public routes from outside the LAN:

```bash
curl https://landing.pabloaf.com/healthz
curl https://webhooks.pabloaf.com/healthz
curl https://pabloaf.com/
```

## 5. End-to-end flow

```text
Browser -> https://landing.pabloaf.com/create-review
       -> Cloudflare Tunnel
       -> review-api:3000
       -> GitHub Git Database API
       -> branch review-<slug>-<timestamp>
       -> pull request against master
       -> approval + GitHub auto-merge
       -> push master
       -> https://webhooks.pabloaf.com/hooks/astro-deploy
       -> site-deployer:3000
       -> pnpm build
       -> portfolio-site:80
```

The frontend displays success only for a 2xx response. API errors and requests taking longer than 20 seconds are shown to the user.

## 6. Deployment status

The deployment status is available locally at:

```bash
curl http://127.0.0.1:9001/healthz
```

It reports `running`, `succeeded`, or `failed`, together with the commit being served. A failed build leaves the previous release active; it does not replace the live site with a partial `dist` directory.
