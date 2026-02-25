// api/watch/update.js
import { json, parseCookies, verifyJWT, readBody, getIP } from "../_utils.js";
import { store } from "../_store.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const cookies = parseCookies(req);
  const token = cookies.student_token;
  const payload = verifyJWT(token);

  if (!payload || payload.type !== "student") {
    return json(res, 401, { error: "Unauthorized" });
  }

  const body = await readBody(req);
  const { lectureId, time, currentTime, duration, event } = body || {};

  const S = store();
  S.watchLogs.push({
    at: Date.now(),
    studentId: payload.studentId,
    lectureId: String(lectureId || ""),
    time: Number(time ?? currentTime ?? 0),
    duration: Number(duration || 0),
    event: String(event || "tick"),
    ip: getIP(req),
    ua: req.headers["user-agent"] || "",
  });

  return json(res, 200, { success: true });
}