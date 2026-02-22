// إدارة الجلسة والدخول
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const code = document.getElementById('studentCode').value;
    
    // محاكاة الاتصال بالسيرفر
    if(code) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('studentCode', code);
        window.location.href = 'index.html';
    }
});

// منع تصوير الشاشة (PrintScreen)
document.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText(''); 
        alert('تصوير الشاشة محظور لحماية حقوق الملكية');
    }
});