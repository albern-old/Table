$(function () {
    let dataList = [];
    let html5QrCode;

    // Load data dari Local Storage saat aplikasi pertama kali dimuat
    function loadData() {
        const storedData = localStorage.getItem('barangData');
        if (storedData) {
            dataList = JSON.parse(storedData);
        }
    }

    // Simpan data ke Local Storage
    function saveData() {
        localStorage.setItem('barangData', JSON.stringify(dataList));
    }

    // Fungsi untuk merender daftar item
    function renderItemList() {
        const $dataListContainer = $("#dataListContainer").empty();
        if (dataList.length === 0) {
            $dataListContainer.append('<div class="col-xs-12 text-center text-muted">Belum ada data barang.</div>');
            $("#clearAllBtn").hide(); // Sembunyikan tombol hapus jika tidak ada data
            return;
        }

        $.each(dataList, function (index, data) {
            $dataListContainer.append(`
                <div class="col-md-6 col-sm-12">
                    <div class="item-card">
                        <div class="text-right">
                            <button class="btn btn-primary btn-sm btn-aksi btn-edit" data-id="${data.id}">Edit</button>
                            <button class="btn btn-danger btn-sm btn-aksi btn-delete" data-id="${data.id}">Hapus</button>
                        </div>
                        <h4>${data.nama}</h4>
                        <p>ID: <strong>${data.id}</strong></p>
                        <p>Barcode: <span class="barcode-text">${data.barcode}</span></p>
                        <p>Stok: <span class="stock-text">${data.stok}</span></p>
                        <p>Harga Dasar: <span class="price-base-text">Rp${data.harga_dasar.toLocaleString('id-ID')}</span></p>
                        <p>Harga Jual: <span class="price-sell-text">Rp${data.harga_jual.toLocaleString('id-ID')}</span></p>
                    </div>
                </div>
            `);
        });
        $("#clearAllBtn").show(); // Tampilkan tombol hapus jika ada data
    }

    // Fungsi untuk memulai scanner
    function startScanner() {
        html5QrCode = new Html5Qrcode("qr-reader");
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        $("#scanner-container").show();
        $("#stopScanBtn").show();

        html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText, decodedResult) => {
                $("#inputBarcode").val(decodedText);
                $("#scanner-container").hide();
                $("#stopScanBtn").hide();
                html5QrCode.stop().catch(err => console.error(err));
            },
            (error) => {
                console.warn(`Scan error: ${error}`);
            }
        ).catch((err) => {
            console.error("Gagal memulai scanner:", err);
            alert("Gagal memulai scanner. Pastikan kamera diizinkan dan situs berjalan di HTTPS.");
            $("#scanner-container").hide();
            $("#stopScanBtn").hide();
        });
    }

    $("#scanBarcodeBtn").on("click", function () {
        if (typeof Html5Qrcode !== "undefined") {
            startScanner();
        } else {
            alert("Pustaka scanner tidak tersedia. Pastikan koneksi internet.");
        }
    });

    $("#stopScanBtn").on("click", function () {
        if (html5QrCode) {
            html5QrCode.stop().then(() => {
                $("#scanner-container").hide();
                $("#stopScanBtn").hide();
            }).catch(err => console.error(err));
        }
    });
    
    $("#submitBtn").on("click", function () {
        const id = $("#itemId").val();
        const nama = $("#inputNama").val().trim();
        const barcode = $("#inputBarcode").val().trim();
        const stok = $("#inputStok").val().trim();
        const hargaDasar = $("#inputHargaDasar").val().trim();
        const hargaJual = $("#inputHargaJual").val().trim();

        if (nama && barcode && stok && hargaDasar && hargaJual) {
            const parsedStok = parseInt(stok);
            const parsedHargaDasar = parseInt(hargaDasar);
            const parsedHargaJual = parseInt(hargaJual);

            if (isNaN(parsedStok) || isNaN(parsedHargaDasar) || isNaN(parsedHargaJual) || parsedStok < 0 || parsedHargaDasar < 0 || parsedHargaJual < 0) {
                alert("Jumlah stok, harga dasar, dan harga jual harus berupa angka non-negatif.");
                return;
            }

            if (id) {
                // Logika untuk EDIT data
                const index = dataList.findIndex(item => Number(item.id) === Number(id));
                if (index !== -1) {
                    dataList[index].nama = nama;
                    dataList[index].barcode = barcode;
                    dataList[index].stok = parsedStok;
                    dataList[index].harga_dasar = parsedHargaDasar;
                    dataList[index].harga_jual = parsedHargaJual;
                }
            } else {
                // Logika untuk TAMBAH data baru
                const isBarcodeExist = dataList.some(item => item.barcode === barcode);
                if (isBarcodeExist) {
                    alert("Barcode ini sudah ada dalam daftar.");
                    return;
                }
                const newItem = {
                    id: dataList.length > 0 ? Math.max(...dataList.map(item => item.id)) + 1 : 1,
                    nama: nama,
                    barcode: barcode,
                    stok: parsedStok,
                    harga_dasar: parsedHargaDasar,
                    harga_jual: parsedHargaJual
                };
                dataList.push(newItem);
            }
            
            saveData();
            renderItemList();
            $("#itemForm")[0].reset();
            $("#itemId").val("");
            $('a[href="#tabData"]').tab('show');
        } else {
            alert("Semua kolom harus diisi.");
        }
    });

    // Perbaikan pada logika hapus
    $(document).on("click", ".btn-delete", function () {
        const id = Number($(this).data("id"));
        if (confirm("Apakah Anda yakin ingin menghapus barang ini?")) {
            dataList = dataList.filter(item => Number(item.id) !== id);
            saveData();
            renderItemList();
        }
    });

    // Perbaikan pada logika edit
    $(document).on("click", ".btn-edit", function () {
        const id = Number($(this).data("id"));
        const itemToEdit = dataList.find(item => Number(item.id) === id);
        if (itemToEdit) {
            $("#itemId").val(itemToEdit.id);
            $("#inputNama").val(itemToEdit.nama);
            $("#inputBarcode").val(itemToEdit.barcode);
            $("#inputStok").val(itemToEdit.stok);
            $("#inputHargaDasar").val(itemToEdit.harga_dasar);
            $("#inputHargaJual").val(itemToEdit.harga_jual);
            $('a[href="#tabInput"]').tab('show');
        }
    });

    $("#clearAllBtn").on("click", function() {
        if (confirm("Apakah Anda yakin ingin menghapus SEMUA data barang?")) {
            dataList = [];
            saveData();
            renderItemList();
        }
    });

    $("#resetBtn").on("click", function () {
        $("#itemForm")[0].reset();
        $("#itemId").val("");
        if (html5QrCode) {
            html5QrCode.stop().catch(() => {});
        }
        $("#scanner-container").hide();
        $("#stopScanBtn").hide();
    });

    loadData();
    renderItemList();
});
