// api/academy/public.js
import { json, parseCookies, verifyJWT } from "../_utils.js";
import { store } from "../_store.js";

export default async function handler(req, res) {
  const cookies = parseCookies(req);
  const token = cookies.student_token;
  const payload = verifyJWT(token);

  if (!payload || payload.type !== "student") {
    return json(res, 401, { error: "Unauthorized" });
  }

  const S = store();
  const yearId = String(payload.yearId || "");

  const years = (S.years || []).filter((y) => String(y.id) === yearId);
  const subjects = (S.subjects || []).filter((s) => String(s.yearId) === yearId);

  const subIds = new Set(subjects.map((s) => String(s.id)));
  const teachers = (S.teachers || []).filter((t) => subIds.has(String(t.subId)));

  const teachIds = new Set(teachers.map((t) => String(t.id)));
  const chapters = (S.chapters || []).filter((c) => teachIds.has(String(c.teachId)));

  const chapIds = new Set(chapters.map((c) => String(c.id)));
  const lectures = (S.lectures || []).filter((l) => chapIds.has(String(l.chapId)));

  return json(res, 200, {
    result: { years, subjects, teachers, chapters, lectures },
  });
}