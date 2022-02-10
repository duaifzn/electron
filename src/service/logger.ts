import * as winston from 'winston';
import { existsSync, mkdirSync } from 'fs';
const PORTABLE_EXECUTABLE_DIR = process.env.PORTABLE_EXECUTABLE_DIR?process.env.PORTABLE_EXECUTABLE_DIR+'\\':'';
const logPath = `${PORTABLE_EXECUTABLE_DIR}log`
if(!existsSync(logPath)){
  mkdirSync(logPath)
}
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `${logPath}/error.log`, level: 'error' }),
    new winston.transports.File({ filename: `${logPath}/info.log`, level: 'info' }),
  ],
});
