document.addEventListener('DOMContentLoaded', () => {
    // 1. Cek Login
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userName = localStorage.getItem('userName');

    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('welcomeText').innerText = `Selamat Datang, ${userName}`;

    // 2. Inisialisasi Slider
    new Swiper(".mySwiper", {
        loop: true,
        autoplay: { delay: 5000 },
        pagination: { el: ".swiper-pagination", clickable: true },
    });

    // 3. Fungsi Update Bar Rating (Play Store Style)
    function updateRatingBars(prefix, dataArray) {
        // dataArray: [bintang1, bintang2, bintang3, bintang4, bintang5]
        const total = dataArray.reduce((a, b) => a + b, 0);
        document.getElementById(`total-${prefix}`).innerText = `${total} total suara`;

        dataArray.forEach((count, index) => {
            const starLevel = index + 1;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            const bar = document.getElementById(`${prefix}-${starLevel}`);
            if (bar) {
                // Gunakan setTimeout agar ada efek animasi saat halaman dibuka
                setTimeout(() => {
                    bar.style.width = percentage + "%";
                }, 200);
            }
        });
    }

    // 4. Input Data (Contoh Data Dummy)
    // Format: [Bintang 1, Bintang 2, Bintang 3, Bintang 4, Bintang 5]
    const dataToilet = [2, 3, 10, 45, 80];
    const dataTaman = [1, 5, 20, 30, 40];

    updateRatingBars('toilet', dataToilet);
    updateRatingBars('taman', dataTaman);

    // 5. Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
});

function goToAspirasi(kategori) {
    localStorage.setItem('selectedKategori', kategori);
    window.location.href = 'aspirasi-form.html';
}