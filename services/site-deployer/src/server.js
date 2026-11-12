import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

import express from "express";
import helmet from "helmet";

const execFileAsync = promisify(execFile);

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function positiveInteger(name, fallback) {
  const value = Number.parseInt(process.env[name] ?? `${fallback}`, 10);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

function repositoryParts(repository) {
  const [owner, name, ...rest] = repository.split("/");
  if (!owner || !name || rest.length) {
    throw new Error("GITHUB_REPOSITORY must use the owner/repository format");
  }
  return { owner, name };
}

function safeGitValue(value, fallback) {
  const normalized = String(value ?? fallback);
  if (!/^[A-Za-z0-9._/-]+$/.test(normalized)) {
    throw new Error("Invalid GitHub repository or branch name");
  }
  return normalized;
}

function verifySignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const received = signatureHeader.slice("sha256=".length);
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const receivedBuffer = Buffer.from(received, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return receivedBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

async function run(command, args, options = {}) {
  const result = await execFileAsync(command, args, {
    ...options,
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.stdout) console.log(result.stdout.trimEnd());
  if (result.stderr) console.log(result.stderr.trimEnd());
  return result;
}

function repositoryUrl({ owner, name }) {
  return `https://github.com/${owner}/${name}.git`;
}

async function removeIfExists(target) {
  await fs.rm(target, { recursive: true, force: true });
}

async function publishRelease({ worktree, siteRoot, commitSha }) {
  const dist = path.join(worktree, "dist");
  const releases = path.join(siteRoot, "releases");
  const release = path.join(releases, commitSha);
  const current = path.join(siteRoot, "current");
  const next = path.join(siteRoot, `.current-${commitSha}`);

  await fs.access(dist);
  await fs.mkdir(releases, { recursive: true });
  await removeIfExists(release);
  await fs.cp(dist, release, { recursive: true });
  await removeIfExists(next);
  await fs.symlink(path.relative(siteRoot, release), next, "dir");
  // Rename replaces the previous symlink, so Nginx never observes a half-copied dist.
  await fs.rename(next, current);

  const releaseNames = (await fs.readdir(releases, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name !== commitSha)
    .sort()
    .reverse();

  const keep = positiveInteger("SITE_RELEASES_TO_KEEP", 3) - 1;
  await Promise.all(releaseNames.slice(keep).map((name) => removeIfExists(path.join(releases, name))));
}

const config = (() => {
  const repository = repositoryParts(process.env.GITHUB_REPOSITORY ?? "Pablo-ArgF/Portfolio");
  return {
    port: positiveInteger("PORT", 3000),
    secret: required("GITHUB_WEBHOOK_SECRET"),
    branch: safeGitValue(process.env.DEPLOY_BRANCH ?? "master", "master"),
    repository,
    sourceUrl: process.env.DEPLOY_SOURCE_URL ?? repositoryUrl(repository),
    siteRoot: process.env.SITE_ROOT ?? "/site",
    reviewApiUrl: process.env.PUBLIC_REVIEW_API_URL ?? "https://landing.pabloaf.com",
  };
})();

let deploymentPromise = null;
let lastDeployment = { status: "not_started" };

async function deploy(commitSha) {
  const worktree = await fs.mkdtemp(path.join(os.tmpdir(), "portfolio-build-"));
  const buildEnvironment = {
    ...process.env,
    PUBLIC_REVIEW_API_URL: config.reviewApiUrl,
  };

  try {
    lastDeployment = { status: "running", commit: commitSha, startedAt: new Date().toISOString() };
    await run("git", ["clone", "--depth", "1", "--branch", config.branch, config.sourceUrl, worktree]);
    const { stdout } = await run("git", ["rev-parse", "HEAD"], { cwd: worktree });
    const checkedOutSha = stdout.trim();
    await run("pnpm", ["install", "--frozen-lockfile"], { cwd: worktree, env: buildEnvironment });
    await run("pnpm", ["build"], { cwd: worktree, env: buildEnvironment });
    await publishRelease({ worktree, siteRoot: config.siteRoot, commitSha: checkedOutSha });
    lastDeployment = {
      status: "succeeded",
      commit: checkedOutSha,
      requestedCommit: commitSha,
      completedAt: new Date().toISOString(),
    };
    console.log(`Deployment succeeded for ${checkedOutSha}`);
  } catch (error) {
    lastDeployment = {
      status: "failed",
      commit: commitSha,
      completedAt: new Date().toISOString(),
      error: error.message,
    };
    console.error("Deployment failed", error);
  } finally {
    await removeIfExists(worktree);
  }
}

function queueDeployment(commitSha) {
  if (deploymentPromise) return false;
  deploymentPromise = deploy(commitSha).finally(() => {
    deploymentPromise = null;
  });
  return true;
}

const app = express();
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));

app.get("/healthz", (_req, res) => {
  res.json({ status: "ok", deployment: lastDeployment });
});

app.post(
  "/hooks/astro-deploy",
  express.raw({ type: "application/json", limit: "2mb" }),
  (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from("");
    if (!verifySignature(rawBody, req.get("X-Hub-Signature-256"), config.secret)) {
      return res.status(401).json({ error: "Invalid webhook signature" });
    }

    if (req.get("X-GitHub-Event") !== "push") {
      return res.status(204).end();
    }

    let payload;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }

    const expectedRepository = `${config.repository.owner}/${config.repository.name}`;
    if (payload.repository?.full_name !== expectedRepository) {
      return res.status(202).json({ ignored: true, reason: "repository" });
    }

    if (payload.ref !== `refs/heads/${config.branch}`) {
      return res.status(202).json({ ignored: true, reason: "branch" });
    }

    if (payload.deleted) {
      return res.status(202).json({ ignored: true, reason: "deleted_ref" });
    }

    const queued = queueDeployment(payload.after ?? "latest");
    return res.status(202).json({ accepted: true, queued });
  },
);

app.listen(config.port, "0.0.0.0", () => {
  console.log(`Site deployer listening on 0.0.0.0:${config.port}`);
  console.log(`Deploying ${config.repository.owner}/${config.repository.name}:${config.branch}`);
  queueDeployment("initial");
});
