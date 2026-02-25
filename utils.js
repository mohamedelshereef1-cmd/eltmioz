// api/_utils.js
import crypto from "crypto";

export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  header.split(";").forEach((part) => {
    const [k, ...v] = part.trim().split("=");
    if (!k) return;
    out[k] = decodeURIComponent(v.join("=") || "");
  });
  return out;
}

export function setCookie(res, name, value, opts = {}) {
  const {
    httpOnly = true,
    secure = true,
    sameSite = "Lax",
    path = "/",
    maxAgeSec, // seconds
  } = opts;

  let c = `${name}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}`;
  if (httpOnly) c += "; HttpOnly";
  if (secure) c += "; Secure";
  if (typeof maxAgeSec === "number") c += `; Max-Age=${maxAgeSec}`;

  // support multiple Set-Cookie
  const prev = res.getHeader("Set-Cookie");
  if (!prev) res.setHeader("Set-Cookie", c);
  else if (Array.isArray(prev)) res.setHeader("Set-Cookie", [...prev, c]);
  else res.setHeader("Set-Cookie", [prev, c]);
}

export function clearCookie(res, name) {
  setCookie(res, name, "", { maxAgeSec: 0 });
}

// -------- JWT (HS256) --------
const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function b64url(buf) {
  return Buffer.from(buf).toString("base64url");
}

export function signJWT(payload, expSec = 3600) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expSec };

  const h = b64url(JSON.stringify(header));
  const b = b64url(JSON.stringify(body));
  const sig = crypto.createHmac("sha256", SECRET).update(`${h}.${b}`).digest("base64url");
  return `${h}.${b}.${sig}`;
}

export function verifyJWT(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const [h, b, sig] = token.split(".");
    if (!h || !b || !sig) return null;

    const check = crypto.createHmac("sha256", SECRET).update(`${h}.${b}`).digest("base64url");
    if (check !== sig) return null;

    const payload = JSON.parse(Buffer.from(b, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

// -------- misc helpers --------
export async function readBody(req) {
  if (req.method === "GET" || req.method === "HEAD") return {};
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch {
        resolve({});
      }
    });
  });
}

export function getIP(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length) return xf.split(",")[0].trim();
  return req.socket?.remoteAddress || "0.0.0.0";
}