const { app, BrowserWindow, ipcMain, shell } = require('electron')
// include the Node.js 'path' module at the top of your file
const path = require('path')
const {Client} = require('node-osc-wek');

let client;

const webPreferences = {preload: path.join(__dirname, 'preload.js')};

const createWindow = () => {
    const win = new BrowserWindow({
      width: 900,
      height: 700,
      webPreferences: webPreferences
    })
  
    win.loadFile('src/index.html')
  }

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })


ipcMain.handle('startOSCClient', async (event, port) => {
    if (client) {
        client.close()
    }
    const portInt = parseInt(port)
    client = new Client('127.0.0.1', portInt)
    console.log("Client started on port", portInt)
})

ipcMain.handle('sendMessage', async (event, address, message) => {
    client.send(address, ...message);
    console.log("Message sent to", address, ":", message)
})

ipcMain.handle('new-home-window', async (event) => {
    createWindow();
  })

ipcMain.handle('open-link', async (event, link) => {
    shell.openExternal(link);
})