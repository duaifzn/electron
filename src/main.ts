import { app, BrowserWindow, ipcMain, Tray, Menu } from 'electron'
import * as path from 'path'
import { IpcChannel } from './dto/ipcDto'
import { selectDir, writeSetting } from './service/ipcMainOnService'
import { existsSync, writeFileSync } from 'fs'
import { FileName } from './dto/fileName';
import autoSign from './schedule/autoSign';
import { defaultSetting } from './dto/setting'
import { logger } from './service/logger'
const PORTABLE_EXECUTABLE_DIR = process.env.PORTABLE_EXECUTABLE_DIR ? process.env.PORTABLE_EXECUTABLE_DIR + '\\' : '';
class Main {
    private mainWindow: BrowserWindow

    public init() {
        app.on('ready', this.createWindow)
        app.on('activate', this.onActivate)
        app.on("window-all-closed", this.onWindowAllClosed)
        this.ipcMainOn()
        this.start()
        this.autoSignSchedule()
    }
    private createWindow() {
        this.mainWindow = new BrowserWindow({
            width: 900,
            height: 575,
            icon: path.resolve(__dirname, "../view/img/logo.png"),
            title: '離線簽章程式',
            resizable: false,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            }
        })
        this.mainWindow.loadFile(path.resolve(__dirname, "../view/index.html"))
        this.mainWindow.on('close', (event) => {
            event.preventDefault();
            this.mainWindow.setSkipTaskbar(true);
            this.mainWindow.hide();
        });
        this.mainWindow.on('restore', () => {
            this.mainWindow.show();
        });

        let tray = new Tray(path.resolve(__dirname, "../view/img/logo.png"))
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'open', click: () => {
                    this.mainWindow.show();
                }
            },
            {
                label: 'quit', click: () => {
                    this.mainWindow.destroy();
                    tray.destroy();
                }
            }
        ])
        tray.setContextMenu(contextMenu);
    }
    private onActivate() {
        if (this.mainWindow) {
            this.createWindow()
        }
    }
    private onWindowAllClosed() {
        if (process.platform !== "darwin") {
            app.quit()
        }
    }
    private async ipcMainOn() {
        ipcMain.on(IpcChannel.selectDir, selectDir)
        ipcMain.on(IpcChannel.writeSetting, writeSetting)
    }
    private start() {
        if (!existsSync(`${PORTABLE_EXECUTABLE_DIR}${FileName.settingJson}`)) {
            writeFileSync(`${PORTABLE_EXECUTABLE_DIR}${FileName.settingJson}`, JSON.stringify({
                ...defaultSetting,
            }))
        }
        
    }
    private async autoSignSchedule(){
        setInterval(() =>{
            try{
                let schedule = new autoSign;
            }catch(err){
                logger.error(`${err}`);
            }
        }, 60000);
    }
}

(new Main()).init()

