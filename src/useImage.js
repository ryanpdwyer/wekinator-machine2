


// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
let model, webcam, ctx, labelContainer, maxPredictions, address, startTime;

let client = {};

const useImageDefaults = {
    oscAddress: "/wek/outputs",
    oscPort: 12000,
    tmUrl: "https://teachablemachine.withgoogle.com/models/KO_WpoABe/"
};

let initialStash = stash.get('useImage') || useImageDefaults;
let myStash = initialStash;

initPage(myStash);

function initPage(state) {
    document.getElementById("osc-port").value = state.oscPort;
    document.getElementById("osc-address").value = state.oscAddress;
    document.getElementById('tm-url').value = state.tmUrl;
}

document.getElementById("restore-defaults").addEventListener('click', () => initPage(useImageDefaults));

function startOSCClient(event) {

    const port = parseInt(document.getElementById("osc-port").value);
    address = document.getElementById("osc-address").value;
    myStash.oscAddress = address;
    myStash.oscPort = port;
    stash.set('useImage', myStash);
    window.oscApi.startOSCClient(port);
    document.getElementById("osc-info").innerText = `Sending 1 value to ${address} port ${port}`
    document.getElementById("tm-button").removeAttribute("disabled");
}

document.getElementById("osc-button").addEventListener('click', startOSCClient);


    // Load the image model and setup the webcam
    async function init() {
    let URL = document.getElementById("tm-url").value;
        if (!URL.endsWith("/")) {
        URL = URL+"/";
    }
    myStash.tmUrl = URL;
    stash.set('useImage', myStash);
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(400, 400, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    startTime = performance.now();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

    async function loop(timestamp) {
        webcam.update(); // update the webcam frame
        const prediction = await predict();
        window.oscApi.sendMessage(address, [prediction+1]);
        const elapsed = timestamp - startTime;
        window.requestAnimationFrame(loop);
    }

    // run the webcam image through the image model
    async function predict() {
        // predict can take in an image, video or canvas html element
        const prediction = await model.predict(webcam.canvas);
        const iMax = argMax(prediction.map(x => x.probability));

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
        return iMax;
    }




// async function init() {
//     let URL = document.getElementById("tm-url").value;
//     if (!URL.endsWith("/")){
//         URL = URL+"/";
//     }
//     myStash.tmUrl = URL;
//     stash.set('useImage', myStash);
//     const modelURL = URL + "model.json";
//     const metadataURL = URL + "metadata.json";

//     // load the model and metadata
//     // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
//     model = await tmImage.load(modelURL, metadataURL);
//     maxPredictions = model.getTotalClasses();

//     // Convenience function to setup a webcam
//     const size = 200;
//     const flip = true; // whether to flip the webcam
//     webcam = new tmImage.Webcam(size, size, flip); // width, height, flip
//     await webcam.setup(); // request access to the webcam
//     await webcam.play();
//     startTime = performance.now();
//     window.requestAnimationFrame(loop);

//     // append/get elements to the DOM
//     const canvas = document.getElementById("canvas");
//     canvas.width = size; canvas.height = size;
//     ctx = canvas.getContext("2d");
//     canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     // append/get elements to the DOM
//     labelContainer = document.getElementById("label-container");
//     for (let i = 0; i < maxPredictions; i++) { // and class labels
//         labelContainer.appendChild(document.createElement("div"));
//     }
// }


// async function loop(timestamp) {
//     webcam.update(); // update the webcam frame
//     const classified = await predict();
//     window.oscApi.sendMessage(address, [classified+1]);
//     const elapsed = timestamp - startTime;
//     if (webcam.canvas) {
//         ctx.drawImage(webcam.canvas, 0, 0);
//     }
//     if (elapsed < 1800000) {
//         window.requestAnimationFrame(loop);
//     } else {
//     // Simple cleanup
//     webcam.stop();
//     }
// }

// // run the webcam image through the image model
// async function predict() {
//     // predict can take in an image, video or canvas html element
//     const prediction = await model.predict(webcam.canvas);
//     const iMax = argMax(prediction.map(x => x.probability));

//     for (let i = 0; i < maxPredictions; i++) {
//         const classPrediction =
//             prediction[i].className + ": " + prediction[i].probability.toFixed(2);
//         labelContainer.childNodes[i].innerHTML = classPrediction;
//         if (iMax === i) {
//         labelContainer.childNodes[i].classList.add("chosen-class");
//         } else {
//         labelContainer.childNodes[i].classList.remove("chosen-class");
//         }
//     }
//     return iMax;
// }

