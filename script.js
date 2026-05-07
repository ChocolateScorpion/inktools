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
  const previewContainer = document.getElementById("previewContainer");
  const btn = document.getElementById("convertBtn");
  const loader = document.getElementById("loader");

  let files = [];

  dropZone.addEventListener("click", () => input.click());

  input.onchange = (e) => handleFiles(e.target.files);

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
    handleFiles(e.dataTransfer.files);
  };


async function handleFiles(fileList) {

  if (!fileList.length) return;

  files = [];

  previewContainer.innerHTML = "";

  btn.style.display = "block";
  btn.innerText = "Processing...";

  showLoader(true);

  try {

    for (const f of fileList) {

      const normalizedFile = await normalizeFile(f);

      files.push(normalizedFile);

      const url = URL.createObjectURL(normalizedFile);

      const item = document.createElement("div");
      item.className = "preview-item";

      item.innerHTML = `
        <img src="${url}">
        <p>${normalizedFile.name}</p>
      `;

      previewContainer.appendChild(item);
    }

    btn.innerText = `Convert ${files.length} file(s)`;

  } catch (err) {

    console.error(err);

    btn.innerText = "Error";
  }

  showLoader(false);
}

  
async function convert() {

  if (!files.length) {
    alert("Upload files first");
    return;
  }

  btn.style.display = "none";

  showLoader(true);

  try {

    for (const file of files) {

      const result = await config.convert(file);

      const url = URL.createObjectURL(result);

      const a = document.createElement("a");

      a.href = url;

      a.download = config.getFileName(file.name);

      a.click();
    }

  } catch (err) {

    console.error(err);

    alert("Conversion failed");
  }

  btn.style.display = "block";

  btn.innerText = `Convert ${files.length} file(s)`;

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
