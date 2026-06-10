import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

loadEnv(path.join(__dirname, ".env"));

const port = Number(process.env.PORT || 8787);
const bucket = process.env.YANDEX_BUCKET || "secret1231";
const endpoint = process.env.YANDEX_ENDPOINT || "https://storage.yandexcloud.net";
const region = process.env.YANDEX_REGION || "ru-central1";
const expiresIn = Number(process.env.SIGNED_URL_SECONDS || 300);
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
const accessKeyId = requiredEnv("YANDEX_ACCESS_KEY_ID");
const secretAccessKey = requiredEnv("YANDEX_SECRET_ACCESS_KEY");

const endpointUrl = new URL(endpoint);
const host = endpointUrl.host;

const server = createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      sendEmpty(res, 204);
      return;
    }

    const url = new URL(req.url || "/", "http://localhost");

    if (req.method === "GET" && url.pathname === "/api/photos") {
      const photos = await loadPhotoKeys();
      const signedPhotos = photos.map((photo) => ({
        ...photo,
        url: signPhotoUrl(photo.key),
        expiresIn,
      }));
      sendJson(res, 200, signedPhotos);
      return;
    }

    sendJson(res, 404, { error: "Not found." });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, {
      error: "API error.",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

server.listen(port, () => {
  console.log(`Cloud gallery API running on http://localhost:${port}`);
});

async function loadPhotoKeys() {
  const singlePhotoKey = process.env.TEST_SINGLE_KEY;
  if (singlePhotoKey) {
    return [
      {
        title: singlePhotoKey.replace(/\.[^.]+$/, ""),
        key: singlePhotoKey,
        index: 1,
      },
    ];
  }

  const content = await readFile(path.join(rootDir, "photos.json"), "utf8");
  return JSON.parse(content.replace(/^\uFEFF/, ""));
}

function signPhotoUrl(key) {
  const now = new Date();
  const dateStamp = formatDate(now);
  const amzDate = formatDateTime(now);
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const canonicalUri = `/${encodeUriSegment(bucket)}/${encodeObjectKey(key)}`;

  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${accessKeyId}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "host",
  });

  const canonicalQuery = normalizeQuery(query);
  const canonicalHeaders = `host:${host}\n`;
  const signedHeaders = "host";
  const payloadHash = "UNSIGNED-PAYLOAD";

  const canonicalRequest = [
    "GET",
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hashHex(canonicalRequest),
  ].join("\n");

  const signingKey = getSignatureKey(secretAccessKey, dateStamp, region, "s3");
  const signature = hmacHex(signingKey, stringToSign);

  query.set("X-Amz-Signature", signature);
  return `${endpointUrl.origin}${canonicalUri}?${normalizeQuery(query)}`;
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function formatDateTime(date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function normalizeQuery(searchParams) {
  return [...searchParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeRfc3986(key)}=${encodeRfc3986(value)}`)
    .join("&");
}

function encodeObjectKey(key) {
  return key
    .split("/")
    .map((segment) => encodeUriSegment(segment))
    .join("/");
}

function encodeUriSegment(value) {
  return encodeRfc3986(value).replace(/%2F/g, "/");
}

function encodeRfc3986(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function hashHex(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function hmac(key, value) {
  return crypto.createHmac("sha256", key).update(value, "utf8").digest();
}

function hmacHex(key, value) {
  return crypto.createHmac("sha256", key).update(value, "utf8").digest("hex");
}

function getSignatureKey(secret, dateStamp, regionName, serviceName) {
  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, regionName);
  const kService = hmac(kRegion, serviceName);
  return hmac(kService, "aws4_request");
}

function loadEnv(envPath) {
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...corsHeaders(),
  });
  res.end(JSON.stringify(payload));
}

function sendEmpty(res, statusCode) {
  res.writeHead(statusCode, corsHeaders());
  res.end();
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
