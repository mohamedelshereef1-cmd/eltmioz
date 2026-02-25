// api/stream/[lectureId].js
import { json, parseCookies, verifyJWT } from "../_utils.js";
import { findLectureById } from "../_store.js";

export default async function handler(req, res) {
  const cookies = parseCookies(req);
  const token = cookies.student_token;
  const payload = verifyJWT(token);

  if (!payload || payload.type !== "student") {
    return json(res, 401, { error: "Unauthorized" });
  }

  const { lectureId } = req.query || {};
  if (!lectureId) return json(res, 400, { error: "Missing lectureId" });

  const lecture = findLectureById(lectureId);
  if (!lecture) return json(res, 404, { error: "Lecture not found" });

  const src = lecture.source || {};
  const t = String(src.type || "").toLowerCase();

  if (t === "youtube") {
    const vid = String(src.videoId || "");
    if (!vid) return json(res, 500, { error: "Missing YouTube videoId" });

    // embed URL (زي طلبك)
    const url = `https://www.youtube.com/embed/${encodeURIComponent(vid)}`;

    return json(res, 200, {
      type: "youtube",
      url,

      // extra compatibility (لو Player بتاعك بيستخدم videoId)
      provider: "youtube",
      videoId: vid,

      title: lecture.title || "",
    });
  }

  if (t === "hls") {
    const url = String(src.url || "");
    if (!url) return json(res, 500, { error: "Missing HLS url" });

    return json(res, 200, {
      type: "hls",
      url,

      // extra compatibility
      provider: "hls",
      playbackUrl: url,

      title: lecture.title || "",
    });
  }

  return json(res, 400, { error: "Unsupported source type" });
}