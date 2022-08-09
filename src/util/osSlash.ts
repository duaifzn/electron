import * as os from 'os';
export default function osSlash(): `\\`|'/'{
    const osPlatform = os.platform();
    if (osPlatform === 'win32') {
        return `\\`
    }
    else if (osPlatform === 'linux') {
        return '/'
    } else {
        return '/'
    }
}