import { existsSync, readFileSync, readdirSync, renameSync, unlinkSync } from "fs";
import { FileName } from '../dto/fileName';
import { logger } from '../service/logger';
import { settingDto } from "../dto/setting";
import { sendToServer } from "../util/request";
import * as pki from '../service/pki';
import osSlash from "../util/osSlash";
const PORTABLE_EXECUTABLE_DIR = process.env.PORTABLE_EXECUTABLE_DIR ? process.env.PORTABLE_EXECUTABLE_DIR + '\\' : '';

export default class AutoSign{
    privateKeyPath: string
    autoSignPath: string[]
    apiKey: string
    deleteAfterSigned: boolean
    constructor(){
        this.init()
        this.start()
    }
    init(){
        if (!existsSync(`${PORTABLE_EXECUTABLE_DIR}${FileName.settingJson}`)) {
            throw new Error(`setting file not exist.`)
        }
        let setting: settingDto = JSON.parse(readFileSync(`${PORTABLE_EXECUTABLE_DIR}${FileName.settingJson}`, "utf-8"));
        if (!setting.autoSignPath) {
            throw new Error(`auto sign path is null.`)
        }
        if (!setting.privateKeyPath) {
            throw new Error(`private key is null.`)
        }
        if (!setting.apiKey) {
            throw new Error(`api key is null.`)
        }
        this.privateKeyPath = setting.privateKeyPath;
        this.autoSignPath = setting.autoSignPath;
        this.apiKey = setting.apiKey;
        this.deleteAfterSigned = setting.deleteAfterSigned;
    }
    async start(){
        for await(const path of this.autoSignPath){
            await this.autoSignOnePath(path);
        }
    }
    async autoSignOnePath(path: string){
        let files = readdirSync(path).filter(file => {
            let regex = new RegExp(`^((?!(${FileName.signed})).)*$`)
            return regex.test(file)
        });
        for await (const file of files) {
            try {
                let fileName = file.split('.')[0];
                let filenameExtension = file.split('.')[1] ? `.${file.split('.')[1]}` : "";
                let slash = osSlash();
                let buffer = readFileSync(`${path}${slash}${file}`);
                let privateKey = readFileSync(`${this.privateKeyPath}`, 'utf8');
                let sign = pki.sign(privateKey, buffer).toString('hex');
                let data = await sendToServer({ signature: sign, tags: [`${file}`] }, this.apiKey)
                if (data.error) {
                    throw data.error
                }
                logger.info(`Encode ${path}${slash}${file}, sign ID:${data.data[0]}`);
                if (this.deleteAfterSigned) {
                    unlinkSync(`${path}${slash}${file}`)
                }else{
                    renameSync(
                        `${path}${slash}${file}`,
                        `${path}${slash}${fileName}${FileName.signed}${filenameExtension}`);
                }
            } catch (err) {
                logger.error(`${err}`);
            }
        }
    }
}