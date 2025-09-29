$(function () {
  let html5QrCode;

  function showScanResult(message, type) {
    const $result = $("#scan-result");
    $result.removeClass().addClass(`scan-${type}`).text(message).show();
  }

  // Fungsi untuk memulai scanner
  function startScanner() {
    html5QrCode = new Html5Qrcode("qr-reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    $("#scanner-container").show();
    $("#stopScanBtn").show();
    showScanResult("Scanner dimulai. Arahkan kamera ke barcode.", "scan-success");

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      (decodedText, decodedResult) => {
        // Saat barcode terdeteksi
        console.log(`Scan berhasil: ${decodedText}`);
        showScanResult(`Hasil Scan: ${decodedText}`, "scan-success");
        $("#inputBarcode").val(decodedText);
        
        // Hentikan scanner setelah berhasil scan
        html5QrCode.stop().then(() => {
          $("#scanner-container").hide();
          $("#stopScanBtn").hide();
        }).catch(err => {
          console.error("Error stopping scanner:", err);
        });
      },
      (error) => {
        // Error saat scan (misalnya, tidak ada barcode)
        console.warn(`Scan error: ${error}`);
      }
    ).catch((err) => {
      console.error("Gagal memulai scanner:", err);
      showScanResult("Gagal memulai scanner. Pastikan kamera diizinkan.", "scan-error");
      $("#scanner-container").hide();
      $("#stopScanBtn").hide();
    });
  }

  // Event untuk tombol "Mulai Scan Kamera"
  $("#scanBarcodeBtn").on("click", function () {
    const manualBarcode = $("#inputBarcode").val().trim();
    if (manualBarcode) {
      showScanResult(`Barcode yang dimasukkan: ${manualBarcode}`, "scan-success");
    } else {
      // Hanya mulai scan jika tidak ada input manual
      if (typeof Html5Qrcode !== "undefined") {
        startScanner();
      } else {
        showScanResult("Pustaka scanner tidak tersedia. Periksa koneksi internet.", "scan-error");
      }
    }
  });

  // Event untuk tombol "Hentikan Scan"
  $("#stopScanBtn").on("click", function () {
    if (html5QrCode) {
      html5QrCode.stop().then(() => {
        $("#scanner-container").hide();
        $("#stopScanBtn").hide();
        showScanResult("Scanner dihentikan.", "scan-error");
      }).catch(err => {
        console.error("Error stopping scanner:", err);
      });
    }
  });

  // Fallback: Enter di input barcode untuk proses manual
  $("#inputBarcode").on("keypress", function (e) {
    if (e.which === 13) {
      const barcode = $(this).val().trim();
      if (barcode) {
        showScanResult(`Barcode yang dimasukkan: ${barcode}`, "scan-success");
      }
    }
  });
});
