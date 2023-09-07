


// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
let model, webcam, ctx, labelContainer, maxPredictions, address, startTime;

let client = {};

const stashDefaults = {
    oscAddress: "/wek/outputs",
    oscPort: 12000,
    tmUrl: "https://teachablemachine.withgoogle.com/models/4r858bxP0/"
};

const pageStashName = 'useModel';

let initialStash = stash.get(pageStashName) || stashDefaults;
let myStash = initialStash;

initPage(myStash);

function initPage(state) {
    document.getElementById("osc-port").value = state.oscPort;
    document.getElementById("osc-address").value = state.oscAddress;
    document.getElementById('tm-url').value = state.tmUrl;
}

document.getElementById("restore-defaults").addEventListener('click', () => initPage(stashDefaults));

function startOSCClient(event) {
    const port = parseInt(document.getElementById("osc-port").value);
    address = document.getElementById("osc-address").value;
    myStash.oscAddress = address;
    myStash.oscPort = port;
    stash.set(pageStashName, myStash);
    window.oscApi.startOSCClient(port);
    document.getElementById("tm-button").removeAttribute("disabled");
    // Set the innerText of the #osc-info element to show the address and port
    document.getElementById('osc-info').innerText = `Sending 1 value to ${address} port ${port}.`;
}

document.getElementById("osc-button").addEventListener('click', startOSCClient);

async function init() {
    let URL = document.getElementById("tm-url").value;
    if (!URL.endsWith("/")){
        URL = URL+"/";
    }
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    myStash.tmUrl = URL;
    stash.set(pageStashName, myStash);

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const size = 400;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    startTime = performance.now();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = size; canvas.height = size;
    ctx = canvas.getContext("2d");
    canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    const classified = await classifyInt();
    window.oscApi.sendMessage(address, [classified]);
    const elapsed = timestamp - startTime;
    if (elapsed < 1800000) {
        window.requestAnimationFrame(loop);
    } else {
        // Simple cleanup
        webcam.stop();
    }
}

async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;

    }

    // finally draw the poses
    drawPose(pose);
}

async function classifyProbability() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    return prediction
}

async function classify() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);


    const mostProb = prediction.reduce((x, y) => {
      return y.probability > x.probability ? y : x
    });

    return mostProb.className
}

async function classifyInt() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    const iMax = argMax(prediction.map(x => x.probability));

    const indices = Object.fromEntries(prediction.map((x, i) => [x.className, i+1]));

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
        if (iMax === i) {
            labelContainer.childNodes[i].classList.add("chosen-class");
        } else {
            labelContainer.childNodes[i].classList.remove("chosen-class");
        }

    }

    // finally draw the poses
    drawPose(pose);


    const mostProb = prediction.reduce((x, y) => {
      return y.probability > x.probability ? y : x
    });

    return indices[mostProb.className];
}

function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}