
// the link to your model provided by Teachable Machine export panel
let model, webcam, ctx, labelContainer, maxPredictions, client, address, startTime;


let pose, handDetector;

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

     getId("sending-info").innerText = `Sending 4 values to ${myStash.oscAddress} port ${myStash.oscPort}`;
}



function startOSCClient(oscParams, myStash, inputParams) {
    address = oscParams['osc-address'];
    window.oscApi.startOSCClient(oscParams['osc-port']);
}


$("#osc-form").submit(handleOSCForm);

function sendMessage(client, pose) {
    const message = [pose.startPoint[0], pose.startPoint[1], pose.endPoint[0], pose.endPoint[1]];
    window.oscApi.sendMessage(oscParams['osc-address'], message);
}