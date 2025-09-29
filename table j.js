$(function () {
  let count = 1
  let dataList = []
  let html5QrCode // Variabel untuk instance scanner

  function renderTable() {
    const $tbody = $("#tableBody").empty()
    $.each(dataList, function (index, data) {
      let prioritasClass = data.prioritas === "Tinggi" ? "label-prioritas-tinggi" :
                           data.prioritas === "Sedang" ? "label-prioritas-sedang" :
                           "label-prioritas-rendah"
      let statusClass = data.status === "Belum" ? "label-status-belum" : "label-status-sudah"

      $tbody.append(`
        <tr>
          <td class="text-center">${index + 1}</td>
          <td>${escapeHtml(data.kegiatan)}</td>
          <td>${escapeHtml(data.deskripsi)}</td>
          <td class="text-center"><span class="label ${prioritasClass}">${data.prioritas}</span></td>
          <td class="text-center"><span class="label ${statusClass}">${data.status}</span></td>
          <td class="text-center">
            <button class="btn btn-primary btn-xs btn-edit" data-id="${data.id}">Edit</button>
            <button class="btn btn-danger btn-xs btn-delete" data-id="${data.id}">Hapus</button>
            <button class="btn btn-warning btn-xs btn-done" data-id="${data.id}">Selesai</button>
          </td>
        </tr>
      `)
    })
  }

  function showNotification(message, type) {
    $("#notification").stop(true, true).text(message).removeClass().addClass(`notification show ${type}`).fadeIn(200).delay(2000).fadeOut(500)
  }

  function showScanResult(message, type) {
    const $result = $("#scan-result")
    $result.removeClass().addClass(`scan-${type}`).text(message).show().delay(3000).fadeOut(500)
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"'`=\/]/g, s =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'}[s])
    )
  }

  function trackBarcode(barcode) {
    const foundItem = dataList.find(item => item.barcode === barcode)
    if (foundItem) {
      showNotification(`Barcode ditemukan: Kegiatan "${foundItem.kegiatan}" (ID: ${foundItem.id})`, "success")
      showScanResult(`Ditemukan: ${foundItem.kegiatan}`, "success")
      // Opsional: Pindah ke tab data
      $('a[href="#tabData"]').tab('show')
      // Scroll ke item (opsional, tambahkan ID unik ke tr jika perlu)
    } else {
      showNotification("Barcode tidak ditemukan di daftar kegiatan.", "error")
      showScanResult("Barcode tidak ditemukan.", "error")
    }
    $("#inputBarcode").val(barcode) // Isi input dengan hasil scan
  }

  // Fungsi untuk memulai scanner
  function startScanner() {
    const html5QrCode = new Html5Qrcode("qr-reader")
    const config = { fps: 10, qrbox: { width: 250, height: 250 } } // Konfigurasi scanner

    html5QrCode.start(
      { facingMode: "environment" }, // Gunakan kamera belakang jika tersedia
      config,
      (decodedText, decodedResult) => {
        // Saat barcode terdeteksi
        console.log(`Scan berhasil: ${decodedText}`)
        html5QrCode.stop().then(() => {
          $("#scanner-container").hide()
          $("#stopScanBtn").hide()
          trackBarcode(decodedText)
        }).catch(err => {
          console.error("Error stopping scanner:", err)
        })
      },
      (error) => {
        // Error saat scan (misalnya, tidak ada barcode)
        console.warn(`Scan error: ${error}`)
      }
    ).then(() => {
      // Scanner dimulai berhasil
      $("#scanner-container").show()
      $("#stopScanBtn").show()
      showNotification("Scanner dimulai. Arahkan kamera ke barcode.", "info")
    }).catch((err) => {
      console.error("Error starting scanner:", err)
      showNotification("Gagal memulai scanner. Pastikan kamera diizinkan.", "error")
    })

    // Event stop scan
    $("#stopScanBtn").on("click", () => {
      html5QrCode.stop().then(() => {
        $("#scanner-container").hide()
        $("#stopScanBtn").hide()
        showNotification("Scanner dihentikan.", "info")
      }).catch(err => {
        console.error("Error stopping scanner:", err)
      })
    })

    return html5QrCode
  }

  $("#addBtn").on("click", function () {
    const kegiatan = $("#inputKegiatan").val().trim()
    const deskripsi = $("#inputDeskripsi").val().trim()
    const prioritas = $("#inputPrioritas").val()
    const status = $("#inputStatus").val()
    if (kegiatan && deskripsi) {
      const barcode = `BARCODE-${count}` // Barcode otomatis
      dataList.push({ id: count++, kegiatan, deskripsi, prioritas, status, barcode })
      renderTable()
      showNotification("Kegiatan berhasil ditambahkan dengan barcode: " + barcode, "success")
      $("#inputKegiatan, #inputDeskripsi, #inputBarcode").val("")
      $("#scanner-container").hide()
      $("#stopScanBtn").hide()
      $('a[href="#tabData"]').tab('show')
    } else {
      showNotification("Isi dulu kegiatan dan deskripsi.", "error")
    }
  })

  $("#clearAll").on("click", function () {
    if (dataList.length === 0) {
      showNotification("Tidak ada data untuk dihapus.", "warning")
      return
    }
    if (confirm("Yakin hapus semua data?")) {
      dataList = []
      count = 1
      renderTable()
      showNotification("Semua data berhasil dihapus.", "success")
    }
  })

  $("#clearAllInput").on("click", function () {
    $("#inputForm")[0].reset()
    $("#inputBarcode").val("")
    $("#scanner-container").hide()
    $("#stopScanBtn").hide()
    $("#scan-result").hide()
    if (html5QrCode) {
      html5QrCode.stop().catch(() => {}) // Stop scanner jika aktif
    }
    showNotification("Form direset.", "info")
  })

  $(document).on("click", ".btn-delete", function () {
    const id = Number($(this).data("id"))
    dataList = dataList.filter(d => d.id !== id)
    renderTable()
    showNotification("Data dihapus.", "success")
  })

  $(document).on("click", ".btn-edit", function () {
    const id = Number($(this).data("id"))
    const data = dataList.find(d => d.id === id)
    if (data) {
      $("#inputKegiatan").val(data.kegiatan)
      $("#inputDeskripsi").val(data.deskripsi)
      $("#inputPrioritas").val(data.prioritas)
      $("#inputStatus").val(data.status)
      // Tampilkan barcode untuk edit
      $("#inputBarcode").val(data.barcode)
      dataList = dataList.filter(d => d.id !== id)
      renderTable()
      $('a[href="#tabInput"]').tab('show')
      showNotification("Edit data, lalu tambah ulang untuk simpan.", "info")
    }
  })

  $(document).on("click", ".btn-done", function () {
    const id = Number($(this).data("id"))
    const data = dataList.find(d => d.id === id)
    if (data) {
      data.status = data.status === "Sudah" ? "Belum" : "Sudah"
      renderTable()
      showNotification("Status diubah menjadi " + data.status, "info")
    }
  })

  // Event untuk tombol Scan Kamera
  $("#scanBarcodeBtn").on("click", function () {
    const manualBarcode = $("#inputBarcode").val().trim()
    if (manualBarcode) {
      // Jika ada input manual, proses dulu
      trackBarcode(manualBarcode)
      return
    }

    // Jika kosong, mulai scan kamera
    if (typeof Html5Qrcode !== "undefined") {
      html5QrCode = startScanner()
    } else {
      showNotification("Pustaka scanner tidak tersedia. Periksa koneksi internet.", "error")
    }
  })

  // Fallback: Enter di input barcode untuk track manual
  $("#inputBarcode").on("keypress", function (e) {
    if (e.which === 13) { // Enter key
      const barcode = $(this).val().trim()
      if (barcode) {
        trackBarcode(barcode)
      }
    }
  })
})
