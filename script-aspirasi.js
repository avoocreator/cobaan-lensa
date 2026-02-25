const CSV_QUESTIONS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRvgRv-CzXTvRs0Sk_6DnEDTFScXr70edABvDLuXSl_fAKkk5NSy3FOjTLaddqObgrYQTnjJx4yB6X6/pub?gid=0&single=true&output=csv"; 
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw4hojREu3IaW481qcj_uEvdjdlZLp3tjpJqIxLB1t8fURWUBJdQsYO1j4TkpIZg0TNiQ/exec";

document.addEventListener('DOMContentLoaded', async () => {
    const wrapper = document.getElementById('questionsWrapper');
    const kategoriTerpilih = localStorage.getItem('selectedKategori') || 'Aspirasi';
    document.getElementById('displayKategori').innerText = `Kategori: ${kategoriTerpilih}`;

    // JIKA URL MASIH KOSONG
    if (!CSV_QUESTIONS_URL || CSV_QUESTIONS_URL === "") {
        wrapper.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-database" style="font-size: 3rem; color: #ddd; margin-bottom: 15px;"></i>
                <p style="color: #888;">Belum ada pernyataan yang terhubung.</p>
                <small style="color: #ccc;">Admin belum memperbaharui sistem</small>
            </div>`;
        document.getElementById('submitBtn').style.display = 'none'; // Sembunyikan tombol kirim
        return;
    }

    try {
        const response = await fetch(CSV_QUESTIONS_URL);
        const data = await response.text();
        
        const rows = data.split(/\r?\n/).filter(row => row.trim() !== "").map(row => row.split(','));
        const headers = rows[0].map(h => h.trim().toLowerCase());
        
        // Ambil data dan pastikan kolom 'pernyataan' ada
        const questions = rows.slice(1).map(row => {
            let obj = {};
            row.forEach((cell, i) => { 
                if(headers[i]) obj[headers[i]] = cell ? cell.trim() : ""; 
            });
            return obj;
        }).filter(q => q.pernyataan); // Hanya ambil yang punya isi pernyataan

        if (questions.length === 0) {
            wrapper.innerHTML = `<div class="empty-state"><p>Tidak ada pertanyaan ditemukan di Spreadsheet.</p></div>`;
            document.getElementById('submitBtn').style.display = 'none';
        } else {
            renderQuestions(questions);
            document.getElementById('submitBtn').style.display = 'block';
        }
    } catch (e) {
        wrapper.innerHTML = `<div class="empty-state"><p>Gagal mengambil data dari Google Sheets.</p></div>`;
        document.getElementById('submitBtn').style.display = 'none';
    }
});

function renderQuestions(questions) {
    const wrapper = document.getElementById('questionsWrapper');
    wrapper.innerHTML = "";

    questions.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.innerHTML = `
            <span class="question-text">${q.pernyataan}</span>
            <div class="star-rating">
                <input type="radio" id="star5-${index}" name="rating-${index}" value="5" required><label for="star5-${index}"><i class="fas fa-star"></i></label>
                <input type="radio" id="star4-${index}" name="rating-${index}" value="4"><label for="star4-${index}"><i class="fas fa-star"></i></label>
                <input type="radio" id="star3-${index}" name="rating-${index}" value="3"><label for="star3-${index}"><i class="fas fa-star"></i></label>
                <input type="radio" id="star2-${index}" name="rating-${index}" value="2"><label for="star2-${index}"><i class="fas fa-star"></i></label>
                <input type="radio" id="star1-${index}" name="rating-${index}" value="1"><label for="star1-${index}"><i class="fas fa-star"></i></label>
            </div>
            <textarea class="reason-box" name="reason-${index}" rows="3" placeholder="Berikan alasan (Opsional)"></textarea>
            <input type="hidden" name="question-${index}" value="${q.pernyataan}">
        `;
        wrapper.appendChild(card);
    });
}

document.getElementById('aspirasiForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.innerText = "Sedang Mengirim...";
    btn.disabled = true;

    const formData = new FormData(e.target);
    const results = [];
    
    // Looping untuk mengambil semua jawaban dari card yang ada
    let i = 0;
    while(formData.has(`question-${i}`)) {
        results.push({
            pertanyaan: formData.get(`question-${i}`),
            rating: formData.get(`rating-${i}`),
            alasan: formData.get(`reason-${i}`)
        });
        i++;
    }

    const payload = {
        nis: localStorage.getItem('userNIS'),
        nama: localStorage.getItem('userName'),
        kategori: localStorage.getItem('selectedKategori'),
        timestamp: new Date().toLocaleString('id-ID'),
        data: results
    };

    try {
        // Kirim data ke Google Apps Script
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });
        
        alert("Terima kasih! Aspirasi Anda telah kami terima.");
        window.location.href = 'beranda.html';
    } catch (err) {
        alert("Terjadi kesalahan saat mengirim. Silakan coba lagi.");
        btn.disabled = false;
        btn.innerText = "Kirim Semua Aspirasi";
    }
});