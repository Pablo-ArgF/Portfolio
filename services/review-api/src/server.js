import crypto from "node:crypto";

import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import multer from "multer";
import { Octokit } from "@octokit/rest";

const IMAGE_EXTENSIONS = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

class HttpError extends Error {
  constructor(status, message, details = undefined) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function integerEnv(name, fallback) {
  const value = Number.parseInt(process.env[name] ?? `${fallback}`, 10);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

function parseRepository(repository) {
  const [owner, repo, ...rest] = repository.split("/");
  if (!owner || !repo || rest.length > 0) {
    throw new Error("GITHUB_REPOSITORY must use the owner/repository format");
  }
  return { owner, repo };
}

function parseOrigins(value) {
  return new Set(
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

function normalizeText(value, maxLength, fieldName) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) {
    throw new HttpError(400, `${fieldName} is required`);
  }
  if (text.length > maxLength) {
    throw new HttpError(400, `${fieldName} is too long`, {
      maxLength,
    });
  }
  return text;
}

function optionalText(value, maxLength, fieldName) {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length > maxLength) {
    throw new HttpError(400, `${fieldName} is too long`, {
      maxLength,
    });
  }
  return text || undefined;
}

function validateLinkedInUrl(value) {
  if (!value) return undefined;
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new HttpError(400, "linkedinUrl must be a valid URL");
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new HttpError(400, "linkedinUrl must use http or https");
  }
  return url.toString();
}

function slugify(value) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return slug || "review";
}

function localDate(timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function yamlString(value) {
  // JSON strings are valid YAML double-quoted scalars and safely escape quotes/newlines.
  return JSON.stringify(value);
}

function buildReviewMarkdown({ name, linkedinUrl, imageUrl, position, publishDate, review }) {
  const frontmatter = [
    "---",
    `name: ${yamlString(name)}`,
    linkedinUrl ? `linkedinUrl: ${yamlString(linkedinUrl)}` : null,
    imageUrl ? `imageUrl: ${yamlString(imageUrl)}` : null,
    position ? `position: ${yamlString(position)}` : null,
    `publishDate: ${yamlString(publishDate)}`,
    "---",
  ].filter(Boolean).join("\n");

  return `${frontmatter}\n${review.replace(/\r\n/g, "\n").trim()}\n`;
}

function createGitHubClient(token) {
  return new Octokit({
    auth: token,
    userAgent: "portfolio-review-api/1.0",
  });
}

async function createReviewPullRequest({ config, review, image }) {
  const { owner, repo } = config.github.repository;
  const baseBranch = config.baseBranch;
  const slug = slugify(review.name);
  const timestamp = Date.now();
  const branch = `review-${slug}-${timestamp}`;
  const reviewPath = `src/content/review/${slug}.md`;

  try {
    await config.github.rest.repos.getContent({
      owner,
      repo,
      path: reviewPath,
      ref: baseBranch,
    });
    throw new HttpError(409, "A review with this name already exists");
  } catch (error) {
    if (error instanceof HttpError || error?.status !== 404) {
      throw error;
    }
  }

  const imageExtension = image ? IMAGE_EXTENSIONS[image.mimetype] : undefined;
  const imagePath = image ? `public/reviews/${slug}.${imageExtension}` : undefined;
  const imageUrl = imagePath ? `/${imagePath.replace(/^public\//, "")}` : undefined;
  const markdown = buildReviewMarkdown({
    ...review,
    imageUrl,
    publishDate: localDate(config.timeZone),
  });

  const baseRef = await config.github.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${baseBranch}`,
  });
  const baseSha = baseRef.data.object.sha;
  const baseCommit = await config.github.rest.repos.getCommit({
    owner,
    repo,
    ref: baseSha,
  });

  const entries = [
    {
      path: reviewPath,
      mode: "100644",
      type: "blob",
      content: markdown,
    },
  ];

  if (image) {
    entries.push({
      path: imagePath,
      mode: "100644",
      type: "blob",
      content: image.buffer.toString("base64"),
      encoding: "base64",
    });
  }

  const treeEntries = [];
  for (const entry of entries) {
    const blob = await config.github.rest.git.createBlob({
      owner,
      repo,
      content: entry.content,
      encoding: entry.encoding ?? "utf-8",
    });
    treeEntries.push({
      path: entry.path,
      mode: entry.mode,
      type: entry.type,
      sha: blob.data.sha,
    });
  }

  const tree = await config.github.rest.git.createTree({
    owner,
    repo,
    base_tree: baseCommit.data.commit.tree.sha,
    tree: treeEntries,
  });
  const commit = await config.github.rest.git.createCommit({
    owner,
    repo,
    message: `Add review by ${review.name}`,
    tree: tree.data.sha,
    parents: [baseSha],
  });

  let branchCreated = false;
  try {
    await config.github.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branch}`,
      sha: commit.data.sha,
    });
    branchCreated = true;

    const pullRequest = await config.github.rest.pulls.create({
      owner,
      repo,
      title: `New review by ${review.name}`,
      head: branch,
      base: baseBranch,
      body: [
        "## Automated review submission",
        "",
        `- Name: ${review.name}`,
        `- Position: ${review.position ?? "Not provided"}`,
        `- LinkedIn: ${review.linkedinUrl ?? "Not provided"}`,
        `- Image: ${imagePath ? "Included" : "Not provided"}`,
        "",
        "Please review and merge this pull request to publish the review.",
      ].join("\n"),
      maintainer_can_modify: false,
    });

    return {
      branch,
      pullRequest: {
        number: pullRequest.data.number,
        url: pullRequest.data.html_url,
      },
    };
  } catch (error) {
    if (branchCreated) {
      try {
        await config.github.rest.git.deleteRef({
          owner,
          repo,
          ref: `heads/${branch}`,
        });
      } catch {
        // Preserve the original GitHub error. The orphan branch can be removed manually.
      }
    }
    throw error;
  }
}

