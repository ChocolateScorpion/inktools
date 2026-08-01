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

    // Cancel button
    let cancelled = false;
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Stop conversion";
    cancelBtn.style.cssText = "width:100%;padding:10px;margin-top:8px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.12);background:transparent;color:#8C8880;font-family:inherit;font-size:13px;cursor:pointer;transition:color 0.15s,border-color 0.15s;";
    cancelBtn.onmouseover = () => { cancelBtn.style.color = "#E8E4DC"; cancelBtn.style.borderColor = "rgba(255,255,255,0.25)"; };
    cancelBtn.onmouseout  = () => { cancelBtn.style.color = "#8C8880"; cancelBtn.style.borderColor = "rgba(255,255,255,0.12)"; };
    cancelBtn.onclick = () => { cancelled = true; cancelBtn.textContent = "Stopping…"; cancelBtn.disabled = true; cancelBtn.style.opacity = "0.5"; };
    loader.parentNode.insertBefore(cancelBtn, loader.nextSibling);

    const failed = [];
    let converted = 0;

    for (const file of files) {
      if (cancelled) break;
      try {
        const result = await config.convert(file);
        const url = URL.createObjectURL(result);
        const a = document.createElement("a");
        a.href = url;
        a.download = config.getFileName(file.name);
        a.click();
        converted++;
      } catch (err) {
        console.error(file.name, err);
        failed.push(file.name);
      }
    }

    cancelBtn.remove();

    if (cancelled && converted < files.length) {
      // silent stop — user chose to stop, no alert needed
    } else if (failed.length) {
      const names = failed.slice(0, 5).join("\n• ");
      const more = failed.length > 5 ? `\n…and ${failed.length - 5} more` : "";
      alert(
        `Converted ${converted} of ${files.length} file(s).\n\n` +
        `${failed.length} file(s) could not be decoded in your browser:\n• ${names}${more}\n\n` +
        `For these files, try:\n• Open on iPhone or Mac and export as JPG\n• Use Safari on Mac`
      );
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
