
// the link to your model provided by Teachable Machine export panel
let client, address, startTime;

const video = document.getElementById("myvideo");
const handimg = document.getElementById("handimage");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
// let nextImageButton = document.getElementById("nextimagebutton");
let updateNote = document.getElementById("updatenote");

let imgindex = 1;
let isVideo = false;
let model = null;

// video.width = 500
// video.height = 400

const modelParams = {
  flipHorizontal: true, // flip e.g for video
  maxNumBoxes: 20, // maximum number of boxes to detect
  iouThreshold: 0.5, // ioU threshold for non-max suppression
  scoreThreshold: 0.6, // confidence threshold for predictions.
};

function startVideo() {
  handTrack.startVideo(video).then(function (status) {
    console.log("video started", status);
    if (status) {
      updateNote.innerText = "Video started. Now tracking";
      isVideo = true;
      runDetection();
    } else {
      updateNote.innerText = "Please enable video";
    }
  });
}

function toggleVideo() {
  if (!isVideo) {
    updateNote.innerText = "Starting video";
    startVideo();
  } else {
    updateNote.innerText = "Stopping video";
    handTrack.stopVideo(video);
    isVideo = false;
    updateNote.innerText = "Video stopped";
  }
}

trackButton.addEventListener("click", function () {
  toggleVideo();
});

function runDetection() {
  model.detect(video).then((predictions) => {
    console.log("Predictions: ", predictions);
    model.renderPredictions(predictions, canvas, context, video);
    // Filter out the face and choose the prediction with highest probability
    const best_prediction = predictions.filter((prediction) => prediction.label !== "face").sort((a, b) => b.probability - a.probability)[0];
    if (best_prediction) {
        const message = [best_prediction.class*50, ...best_prediction.bbox];
        window.oscApi.sendMessage(address, message);
    }
    if (isVideo) {
      requestAnimationFrame(runDetection);
    }
  });
}

function runDetectionImage(img) {
  model.detect(img).then((predictions) => {
    console.log("Predictions: ", predictions);
    model.renderPredictions(predictions, canvas, context, img);
  });
}

// Load the model.
handTrack.load(modelParams).then((lmodel) => {
  // detect objects in the image.
  model = lmodel;
  console.log(model);
  updateNote.innerText = "Loaded Model!";
  runDetectionImage(handimg);
  trackButton.disabled = false;
  nextImageButton.disabled = false;
});

const stashDefaults = {
    oscAddress: "/wek/inputs",
    oscPort: 6448
};

const pageStashName = 'useHandBox';

const initialStash = stash.get(pageStashName) || stashDefaults;
let myStash = initialStash; // This stash is updated as the form is updated...
initPage(myStash);


function getId(string) {
    return document.getElementById(string);
}

function initPage(state) {
    document.getElementById("osc-port").value = state.oscPort;
    document.getElementById("osc-address").value = state.oscAddress;
}

function handleOSCForm(event) {
    event.preventDefault();
    const formInputs = $(event.target).serializeArray();
    const isOscParam = (x) => x.name.includes('osc');
    const oscParams = Object.fromEntries(
                formInputs.filter(isOscParam).map(x=>[x.name, x.value]));
    myStash.oscPort = parseInt(oscParams['osc-port']);
    myStash.oscAddress = oscParams['osc-address'];
    stash.set(pageStashName, myStash); // Always update the stash!
    startOSCClient(oscParams, myStash);

     getId("sending-info").innerText = `Sending 5 values to ${myStash.oscAddress} port ${myStash.oscPort}: class, x_min, y_min, x_max, y_max`;
}


function startOSCClient(oscParams, myStash, inputParams) {
    address = oscParams['osc-address'];
    window.oscApi.startOSCClient(oscParams['osc-port']);
}


$("#osc-form").submit(handleOSCForm);
