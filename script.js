// Nilai ini adalah kata kunci placeholder yang akan diganti otomatis oleh GitHub Actions
const API_URL = "ISI_API_URL_RAHASIA_DISINI";

const form = document.getElementById('transaction-form');
const loader = document.getElementById('loader');

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

// Fungsi Render Data ke Tabel
function renderData(data) {
    const list = document.getElementById('transaction-list');
    list.innerHTML = '';
    let tIncome = 0, tExpense = 0;

    data.forEach(trx => {
        if (trx.kategori === 'pemasukan') tIncome += parseInt(trx.nominal);
        else tExpense += parseInt(trx.nominal);

        list.innerHTML += `<tr>
            <td>${trx.tanggal}</td>
            <td>${trx.tipe}</td>
            <td>${trx.kategori}</td>
            <td style="color:${trx.kategori === 'pemasukan' ? 'green' : 'red'}">${formatRupiah(trx.nominal)}</td>
        </tr>`;
    });

    document.getElementById('total-balance').innerText = formatRupiah(tIncome - tExpense);
    document.getElementById('total-income').innerText = formatRupiah(tIncome);
    document.getElementById('total-expense').innerText = formatRupiah(tExpense);
}

// Fitur Ambil Data (GET)
document.getElementById('btn-sync').addEventListener('click', async () => {
    const pin = document.getElementById('pin').value;
    if (!pin) return alert('Silakan masukkan PIN terlebih dahulu!');

    loader.style.display = 'block';
    try {
        const res = await fetch(`${API_URL}?pin=${encodeURIComponent(pin)}`);
        const responseData = await res.json();

        if (responseData.status === 'success') {
            renderData(responseData.data);
            alert('Data berhasil disinkronisasi!');
        } else {
            alert(responseData.message);
        }
    } catch (err) { alert('Terjadi kesalahan jaringan atau API URL belum terkonfigurasi.'); }
    loader.style.display = 'none';
});

// Fitur Kirim Data (POST)
form.addEventListener('submit', async function (e) {
    e.preventDefault();
    loader.style.display = 'block';

    const payload = {
        action: 'insert',
        pin: document.getElementById('pin').value,
        tanggal: new Date().toLocaleDateString('id-ID'),
        tipe: document.getElementById('tipe').value,
        kategori: document.getElementById('kategori').value,
        nominal: document.getElementById('nominal').value
    };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });
        const responseData = await res.json();

        alert(responseData.message);
        if (responseData.status === 'success') {
            document.getElementById('tipe').value = '';
            document.getElementById('nominal').value = '';
            document.getElementById('btn-sync').click(); // Auto refresh data
        }
    } catch (err) { alert('Gagal mengirim data.'); }

    loader.style.display = 'none';
});