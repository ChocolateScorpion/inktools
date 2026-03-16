console.log("script loaded");

async function convertImage(){

console.log("convertImage triggered");

const input = document.getElementById("heicInput");

if(!input.files.length){

document.getElementById("status").innerText = "Please select a HEIC file.";
return;

}

const file = input.files[0];

document.getElementById("status").innerText = "Converting...";

try{

const resultBlob = await heic2any({
blob: file,
toType: "image/jpeg",
quality: 0.9
});

const url = URL.createObjectURL(resultBlob);

const link = document.getElementById("downloadLink");

link.href = url;
link.download = "converted.jpg";
link.innerText = "Download JPG";
link.style.display = "block";

document.getElementById("status").innerText = "Conversion complete.";

}

catch(error){

console.error(error);
document.getElementById("status").innerText = "Conversion failed. Make sure the file is HEIC.";

}

}
