


// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
let webcam, ctx, labelContainer, maxPredictions, client, address, detector;

const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
const detectorConfig = {
  runtime: 'mediapipe',
  solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
                // or 'base/node_modules/@mediapipe/face_mesh' in npm.
};

async function loadDetector() {
    detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
    console.log("loaded face mesh detector");
}

loadDetector();

client = {};

let nPose = tmPose;
let showFacePoints = true;
let pose;
// TO DO
// Features: Add saving feature, named presets?
// Split Position / Score inputs into two arrays since I have to filter them anyway

const pageStashName = 'useFace';

const stashDefaults = {
    oscAddress: "/wek/inputs",
    oscPort: 6448,
};

const faceAreas = [
    'silhouette',        'lipsUpperOuter',
    'lipsLowerOuter',    'lipsUpperInner',
    'lipsLowerInner',    'rightEyeUpper0',
    'rightEyeLower0',    'rightEyeUpper1',
    'rightEyeLower1',    'rightEyeUpper2',
    'rightEyeLower2',    'rightEyeLower3',
    'rightEyebrowUpper', 'rightEyebrowLower',
    'leftEyeUpper0',     'leftEyeLower0',
    'leftEyeUpper1',     'leftEyeLower1',
    'leftEyeUpper2',     'leftEyeLower2',
    'leftEyeLower3',     'leftEyebrowUpper',
    'leftEyebrowLower',  'midwayBetweenEyes',
    'noseTip',           'noseBottom',
    'noseRightCorner',   'noseLeftCorner',
    'rightCheek',        'leftCheek'
  ];

  const displayAreas = [
    'silhouette',        'lipsUpperOuter',
    'lipsLowerOuter',    'lipsUpperInner',
    'lipsLowerInner',    'rightEyeUpper0',
    'rightEyeLower0',    'rightEyeUpper1',
    'rightEyeLower1',    'rightEyeUpper2',
    'rightEyeLower2',    'rightEyeLower3',
    'rightEyebrowUpper', 'rightEyebrowLower',
    'leftEyeUpper0',     'leftEyeLower0',
    'leftEyeUpper1',     'leftEyeLower1',
    'leftEyeUpper2',     'leftEyeLower2',
    'leftEyeLower3',     'leftEyebrowUpper',
    'leftEyebrowLower',  'midwayBetweenEyes', 
    'noseBottom',
    'noseRightCorner',   'noseLeftCorner',
    'rightCheek',        'leftCheek'
  ];

//   function toggleFacePoints(event) {
//     const text = {true: "Hide Face Points", false: "Show Face Points"};
//     showFacePoints = !showFacePoints;
//     event.target.innerText = text[showFacePoints];
// }


const initialStash = stash.get(pageStashName) || stashDefaults;
let myStash = initialStash; // This stash is updated as the form is updated...

initPage(myStash);

function initPage(state) {
    document.getElementById("osc-port").value = state.oscPort;
    document.getElementById("osc-address").value = state.oscAddress;
}


function getId(string) {
    return document.getElementById(string);
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
    getId("sending-info").innerText = `Sending 375 values to ${myStash.oscAddress} port ${myStash.oscPort}`;
    getId("tm-button").removeAttribute("disabled");
}

function startOSCClient(oscParams, myStash) {
    address = oscParams['osc-address'];
    client.address = address;
    port = parseInt(oscParams['osc-port']);
    client.port = port;
    window.oscApi.startOSCClient(port);
}

$("#osc-form").submit(handleOSCForm);

function sendMessage(client, pose) {
    const keypoints = pose[0].keypoints.filter(x => x.name).map(x => [x.x, x.y, x.z]).flat()

    window.oscApi.sendMessage(client.address, keypoints);
}

// document.getElementById("osc-button").addEventListener('click', startOSCClient);

const poseContainer = document.getElementById("pose-container");

async function init() {
    // Convenience function to setup a webcam
    const size = 400;
    const flip = true; // whether to flip the webcam
    webcam = new nPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    startTime = performance.now();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = size; canvas.height = size;
    ctx = canvas.getContext("2d");
    ctx.fillStyle =  "#27C42F";
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    const elapsed = timestamp - startTime;
    const estimationConfig = {flipHorizontal: false};
    pose = await detector.estimateFaces(canvas, estimationConfig);

    // Lots of stuff in here:

    ctx.drawImage(webcam.canvas, 0, 0);
    if (pose && Array.isArray(pose) && pose.length > 0) {
        if (showFacePoints) {
        pose.forEach(face => {
            drawKeypoints(ctx, face)
        });
        }
        if (client) {
            sendMessage(client, pose);
        }
    }


    // client.send(address, message);
    // splat out the message using inputParams
    if (elapsed < 1800000) {
        window.requestAnimationFrame(loop);
    } else {
        // Simple cleanup
        webcam.stop();
    }
}

function drawPoint(ctx, y, x, r) {
    ctx.fillRect(x, y, r, r);
  }
  
function drawKeypoints(ctx, keypoints) {
    for (let i = 0; i < keypoints.length; i++) {
      const y = keypoints[i][0];
      const x = keypoints[i][1];
      drawPoint(ctx, x - 2, y - 2, 1);
    }
}

// function drawSomeKeypoints(ctx, annotations) {
//     ctx.globalAlpha = 0.8;
//     displayAreas.forEach(x => 
//         annotations[x].forEach(keypoint => 
//             {
//                 drawPoint(ctx, keypoint[1]-2, keypoint[0]-2, 2);
//             }));
//     ctx.globalAlpha = 1;
// }