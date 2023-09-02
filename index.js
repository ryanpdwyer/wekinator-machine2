const { app, BrowserWindow } = require('electron')
// include the Node.js 'path' module at the top of your file
const path = require('path')


const createWindow = () => {
    const win = new BrowserWindow({
      width: 900,
      height: 700,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  
    win.loadFile('src/index.html')
  }

app.whenReady().then(() => {
    createWindow()
})