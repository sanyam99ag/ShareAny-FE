const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector("#browseBtn");

const bgProgress = document.querySelector(".bg-progress");
const progressPercent = document.querySelector("#progressPercent");
const progressContainer = document.querySelector(".progress-container");
// const dropZone = document.querySelector(".drop-zone");
const progressBar = document.querySelector(".progress-bar");
const status = document.querySelector(".status");

const sharingContainer = document.querySelector(".sharing-container");
const copyURLBtn = document.querySelector("#copyURLBtn");
const fileURL = document.querySelector("#fileURL");
const qr = document.querySelector(".qrcode");
const emailForm = document.querySelector("#emailForm");
const fileUploadForm = document.querySelector("#fileUploadForm");

const toast = document.querySelector(".toast");

const baseURL = "https://shareanyy.herokuapp.com";
const uploadURL = `${baseURL}/api/files`;
const emailURL = `${baseURL}/api/files/send`;

const maxAllowedSize = 100 * 1024 * 1024; //100mb


browseBtn.addEventListener("click", () => {
    fileInput.click();
});

// drop zone drop dragged dragover dragleave

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragged");

    console.log("dropping file");
});


dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    //   console.log("dropped", e.dataTransfer.files[0].name);
    const files = e.dataTransfer.files;
    if (files.length === 1) {
        if (files[0].size < maxAllowedSize) {
            fileInput.files = files;
            uploadFile();
        } else {
            showToast("Max file size is 100MB");
        }
    } else if (files.length > 1) {
        showToast("You can't upload multiple files");
    }
    dropZone.classList.remove("dragged");
});


dropZone.addEventListener("dragleave", (e) => {
    dropZone.classList.remove("dragged");

    console.log("drag ended");
});

// file input change and uploader
fileInput.addEventListener("change", () => {
    if (fileInput.files[0].size > maxAllowedSize) {
        showToast("Max file size is 100MB");
        fileInput.value = ""; // reset the input
        return;
    }
    uploadFile();
});

const uploadFile = () => {
    console.log("file added uploading");

    files = fileInput.files;
    const formData = new FormData();
    formData.append("myfile", files[0]);

    //show the uploader
    progressContainer.style.display = "block";

    // upload file
    const xhr = new XMLHttpRequest();

    // listen for upload progress
    xhr.upload.onprogress = function(event) {
        // find the percentage of uploaded
        let percent = Math.round((100 * event.loaded) / event.total);
        progressPercent.innerText = percent;
        const scaleX = `scaleX(${percent / 100})`;
        bgProgress.style.transform = scaleX;
        progressBar.style.transform = scaleX;
    };

    // handle error
    xhr.upload.onerror = function() {
        showToast(`Error in upload, Try again.`);
        fileInput.value = ""; // reset the input
        fileUploadForm.style.display = "block"; // Unhide the drop zone box

    };

    // listen for response which will give the link
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            onFileUploadSuccess(xhr.responseText);
        }
    };

    xhr.open("POST", uploadURL);
    xhr.setRequestHeader('Allow-Origin', '*');
    xhr.setRequestHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT DELETE');
    xhr.setRequestHeader('Access-Control-Allow-Methods', 'Content-type, X-Auth-Token, Origin, Authorization');

    xhr.send(formData);
};

const onFileUploadSuccess = (res) => {
    fileInput.value = ""; // reset the input
    status.innerText = "Uploaded";

    // remove the disabled attribute from form btn & make text send
    emailForm[2].removeAttribute("disabled");
    emailForm[2].innerText = "Send";
    progressContainer.style.display = "none"; // hide the progress container box
    fileUploadForm.style.display = "none"; // hide the drop zone box

    const { file: url } = JSON.parse(res);
    console.log(url);
    sharingContainer.style.display = "block";

    // Generate QR Code
    generateQRCode(url);

    fileURL.value = url;
};

// Generate QR code
const generateQRCode = (url) => {
    var qrcode = new QRious({ element: document.getElementById("qrcode"), value: url });
};

// sharing container listenrs
copyURLBtn.addEventListener("click", () => {
    fileURL.select();
    document.execCommand("copy");
    showToast("Copied to clipboard");
});

fileURL.addEventListener("click", () => {
    fileURL.select();
    document.execCommand("copy");
    showToast("Copied to clipboard");
});

emailForm.addEventListener("submit", (e) => {
    e.preventDefault(); // stop submission

    // disable the button
    emailForm[2].setAttribute("disabled", "true");
    emailForm[2].innerText = "Sending";

    const url = fileURL.value;

    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value,
    };
    console.log(formData);
    fetch(emailURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                showToast("Email Sent");
                sharingContainer.style.display = "none"; // hide the box
            }
        });
});

// the toast notifying function
let toastTimer;
const showToast = (msg) => {
    clearTimeout(toastTimer);
    toast.innerText = msg;
    toast.classList.add("show");
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
};