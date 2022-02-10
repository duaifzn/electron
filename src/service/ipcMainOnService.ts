import { dialog, IpcMainEvent } from 'electron'
import { IpcChannel } from '../dto/ipcDto'
import { writeFileSync ,readFileSync } from 'fs'
import { FileName } from '../dto/fileName'
import { selectDirDto } from '../dto/ipcDto'

export async function selectDir(event: IpcMainEvent, arg: any){
    const sender = arg
    const result = await dialog.showOpenDialog(this.mainWindow, {
      properties: ['openDirectory']
    })
    console.log('directories selected', result.filePaths)
    const res: selectDirDto = {
      sender: sender,
      selectPath: result.filePaths[0]
    }
    event.reply(IpcChannel.selectDir, res)
}

export async function writeSetting(event: IpcMainEvent, arg: any){
    let setting = JSON.parse(readFileSync(FileName.settingJson, "utf-8"))
    writeFileSync(FileName.settingJson, JSON.stringify({...arg, cloudLogTime : setting.cloudLogTime}))
}