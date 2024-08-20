const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");


img.addEventListener(
  "change",
  (e) => {
    const files = e.target.files[0];
    console.log(files);
    const fileType = files.type;
    const acceptedFileTypes = ["image/gif", "image/jpeg", "image/png"];
    if (!acceptedFileTypes.includes(fileType)) {
      console.log("select an image");
      Alert("error", "Please select an image file");
      return;
    }
    //Get original dimensions
    const image = new Image();
    image.src = URL.createObjectURL(files);
    image.onload = function () {
      heightInput.value = this.height;
      widthInput.value = this.width;
    };
    const imgSrc = image.src;
    // console.log(getImageSizeInBytes(imgSrc));
    form.style.display = "block";
    filename.innerText = files.name;
    outputPath.innerText = files.path;
  },
  false
);

//Get image size in bytes
function getImageSizeInBytes(imgURL) {
  var request = new XMLHttpRequest();
  request.open("HEAD", imgURL, false);
  request.send(null);
  var headerText = request.getAllResponseHeaders();
  var re = /Content\-Length\s*:\s*(\d+)/i;
  re.exec(headerText);
  return parseInt(RegExp.$1);
}

//send image data to main process
function sendImage(e) {
  e.preventDefault();
  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;

  if (!img.files[0]) {
    Alert("error", "Please upload an image first");
    return;
  }
  if (width === "" || height === "") {
    Alert("error", "Please complete the form");
    return;
  }
  window.ipc.send({ width, height, imgPath });
}

//receive instruction from main process
window.ipc.on((value) => {
  console.log(value, );
});

function Alert(type, msg) {
  if (type == "success") {
    Api.toastify({
      text: `${msg}`,
      duration: 5000,
      close: false,
      gravity: "top",
      position: "center",
      stopOnFocus: true,
      style: {
        background:
          "linear-gradient(to right, rgba(0,128,0,0.8),rgba(0,0,0,0))",
        color: "white",
        textAlign: "center",
      },
    });
  } else {
    Api.toastify({
      text: `${msg}`,
      duration: 5000,
      close: false,
      gravity: "top",
      position: "center",
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, rgba(255,0,0,1), rgba(0,0,0,0))",
        color: "white",
        textAlign: "center",
      },
    });
  }
}

form.addEventListener("submit", sendImage);
