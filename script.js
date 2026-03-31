function setupTool(config) {
  const dropZone = document.getElementById("dropZone");
  const input = document.getElementById("fileInput");
  const preview = document.getElementById("preview");
  const btn = document.getElementById("convertBtn");
  const loader = document.getElementById("loader");

  let file;

  dropZone.addEventListener("click", () => input.click());

  input.onchange = (e) => handleFile(e.target.files[0]);

  dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.classList.add("active");
  };

  dropZone.ondragleave = () => {
    dropZone.classList.remove("active");
  };

  dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.classList.remove("active");
    handleFile(e.dataTransfer.files[0]);
  };

  async function handleFile(f) {
    if (!f) return;

    file = f;
    btn.style.display = "block";
    btn.innerText = "Convert";
    showLoader(false);

    try {
      let previewBlob;

      if (config.previewFromHEIC && (f.type.includes("heic") || f.type.includes("heif"))) {
        previewBlob = await heic2any({
          blob: f,
          toType: "image/jpeg"
        });
        previewBlob = Array.isArray(previewBlob) ? previewBlob[0] : previewBlob;
      } else {
        previewBlob = f;
      }

      const url = URL.createObjectURL(previewBlob);
      preview.src = url;
      preview.style.display = "block";

    } catch {
      preview.style.display = "none";
    }
  }

  async function convert() {
    if (!file) {
      alert("Upload a file first");
      return;
    }

    btn.style.display = "none";
    showLoader(true);

    try {
      const result = await config.convert(file);

      const url = URL.createObjectURL(result);

      const a = document.createElement("a");
      a.href = url;
      a.download = config.getFileName(file.name);
      a.click();

    } catch (err) {
      console.error(err);
      alert("Conversion failed");
    }

    btn.style.display = "block";
    btn.innerText = "Convert";
    showLoader(false);
  }

  function showLoader(state) {
    loader.style.display = state ? "block" : "none";
  }

  window.convert = convert;
}
