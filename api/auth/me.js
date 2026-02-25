// api/auth/me.js
import { json, parseCookies, setCookie, signJWT, verifyJWT } from "../_utils.js";
import { store } from "../_store.js";

export default async function handler(req, res) {
  const cookies = parseCookies(req);
  const token = cookies.student_token;

  const payload = verifyJWT(token);
  if (!payload || payload.type !== "student") {
    return json(res, 200, { authenticated: false });
  }

  // Rolling refresh: كل call هنا يمد ساعة كمان
  const renewed = signJWT(
    {
      type: "student",
      studentId: payload.studentId,
      yearId: payload.yearId,
      name: payload.name || "Student",
    },
    60 * 60
  );
  setCookie(res, "student_token", renewed, { maxAgeSec: 60 * 60 });

  // (اختياري) تأكيد الحالة من DB (تجريبية هنا)
  const S = store();
  const dbStudent = S.students.find((x) => String(x.id) === String(payload.studentId));
  if (dbStudent && String(dbStudent.status || "") === "banned") {
    return json(res, 200, { authenticated: false });
  }

  return json(res, 200, {
    authenticated: true,
    role: "student",
    student: {
      id: payload.studentId,
      name: payload.name || "Student",
      yearId: payload.yearId,
    },
  });
}