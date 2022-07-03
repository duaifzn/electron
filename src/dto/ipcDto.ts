export enum IpcChannel {
    selectDir = 'selectDir',
    writeSetting = 'writeSetting'
} 
export interface writeSettingChannelDto {
    privateKeyPath: string,
    apiKey: string,
}
export interface selectDirDto {
    sender: string,
    selectPath: string,
}