import { existsSync, readFileSync } from "fs";
import { FileName } from "../dto/fileName";
import { defaultSetting, settingDto } from "../dto/setting";
import { logger } from '../service/logger';
const PORTABLE_EXECUTABLE_DIR = process.env.PORTABLE_EXECUTABLE_DIR ? process.env.PORTABLE_EXECUTABLE_DIR + '\\' : '';

export function getSetting(): settingDto{
    if (!existsSync(`${PORTABLE_EXECUTABLE_DIR}${FileName.settingJson}`)) {
        logger.info(`setting file not exist.`);
        return defaultSetting
    }
    return JSON.parse(readFileSync(`${PORTABLE_EXECUTABLE_DIR}${FileName.settingJson}`, "utf-8"));
}