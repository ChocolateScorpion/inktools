<script>
const dropZone = document.getElementById("dropZone");
const input = document.getElementById("fileInput");
const preview = document.getElementById("preview");

let file;

// 👉 Loader
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

// 👉 Archivo
function handleFile(f) {
  file = f;
  preview.src = URL.createObjectURL(file);
}

// 👉 Convertir (FINAL)
async function convert() {
  if (!file) {
    alert("Upload a file first");
    return;
  }

  const btn = document.getElementById("convertBtn");

  btn.disabled = true;
  btn.innerText = "Converting...";
  showLoader(true);

  try {
    const format = document.getElementById("format").value;

    const result = await heic2any({
      blob: file,
      toType: format
    });

    const outputBlob = Array.isArray(result) ? result[0] : result;
    const url = URL.createObjectURL(outputBlob);

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isIOS) {
      window.open(url, "_blank");
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = "converted";
      a.click();
    }

  } catch (error) {
    console.error(error);
    alert("Error converting image");
  }

  btn.disabled = false;
  btn.innerText = "Convert";
  showLoader(false);
}
</script>
