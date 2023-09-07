const { Client } = require('node-osc-wek');
// const { ipcRenderer } = require('electron');

// const Nucleus = require('nucleus-nodejs');

// const handpose = require('@tensorflow-models/handpose');

const nPose = require("@teachablemachine/pose");

// const tf = require('@tensorflow/tfjs');

// const facemesh = require('@tensorflow-models/facemesh');

tf.setBackend('webgl');



window.Client = Client;
// window.openExternal = require('electron').shell.openExternal;

// window.prompt = require('electron-prompt');

window.handpose = handpose;
window.nPose = nPose;
window.tfCore = tf;
window.tf = tf;
window.facemesh = facemesh;
// window.invoke = ipcRenderer.invoke;

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

});