const {
  contextBridge,
  ipcRenderer
} = require("electron");


window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
  })

contextBridge.exposeInMainWorld('oscApi', {
    startOSCClient: (port) => ipcRenderer.invoke('startOSCClient', port),
    sendMessage: (address, message) => ipcRenderer.invoke('sendMessage', address, message),
  })


contextBridge.exposeInMainWorld('appWindow', {
  app: () => ipcRenderer.invoke('new-home-window'),
  openWekinator: () => ipcRenderer.invoke('open-link', 'http://wekinator.org/'),
  openTeachableMachine: () => ipcRenderer.invoke('open-link', 'https://teachablemachine.withgoogle.com/'),
})