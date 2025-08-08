const input = document.getElementById('inputText');
const tableBody = document.getElementById('tableBody');
let count = 1;

input.addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && input.value.trim() !== "") {
    addRow(input.value);
    input.value = "";
  }
});

function addRow(text) {
  const newRow = document.createElement('tr');

  const noCell = document.createElement('td');
  noCell.textContent = count++;

  const textCell = document.createElement('td');
  textCell.textContent = text;

  const actionCell = document.createElement('td');
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = "Hapus";
  deleteBtn.className = "delete-btn";
  deleteBtn.addEventListener('click', function() {
    tableBody.removeChild(newRow);
    updateRowNumbers();
  });

  actionCell.appendChild(deleteBtn);
  newRow.appendChild(noCell);
  newRow.appendChild(textCell);
  newRow.appendChild(actionCell);

  tableBody.appendChild(newRow);
}

function updateRowNumbers() {
  const rows = tableBody.querySelectorAll('tr');
  count = 1;
  rows.forEach((row) => {
    row.firstElementChild.textContent = count++;
  });
}