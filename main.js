const { app, BrowserWindow, ipcMain } = require('electron');

let win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        icon: __dirname + './src/img/icon.ico',
        width: 960,
        height: 720,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    win.loadFile('index.html');

    // Open the DevTools.
    win.webContents.openDevTools();

    // Remove menu
    win.removeMenu();

    // No resizing
    win.setResizable(false);
}

// Create board from value received
function setBoard(value) {
    if (value === 'Easy') {
        return {
            rows: 8,
            cols: 10,
            rowWidth: 500,
            rowHeight: 50,
            mineNumbers: 10,
        }
    } else if (value === 'Medium') {
        return {
            rows: 14,
            cols: 18,
            rowWidth: 40 * 18,
            rowHeight: 40,
            mineNumbers: 40,
        }
    } else {
        return {
            rows: 20,
            cols: 24,
            rowWidth: 30 * 24,
            rowHeight: 30,
            mineNumbers: 99,
        }
    }
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('start:game', function (event, value) {
    var prop = setBoard(value);
    win.webContents.send('start:game', prop);
});

