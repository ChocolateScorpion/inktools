async function normalizeFile(file) {
  const type = file.type || "";
  const name = file.name.toLowerCase();

  const isHEIC =
    type.includes("heic") ||
    type.includes("heif") ||
    name.endsWith(".heic") ||
    name.endsWith(".heif");

  if (isHEIC) {
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9
    });

    const blob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;

    return new File(
      [blob],
      file.name.replace(/\.(heic|heif)$/i, ".jpg"),
      { type: "image/jpeg" }
    );
  }

  return file;
}

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
  
    const btn = document.getElementById("convertBtn");
  
    btn.style.display = "block";
    btn.innerText = "Processing...";
    showLoader(false);
  
    try {

      const normalizedFile = await normalizeFile(f);
  

      file = normalizedFile;
  

      const url = URL.createObjectURL(normalizedFile);
      preview.src = url;
      preview.style.display = "block";
  
      btn.innerText = "Convert";
    } catch (err) {
      console.error(err);
      preview.style.display = "none";
      btn.innerText = "Error";
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

  document.addEventListener("DOMContentLoaded", () => {
    const qualityInput = document.getElementById("quality");
    const qualityValue = document.getElementById("qualityValue");
  
    if (qualityInput && qualityValue) {
      qualityInput.addEventListener("input", () => {
        qualityValue.innerText = qualityInput.value;
      });
    }
  });
