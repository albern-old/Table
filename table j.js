const inputKegiatan = document.getElementById('inputKegiatan');
const inputDeskripsi = document.getElementById('inputDeskripsi');
const addBtn = document.getElementById('addBtn');
const tableBody = document.getElementById('tableBody');
const clearAllBtn = document.getElementById('clearAll');

let count = 1;
let dataList = [];

window.addEventListener('DOMContentLoaded', () => {
  const savedData = localStorage.getItem('tableData');
  if (savedData) {
    dataList = JSON.parse(savedData);
    dataList.forEach(item => addRow(item.kegiatan, item.deskripsi, false));
  }
});

addBtn.addEventListener('click', () => {
  if (inputKegiatan.value.trim() !== "" && inputDeskripsi.value.trim() !== "") {
    addRow(inputKegiatan.value, inputDeskripsi.value);
    inputKegiatan.value = "";
    inputDeskripsi.value = "";
  }
});

function addRow(kegiatan, deskripsi, save = true) {
  const newRow = document.createElement('tr');

  const noCell = document.createElement('td');
  noCell.textContent = count++;

  const kegiatanCell = document.createElement('td');
  kegiatanCell.textContent = kegiatan;

  const deskripsiCell = document.createElement('td');
  deskripsiCell.textContent = deskripsi;

  const actionCell = document.createElement('td');

  const editBtn = document.createElement('button');
  editBtn.textContent = "Edit";
  editBtn.className = "edit-btn";
  editBtn.addEventListener('click', function () {
    const newKegiatan = prompt("Edit Nama Kegiatan:", kegiatanCell.textContent);
    const newDeskripsi = prompt("Edit Deskripsi:", deskripsiCell.textContent);
    if (newKegiatan && newDeskripsi) {
      kegiatanCell.textContent = newKegiatan;
      deskripsiCell.textContent = newDeskripsi;
      const index = [...tableBody.children].indexOf(newRow);
      dataList[index] = { kegiatan: newKegiatan, deskripsi: newDeskripsi };
      saveData();
    }
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = "Hapus";
  deleteBtn.className = "delete-btn";
  deleteBtn.addEventListener('click', function () {
    const index = [...tableBody.children].indexOf(newRow);
    dataList.splice(index, 1);
    tableBody.removeChild(newRow);
    updateRowNumbers();
    saveData();
  });

  actionCell.appendChild(editBtn);
  actionCell.appendChild(deleteBtn);

  newRow.appendChild(noCell);
  newRow.appendChild(kegiatanCell);
  newRow.appendChild(deskripsiCell);
  newRow.appendChild(actionCell);

  tableBody.appendChild(newRow);

  if (save) {
    dataList.push({ kegiatan, deskripsi });
    saveData();
  }
}

function updateRowNumbers() {
  const rows = tableBody.querySelectorAll('tr');
  count = 1;
  rows.forEach((row) => {
    row.firstElementChild.textContent = count++;
  });
}

function saveData() {
  localStorage.setItem('tableData', JSON.stringify(dataList));
}

clearAllBtn.addEventListener('click', function () {
  tableBody.innerHTML = "";
  count = 1;
  dataList = [];
  saveData();
});
