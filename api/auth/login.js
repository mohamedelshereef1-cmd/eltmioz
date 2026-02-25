// api/auth/login.js
import { json, readBody, setCookie, signJWT, getIP } from "../_utils.js";
import { findStudentByCode, store } from "../_store.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const ip = getIP(req);
  const S = store();

  // Rate limit بسيط (10 محاولات / 10 دقائق)
  const key = `login:${ip}`;
  const now = Date.now();
  const hit = S.rl.get(key) || { n: 0, t: now };
  if (now - hit.t > 10 * 60 * 1000) { hit.n = 0; hit.t = now; }
  hit.n += 1;
  S.rl.set(key, hit);
  if (hit.n > 10) return json(res, 429, { error: "Too many attempts. Try later." });

  const body = await readBody(req);
  const { code } = body || {};
  if (!code) return json(res, 400, { error: "Missing code" });

  const student = findStudentByCode(code);
  if (!student) return json(res, 403, { error: "Invalid code" });

  // منع طالب محظور
  if (String(student.status || "") === "banned") return json(res, 403, { error: "BANNED" });

  // JWT داخل Cookie لمدة ساعة
  const token = signJWT(
    {
      type: "student",
      studentId: student.id,
      yearId: student.yearId,
      name: student.name || "Student",
    },
    60 * 60
  );

  setCookie(res, "student_token", token, { maxAgeSec: 60 * 60 });

  return json(res, 200, { success: true });
}