const config = (() => {
  const token = required("GITHUB_TOKEN");
  const repository = parseRepository(required("GITHUB_REPOSITORY", "Pablo-ArgF/Portfolio"));
  return {
    port: integerEnv("PORT", 3000),
    trustProxy: process.env.TRUST_PROXY ?? "1",
    timeZone: process.env.REVIEW_TIMEZONE ?? "Europe/Madrid",
    baseBranch: process.env.GITHUB_BASE_BRANCH ?? "master",
    maxImageBytes: integerEnv("MAX_IMAGE_BYTES", 5 * 1024 * 1024),
    allowedOrigins: parseOrigins(
      process.env.CORS_ALLOWED_ORIGINS ?? "https://pabloaf.com,http://localhost:4321",
    ),
    github: {
      rest: createGitHubClient(token),
      repository,
    },
  };
})();

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", config.trustProxy);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || config.allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new HttpError(403, "Origin is not allowed"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  maxAge: 86400,
}));

app.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

const limiter = rateLimit({
  windowMs: integerEnv("RATE_LIMIT_WINDOW_MS", 60 * 60 * 1000),
  limit: integerEnv("RATE_LIMIT_MAX", 10),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many review submissions. Try again later." },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxImageBytes,
    files: 1,
    fields: 10,
  },
  fileFilter(_req, file, callback) {
    if (!IMAGE_EXTENSIONS[file.mimetype]) {
      return callback(new HttpError(400, "Only JPEG, PNG, WebP or GIF images are supported"));
    }
    return callback(null, true);
  },
});

app.post("/create-review", limiter, upload.single("image"), async (req, res, next) => {
  try {
    const review = {
      name: normalizeText(req.body?.name, 120, "name"),
      review: normalizeText(req.body?.review, 10000, "review"),
      linkedinUrl: validateLinkedInUrl(optionalText(req.body?.linkedinUrl, 500, "linkedinUrl")),
      position: optionalText(req.body?.position, 160, "position"),
    };

    const result = await createReviewPullRequest({
      config,
      review,
      image: req.file,
    });

    res.status(201).json({
      ok: true,
      message: "Review submitted for approval",
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE"
      ? `Image is too large. Maximum size is ${config.maxImageBytes} bytes`
      : error.message;
    return res.status(400).json({ error: message });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({
      error: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  const status = error?.status === 401 || error?.status === 403
    ? 502
    : 500;
  console.error("Review request failed", {
    status: error?.status,
    message: error?.message,
    requestId: crypto.randomUUID(),
  });
  return res.status(status).json({
    error: status === 502
      ? "The review service cannot access GitHub right now"
      : "Unable to create the review pull request",
  });
});

app.listen(config.port, "0.0.0.0", () => {
  console.log(`Review API listening on 0.0.0.0:${config.port}`);
});
