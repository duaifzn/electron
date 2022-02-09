import { dialog, IpcMainEvent } from 'electron'
import { IpcChannel } from '../dto/ipcDto'
import { writeFileSync ,readFileSync, existsSync } from 'fs'
import { FileName } from '../dto/fileName'

export async function selectDir(event: IpcMainEvent){
    const result = await dialog.showOpenDialog(this.mainWindow, {
      properties: ['openDirectory']
    })
    console.log('directories selected', result.filePaths)
    event.reply(IpcChannel.selectDir, result.filePaths)
}

export async function writeSetting(event: IpcMainEvent, arg: any){
  if(!existsSync(FileName.settingJson)){
    writeFileSync(FileName.settingJson, JSON.stringify({...arg, cloudLogTime : 120000}))
  }
  else{
    let setting = JSON.parse(readFileSync(FileName.settingJson, "utf-8"))
    writeFileSync(FileName.settingJson, JSON.stringify({...arg, cloudLogTime : setting.cloudLogTime}))
  }
}