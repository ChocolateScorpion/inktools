async function normalizeFile(file) {

  const type = file.type || "";
  const name = file.name.toLowerCase();

  const isHEIC =
    type.includes("heic") ||
    type.includes("heif") ||
    name.endsWith(".heic") ||
    name.endsWith(".heif");

  if (isHEIC) {
    let blob;
    try {
      const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
      blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    } catch(e) {
      const bmp = await createImageBitmap(file);
      const cv = document.createElement('canvas');
      cv.width = bmp.width; cv.height = bmp.height;
      cv.getContext('2d').drawImage(bmp, 0, 0);
      bmp.close();
      blob = await new Promise((res, rej) => cv.toBlob(b => b ? res(b) : rej(new Error('export failed')), 'image/jpeg', 0.9));
    }
    return new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: "image/jpeg" });
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

        const processedFile = config.previewFromHEIC
          ? await normalizeFile(f)
          : f;

        files.push(processedFile);

        const item = document.createElement("div");

        item.className = "preview-item";

        // Detectar si es HEIC
        const isHEIC =
          processedFile.type.includes("heic") ||
          processedFile.type.includes("heif") ||
          processedFile.name.toLowerCase().endsWith(".heic") ||
          processedFile.name.toLowerCase().endsWith(".heif");

        // Si es HEIC y preview está desactivado
        if (isHEIC && !config.previewFromHEIC) {

          item.innerHTML = `
            <div class="heic-placeholder">
              HEIC File
            </div>
            <p>${processedFile.name}</p>
          `;

        } else {

          const url = URL.createObjectURL(processedFile);

          item.innerHTML = `
            <img src="${url}">
            <p>${processedFile.name}</p>
          `;
        }

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

      const isLibheif = err && (err.code === 2 || (err.message && err.message.includes('LIBHEIF')) || (err.message && err.message.includes('could not be decoded')));
      if (isLibheif) {
        alert("This HEIC file uses a format that couldn't be decoded in your browser.\n\nTry one of these:\n• Open the file on your iPhone or Mac and export it as JPG\n• Take a screenshot of the image and convert that instead\n• Use Safari on Mac, which has full HEIC support");
      } else {
        alert("Conversion failed. Please try a different file.");
      }
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
