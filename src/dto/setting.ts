export interface settingDto {
    privateKeyPath: string,
    apiKey: string,
    autoSignPath: string[],
    deleteAfterSigned: boolean,
}

export const defaultSetting: settingDto = {
    privateKeyPath: "",
    apiKey: "",
    autoSignPath: [],
    deleteAfterSigned: false,
}