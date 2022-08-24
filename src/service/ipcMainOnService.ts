import { dialog, IpcMainEvent } from 'electron'
import { IpcChannel } from '../dto/ipcDto'
import { writeFileSync ,readFileSync, existsSync } from 'fs'
import { FileName } from '../dto/fileName'
import { selectDirDto } from '../dto/ipcDto'
const PORTABLE_EXECUTABLE_DIR = process.env.PORTABLE_EXECUTABLE_DIR?process.env.PORTABLE_EXECUTABLE_DIR+'\\':'';

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
    writeFileSync(`${PORTABLE_EXECUTABLE_DIR}${FileName.settingJson}`, JSON.stringify(arg))
}