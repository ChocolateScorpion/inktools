<script>
const dropZone = document.getElementById("dropZone");
const input = document.getElementById("fileInput");
const preview = document.getElementById("preview");

let file;

// 👉 Loader control
function showLoader(state) {
  const loader = document.getElementById("loader");
  loader.style.display = state ? "block" : "none";
}

// 👉 Eventos
dropZone.onclick = () => input.click();

input.onchange = (e) => handleFile(e.target.files[0]);

dropZone.ondragover = (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "#fff";
};

dropZone.ondrop = (e) => {
  e.preventDefault();
  handleFile(e.dataTransfer.files[0]);
};

// 👉 Manejo de archivo
function handleFile(f) {
  file = f;
  preview.src = URL.createObjectURL(file);
}

// 👉 FUNCIÓN PRINCIPAL (CON UX + iPHONE FIX)
async function convert() {
  if (!file) {
    alert("Upload a file first");
    return;
  }

  const btn = document.getElementById("convertBtn");

  // 🔒 Estado de carga
  btn.disabled = true;
  btn.innerText = "Converting...";
  
</script>
