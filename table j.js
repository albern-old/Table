let quagga = null;
const video = document.getElementById('video');
const barcodeInput = document.getElementById('barcodeInput');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resultDiv = document.getElementById('result');

// Fungsi untuk cek dukungan kamera
async function checkCameraSupport() {
    try {
        const stream = await navigator.mediaDevices.getUser Media({ video: true });
        stream.getTracks().forEach(track => track.stop());  // Stop test stream
        return true;
    } catch (err) {
        console.error('Camera not supported:', err);
        resultDiv.innerHTML = '<span style="color: red;">Kamera tidak didukung atau izin ditolak. Cek pengaturan browser.</span>';
        return false;
    }
}

// Start scanning
startBtn.addEventListener('click', async () => {
    // Cek dukungan dulu
    if (!await checkCameraSupport()) {
        return;
    }

    // Coba akses kamera dengan constraints lebih fleksibel
    const constraints = {
        video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: { ideal: "environment" }  // Back camera di mobile, fallback ke user jika gagal
        }
    };

    try {
        const stream = await navigator.mediaDevices.getUser Media(constraints);
        video.srcObject = stream;
        video.play();  // Pastikan video dimulai
    } catch (err) {
        console.error('Gagal akses kamera:', err);
        resultDiv.innerHTML = `<span style="color: red;">Error akses kamera: ${err.message}. Pastikan HTTPS/localhost dan izinkan kamera.</span>`;
        return;
    }

    // Init Quagga setelah video siap
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: video,
            constraints: constraints  // Gunakan constraints yang sama
        },
        locator: {
            halfSample: true,
            patchSize: "medium"
        },
        numOfWorkers: (navigator.hardwareConcurrency || 4) - 1,  // Kurangi worker jika device lemah
        decoder: {
            readers: [
                "ean_reader",
                "ean_8_reader",
                "code_128_reader",
                "code_39_reader",
                "upc_reader"
            ],
            multiple: false
        },
        locate: true
    }, (err) => {
        if (err) {
            console.error('Quagga init error:', err);
            resultDiv.innerHTML = `<span style="color: red;">Error init scanner: ${err}. Cek console untuk detail.</span>`;
            // Stop stream jika gagal
            if (video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
                video.srcObject = null;
            }
            return;
        }
        Quagga.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
        resultDiv.innerHTML = '<span style="color: blue;">Scanner dimulai! Arahkan kamera ke barcode.</span>';
    });

    Quagga.onDetected((data) => {
        const code = data.codeResult.code;
        barcodeInput.value = code;
        resultDiv.innerHTML = `<span style="color: green;">Barcode terdeteksi: ${code}</span>`;
        console.log('Barcode:', code);
    });
});

// Stop scanning
stopBtn.addEventListener('click', () => {
    if (Quagga) {
        Quagga.stop();
    }
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    startBtn.disabled = false;
    stopBtn.disabled = true;
    resultDiv.innerHTML = '<span style="color: orange;">Scanner dihentikan.</span>';
});

// Cleanup
window.addEventListener('beforeunload', () => {
    if (Quagga) Quagga.stop();
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
});
