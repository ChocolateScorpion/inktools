async function convertImage(){

const input = document.getElementById("fileInput");

if(!input.files.length){

document.getElementById("status").innerText = "Please select a HEIC file.";
return;

}

const file = input.files[0];

document.getElementById("status").innerText = "Converting...";

try{

const convertedBlob = await heic2any({

blob: file,
toType: "image/jpeg",
quality: 0.9

});

const url = URL.createObjectURL(convertedBlob);

const link = document.getElementById("downloadLink");

link.href = url;
link.download = "converted.jpg";
link.innerText = "Download JPG";
link.style.display = "block";

document.getElementById("status").innerText = "Conversion complete.";

}

catch(error){

document.getElementById("status").innerText = "Conversion failed.";

}

}
