let quagga = null;
const video = document.getElementById('video');
const barcodeInput = document.getElementById('barcodeInput');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resultDiv = document.getElementById('result');

// Start scanning
startBtn.addEventListener('click', () => {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: video,
            constraints: {
                width: 640,
                height: 480,
                facingMode: "environment"  // Use back camera on mobile
            }
        },
        locator: {
            halfSample: true,
            patchSize: "medium"  // Adjust for performance
        },
        numOfWorkers: navigator.hardwareConcurrency || 4,
        decoder: {
            readers: [
                "ean_reader",      // For EAN/UPC barcodes
                "ean_8_reader",
                "code_128_reader",
                "code_39_reader",
                "code_39_vin_reader",
                "codabar_reader",
                "upc_reader",
                "upc_e_reader",
                "i2of5_reader"
                // Add "qrcode_reader" for QR codes if needed
            ],
            multiple: false  // Scan one at a time
        },
        locate: true
    }, (err) => {
        if (err) {
            console.error('Quagga init error:', err);
            resultDiv.innerHTML = '<span style="color: red;">Error starting scanner: ' + err + '</span>';
            return;
        }
        Quagga.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
        resultDiv.innerHTML = '<span style="color: blue;">Scanner started! Point at a barcode.</span>';
    });

    // Event listener for successful decode
    Quagga.onDetected((data) => {
        const code = data.codeResult.code;
        barcodeInput.value = code;
        resultDiv.innerHTML = `<span style="color: green;">Scanned: ${code}</span>`;
        
        // Optional: Stop scanning after success (uncomment if desired)
        // Quagga.stop();
        // startBtn.disabled = false;
        // stopBtn.disabled = true;
        
        console.log('Barcode detected:', code);
    });
});

// Stop scanning
stopBtn.addEventListener('click', () => {
    if (Quagga) {
        Quagga.stop();
    }
    startBtn.disabled = false;
    stopBtn.disabled = true;
    video.srcObject = null;  // Stop camera stream
    resultDiv.innerHTML = '<span style="color: orange;">Scanner stopped.</span>';
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (Quagga) Quagga.stop();
});
