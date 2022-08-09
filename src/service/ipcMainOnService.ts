import { dialog, IpcMainEvent } from 'electron'
import { IpcChannel } from '../dto/ipcDto'
import { writeFileSync ,readFileSync, existsSync } from 'fs'
import { FileName } from '../dto/fileName'
import { selectDirDto } from '../dto/ipcDto'
import { settingDto } from '../dto/setting'
const PORTABLE_EXECUTABLE_DIR = process.env.PORTABLE_EXECUTABLE_DIR?process.env.PORTABLE_EXECUTABLE_DIR+'\\':'';

export async function selectDir(event: IpcMainEvent, arg: any){
    const sender = arg
    const result = await dialog.showOpenDialog(this.mainWindow, {
      properties: ['openDirectory']
    })
    console.log('directories selected', result.filePaths)
    writeAutoSignPathToSetting(result.filePaths[0])
    const res: selectDirDto = {
      sender: sender,
      selectPath: result.filePaths[0]
    }
    event.reply(IpcChannel.selectDir, res)
}

function writeAutoSignPathToSetting(path: string){
  if(!existsSync(`${PORTABLE_EXECUTABLE_DIR}${FileName.settingJson}`)){
    let setting: settingDto = {
      privateKeyPath: '',
      apiKey: '',
      autoSignPath: path
    } 
    writeFileSync(`${PORTABLE_EXECUTABLE_DIR}${FileName.settingJson}`, JSON.stringify(setting))
    return
  }else{
    let setting: settingDto = JSON.parse(readFileSync(`${PORTABLE_EXECUTABLE_DIR}${FileName.settingJson}`, 'utf-8'));
    setting.autoSignPath = path;
    writeFileSync(`${PORTABLE_EXECUTABLE_DIR}${FileName.settingJson}`, JSON.stringify(setting));
  }
}

export async function writeSetting(event: IpcMainEvent, arg: any){
    writeFileSync(`${PORTABLE_EXECUTABLE_DIR}${FileName.settingJson}`, JSON.stringify(arg))
}