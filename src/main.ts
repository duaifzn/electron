import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as path from 'path'
import { IpcChannel } from './dto/ipcDto'
import { selectDir } from './service/ipcMainOnService'

class Main {
    private mainWindow: BrowserWindow

    public init(){
        app.on('ready', this.createWindow)
        app.on('activate', this.onActivate)
        app.on("window-all-closed", this.onWindowAllClosed)
        this.ipcMainOn()
    }
    private createWindow(){
        this.mainWindow = new BrowserWindow({
            width: 500,
            height: 400,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            }
        })
        //this.mainWindow.webContents.openDevTools();
        this.mainWindow.loadFile(path.resolve(__dirname, "../view/index.html"))
    }
    private onActivate(){
        if(this.mainWindow){
            this.createWindow()
        }
    }
    private onWindowAllClosed(){
        if(process.platform !== "darwin"){
            app.quit()
        }
    }
    private async ipcMainOn(){
        ipcMain.on(IpcChannel.selectDir, selectDir)
    }
}

(new Main()).init()

