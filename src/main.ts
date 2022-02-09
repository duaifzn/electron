import { app, BrowserWindow, ipcMain, Tray, Menu } from 'electron'
import * as path from 'path'
import { IpcChannel } from './dto/ipcDto'
import { selectDir, writeSetting } from './service/ipcMainOnService'
import { readFileSync, existsSync, appendFileSync, readdirSync, renameSync, mkdirSync } from 'fs'
import * as pki from './service/pki';
import { logger } from './service/logger';
import { FilenameExtension } from './dto/filenameExtension';
import { unProofDto } from './dto/unProofDto';
import { settingDto } from './dto/setting';
import { DirName } from './dto/dirName'
import { FileName } from './dto/fileName' 

class Main {
    private mainWindow: BrowserWindow

    public init(){
        app.on('ready', this.createWindow)
        app.on('activate', this.onActivate)
        app.on("window-all-closed", this.onWindowAllClosed)
        this.ipcMainOn()
        this.startCloudLogEncode()
    }
    private createWindow(){
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
        this.mainWindow.on('close', (event) =>{
            event.preventDefault();
            this.mainWindow.setSkipTaskbar(true);
            this.mainWindow.hide();
        });
        this.mainWindow.on('restore', () =>{
            this.mainWindow.show();
        }); 

        let tray = new Tray(path.resolve(__dirname, "../view/img/logo.png"))
        const contextMenu = Menu.buildFromTemplate([
            { label: 'open', click: () =>{
                this.mainWindow.show();
            }},
            { label: 'quit', click: () =>{
                this.mainWindow.destroy();
                tray.destroy();
            }}
        ])
        tray.setContextMenu(contextMenu);
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
        ipcMain.on(IpcChannel.writeSetting, writeSetting)
    }
    private startCloudLogEncode(){
        if(!existsSync(FileName.settingJson)){
            return
        }
        if(!existsSync(DirName.cloudLogEncoded)){
            mkdirSync(DirName.cloudLogEncoded, { recursive: true })
        }
        const setting: settingDto = JSON.parse(readFileSync(FileName.settingJson, "utf-8"))
        setInterval(this.cloudLogEncode, setting.cloudLogTime)
    }
    private cloudLogEncode(){
        const setting: settingDto = JSON.parse(readFileSync(FileName.settingJson, "utf-8"))
        if(!setting.cloudLogDirPath && 
            !setting.cloudLogTime && 
            !setting.privateKeyPath &&
            !setting.unProofDirPath){
                return
        }
        const privateKey = readFileSync(`${setting.privateKeyPath}`, 'utf8');
        const files = readdirSync(`${setting.cloudLogDirPath}`);
        files.forEach(fileName =>{
            const uploadFile = readFileSync(`${setting.cloudLogDirPath}/${fileName}`);
            //---------------------------------
            const startTime = performance.now()
            const sign = pki.sign(privateKey, uploadFile).toString('hex');
            const endTime = performance.now()
            logger.info(`Encode ${fileName} spend ${endTime - startTime} milliseconds.`)
            //---------------------------------
            const unProofData: unProofDto = {
                sign: `${sign}`,
                spendTime: `${endTime - startTime}`
            }
            renameSync(`${setting.cloudLogDirPath}/${fileName}`, `${DirName.cloudLogEncoded}/${fileName}`)
            appendFileSync(`${setting.unProofDirPath}/${fileName}${FilenameExtension.unProof}`, JSON.stringify(unProofData))
        })
    }
}

(new Main()).init()

