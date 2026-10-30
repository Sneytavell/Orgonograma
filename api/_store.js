// Armazenamento no Upstash Redis (Vercel Marketplace) via REST, sem dependências.
const crypto = require("crypto");

const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "organograma:main";

function configured() { return !!(URL && TOKEN); }

async function load() {
  const r = await fetch(`${URL}/get/${encodeURIComponent(KEY)}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!r.ok) throw new Error("store_get_" + r.status);
  const j = await r.json();
  return j.result ? JSON.parse(j.result) : null;
}

async function save(doc) {
  const r = await fetch(`${URL}/set/${encodeURIComponent(KEY)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(doc),
  });
  if (!r.ok) throw new Error("store_set_" + r.status);
}

function checkPassword(given) {
  const real = process.env.ADMIN_PASSWORD || "";
  if (!real || typeof given !== "string") return false;
  const a = crypto.createHash("sha256").update(given).digest();
  const b = crypto.createHash("sha256").update(real).digest();
  return crypto.timingSafeEqual(a, b);
}

module.exports = { configured, load, save, checkPassword };
