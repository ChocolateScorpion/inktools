<script>
document.addEventListener("DOMContentLoaded", function () {

  let file = null;

  const dropZone = document.getElementById("dropZone");
  const input = document.getElementById("fileInput");
  const preview = document.getElementById("preview");
  const btn = document.getElementById("convertBtn");

  function showLoader(state) {
    const loader = document.getElementById("loader");
    loader.style.display = state ? "block" : "none";
  }

  function handleFile(f) {
    if (!f) return;
    file = f;
    preview.src = URL.createObjectURL(file);
  }

  // 👉 CLICK
  dropZone.addEventListener("click", () => {
    input.click();
  });

  // 👉 INPUT
  input.addEventListener("change", (e) => {
    handleFile(e.target.files[0]);
  });

  // 👉 DRAG OVER
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#fff";
  });

  // 👉 DROP
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  });

  // 👉 CONVERT (GLOBAL)
  window.convert = async function () {
    if (!file) {
      alert("Upload a file first");
      return;
    }

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
  };

});
</script>
