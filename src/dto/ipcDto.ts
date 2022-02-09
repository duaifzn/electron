export enum IpcChannel {
    selectDir = 'selectDir',
    writeSetting = 'writeSetting'
} 
export interface writeSettingChannelDto {
    unProofDirPath: string,
    privateKeyPath: string,
    cloudLogDirPath: string,
}