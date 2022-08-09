import { existsSync, readFileSync, readdirSync, unlinkSync } from "fs";
import { FileName } from '../dto/fileName';
import { logger } from '../service/logger';
import { settingDto } from "../dto/setting";
import { sendToServer } from "../util/request";
import * as pki from '../service/pki';
import osSlash from "../util/osSlash";
const PORTABLE_EXECUTABLE_DIR = process.env.PORTABLE_EXECUTABLE_DIR ? process.env.PORTABLE_EXECUTABLE_DIR + '\\' : '';


export default async function autoSign() {
    if (!existsSync(`${PORTABLE_EXECUTABLE_DIR}${FileName.settingJson}`)) {
        logger.info(`setting file not exist.`);
        return
    }
    let setting: settingDto = JSON.parse(readFileSync(`${PORTABLE_EXECUTABLE_DIR}${FileName.settingJson}`, "utf-8"));
    if (!setting.autoSignPath) {
        logger.info(`auto sign path is null.`);
        return
    }
    if (!setting.privateKeyPath) {
        logger.info(`private key is null.`);
        return
    }
    if (!setting.apiKey) {
        logger.info(`api key is null.`);
        return
    }
    let files = readdirSync(setting.autoSignPath);
    for await (const file of files) {
        try{
            let slash = osSlash();
            let buffer = readFileSync(`${setting.autoSignPath}${slash}${file}`);
            let privateKey = readFileSync(`${setting.privateKeyPath}`, 'utf8');
            let sign = pki.sign(privateKey, buffer).toString('hex');
            let data = await sendToServer({ signature: sign, tags: [] }, setting.apiKey)
            if(data.error){
                throw data.error
            }
            logger.info(`Encode ${setting.autoSignPath}${slash}${file}, sign ID:${data.data[0]}`);
            unlinkSync(`${setting.autoSignPath}${slash}${file}`);
        }catch(err) {
            logger.error(`${err}`);
        }  
    }
}