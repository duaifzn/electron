export enum IpcChannel {
    selectDir = 'selectDir',
    writeSetting = 'writeSetting'
} 
export interface selectDirDto {
    sender: string,
    selectPath: string,
}