// api/_store.js
function init() {
  return {
    years: [{ id: "2025", name: "ثالثة ثانوي" }],
    subjects: [{ id: "sub1", name: "فيزياء", yearId: "2025" }],
    teachers: [{ id: "t1", name: "مستر أحمد", subId: "sub1", pic: "" }],
    chapters: [{ id: "c1", name: "الوحدة الأولى", teachId: "t1" }],
    lectures: [
      {
        id: "lec1",
        title: "قانون نيوتن",
        chapId: "c1",
        // YouTube mode
        source: { type: "youtube", videoId: "VIDEO_ID" },
        // settings
        lock: { enabled: false },
        freePreview: { enabled: false, seconds: 120 },
        autoNext: true,
        watchTracking: true,
      },
      {
        id: "lec2",
        title: "محاضرة HLS",
        chapId: "c1",
        // HLS mode (هتحط الرابط بتاع الكونتابو هنا لاحقًا)
        source: { type: "hls", url: "https://example.com/hls/master.m3u8" },
        lock: { enabled: false },
        freePreview: { enabled: false, seconds: 120 },
        autoNext: true,
        watchTracking: true,
      },
    ],

    // أكواد الطلاب (تجربة)
    students: [
      {
        id: "stu_1",
        code: "ACC-111111",
        name: "Student",
        yearId: "2025",
        status: "active", // active | banned
        expiryAt: Date.now() + 7 * 86400000,
        trial: { enabled: false, endsAt: 0 },
      },
    ],

    watchLogs: [],

    // Rate-limit بسيط
    rl: new Map(),
  };
}

export function store() {
  if (!globalThis.__ACADEMY_STORE__) globalThis.__ACADEMY_STORE__ = init();
  return globalThis.__ACADEMY_STORE__;
}

export function findStudentByCode(code) {
  const s = store().students.find((x) => String(x.code).toLowerCase() === String(code).toLowerCase());
  return s || null;
}

export function findLectureById(id) {
  const lec = store().lectures.find((x) => String(x.id) === String(id));
  return lec || null;
}