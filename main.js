// --- إعدادات الربط مع الـ API الذي أنشأته ---
const API_URL = "/api/academy";

// نظام التشفير (يجب أن يكون مطابقاً لما تستخدمه في لوحة التحكم)
const SecretShield = {
    key: 124,
    encrypt: (data) => {
        const str = JSON.stringify(data);
        return btoa(str.split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ SecretShield.key)).join(''));
    },
    decrypt: (cipher) => {
        try {
            const str = atob(cipher).split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ SecretShield.key)).join('');
            return JSON.parse(str);
        } catch(e) { return null; }
    }
};

// كائن قاعدة البيانات المحلي
let db = {
    years: [], subjects: [], teachers: [], chapters: [], 
    lectures: [], users: [], settings: {}
};

// دالة جلب البيانات من Vercel KV عبر الـ API
async function loadDB() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (data.result) {
            db = SecretShield.decrypt(data.result) || db;
            console.log("تم تحديث البيانات من السيرفر ✅");
            // هنا يمكنك استدعاء دوال التحديث للواجهة (مثل renderStudents)
            if (typeof refreshUI === "function") refreshUI(); 
        }
    } catch (e) {
        console.error("خطأ في التحميل:", e);
    }
}

// دالة حفظ البيانات إلى Vercel KV عبر الـ API
async function syncDB() {
    try {
        const encryptedData = SecretShield.encrypt(db);
        const res = await fetch(API_URL, {
            method: 'POST',
            body: encryptedData
        });
        if (res.ok) {
            console.log("تم الحفظ والمزامنة بنجاح 🚀");
        }
    } catch (e) {
        alert("فشل في حفظ البيانات!");
    }
}