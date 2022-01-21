import { dialog, IpcMainEvent } from 'electron'
import { IpcChannel } from '../dto/ipcDto'

export async function selectDir(event: IpcMainEvent){
    const result = await dialog.showOpenDialog(this.mainWindow, {
      properties: ['openDirectory']
    })
    console.log('directories selected', result.filePaths)
    event.reply(IpcChannel.selectDir, result.filePaths)
}