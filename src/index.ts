import * as pki from './service/pki';
import { readFileSync, unlinkSync, renameSync, writeFileSync } from "fs";
import { ipcRenderer } from 'electron';
import { IpcChannel, selectDirDto } from './dto/ipcDto';
import { settingDto } from './dto/setting';
import { logger } from './service/logger'
import { performance } from 'perf_hooks';
import * as os from 'os';
import Swal from 'sweetalert2';
import { sendToServer } from './util/request';
import { getSetting } from './util/getSetting';
import osSlash from "./util/osSlash";
import { FileName } from './dto/fileName';
import { listComponent } from './components';
const PORTABLE_EXECUTABLE_DIR = process.env.PORTABLE_EXECUTABLE_DIR ? process.env.PORTABLE_EXECUTABLE_DIR + '\\' : '';

onload()
function onload(){
    let setting = getSetting();
    setting.autoSignPath.forEach(path =>{
        let lists = document.getElementById('autoSignPathList') as HTMLElement
        let list = listComponent(path);
        lists.appendChild(list);
    });
}

document.getElementById('send').addEventListener('click', async () => {
    try {
        if (!inputValidate()) {
            return
        }
        let setting = getSetting();
        let slash = osSlash();
        const privateKeyPath = (document.getElementById('privateKey') as HTMLInputElement).files[0].path
        let uploadFilePath = (document.getElementById('uploadFile') as HTMLInputElement).files[0].path
        let apiKey = (document.getElementById('apiKey') as HTMLInputElement).value.trim()
        let tags = (document.getElementById('fileTag') as HTMLInputElement).value.split(",")
        const uploadFileName = getFileNameWithOS(uploadFilePath)
        let fileName = uploadFileName.split('.')[0];
        let filenameExtension = uploadFileName.split('.')[1] ? `.${uploadFileName.split('.')[1]}` : "";
        const autoSignPath =  (document.getElementById('autoSignPath') as HTMLInputElement).value.trim()
        const privateKey = readFileSync(`${privateKeyPath}`, 'utf8');
        const uploadFile = readFileSync(`${uploadFilePath}`);
        //---------------------------------
        const startTime = performance.now()
        const sign = pki.sign(privateKey, uploadFile).toString('hex');
        const endTime = performance.now()
        logger.info(`Encode ${uploadFileName}, tags ${tags}, sign ${sign}, spend ${endTime - startTime} milliseconds.`);
        //---------------------------------
        let data = await sendToServer({
            signature: sign,
            tags: tags
        }, apiKey)
        if(data.error){
            throw data.error
        }
        logger.info(`Encode ${uploadFileName}, tags ${tags}, sign ID:${data.data[0]}`);
        if (setting.deleteAfterSigned) {
            unlinkSync(`${getFilePathWithOS(uploadFilePath)}${slash}${uploadFileName}`)
        }
        else{
            renameSync(
                `${getFilePathWithOS(uploadFilePath)}${slash}${uploadFileName}`,
                `${getFilePathWithOS(uploadFilePath)}${slash}${fileName}${FileName.signed}${filenameExtension}`);
        }
        
        reset()
        sweetAlertSuccess(`檔案簽章成功!!\n存證ID: ${data.data[0]}`)
        const writeSettingData: settingDto = {
            ...setting,
            privateKeyPath: privateKeyPath,
            apiKey: apiKey,
        }
        ipcRenderer.send(IpcChannel.writeSetting, writeSettingData)
    } catch (err) {
        logger.error(`${err}`)
        sweetAlertError(`${err}`)
    }
})

document.getElementById('autoSignBtn').addEventListener('click', () =>{
    ipcRenderer.on(IpcChannel.selectDir, (event, arg) =>{
        let res = arg as selectDirDto
        if(arg.selectPath){
            document.getElementById('setting-autoSignPath').firstElementChild.classList.add('tick');
            (document.getElementById(res.sender) as HTMLInputElement).value = res.selectPath
        }
        else if(!(document.getElementById(res.sender) as HTMLInputElement).value){
            document.getElementById('setting-autoSignPath').firstElementChild.classList.remove('tick')
        }
    })
    ipcRenderer.send(IpcChannel.selectDir, 'autoSignPath')
})

document.getElementById('AddAutoSignBtn').addEventListener('click', ()=>{
    let setting = getSetting();
    let value = (document.getElementById('autoSignPath') as HTMLInputElement).value.trim();
    if(!value){
        return
    }
    let lists = document.getElementById('autoSignPathList') as HTMLElement
    let list = listComponent(value);
    lists.appendChild(list);
    setting.autoSignPath.push(value);
    writeFileSync(`${PORTABLE_EXECUTABLE_DIR}${FileName.settingJson}`, JSON.stringify(setting));
    (document.getElementById('autoSignPath') as HTMLInputElement).value = null;
})

document.getElementById('privateKey').addEventListener('change', () => {
    if ((document.getElementById('privateKey') as HTMLInputElement).value) {
        document.getElementById('setting-privatekey').firstElementChild.classList.add('tick')
    }
    else {
        document.getElementById('setting-privatekey').firstElementChild.classList.remove('tick')
    }
})

document.getElementById('apiKey').addEventListener('input', () => {
    if ((document.getElementById('apiKey') as HTMLInputElement).value) {
        document.getElementById('setting-apikey').firstElementChild.classList.add('tick')
    }
    else {
        document.getElementById('setting-apikey').firstElementChild.classList.remove('tick')
    }
})


function inputValidate(): Boolean {
    if (!(document.getElementById('privateKey') as HTMLInputElement).files[0]) {
        sweetAlertError('缺少私鑰!!')
        return false
    }
    if (!(document.getElementById('uploadFile') as HTMLInputElement).files[0]) {
        sweetAlertError('缺少上傳檔案!!')
        return false
    }
    return true
}

function reset() {
    (document.getElementById('uploadFile') as HTMLInputElement).value = null;
    (document.getElementById('fileTag') as HTMLInputElement).value = null;
}

function getFileNameWithOS(path: string) {
    const osPlatform = os.platform();
    if (osPlatform === 'win32') {
        return path.split(`\\`).pop();
    }
    else if (osPlatform === 'linux') {
        return path.split(`/`).pop();
    } else {
        return path.split(`/`).pop();
    }
}

function getFilePathWithOS(path: string) {
    const slash = osSlash();
    let pathTemp = path.split(slash);
    pathTemp.pop();
    return pathTemp.join(slash)
}

function sweetAlertError(msg: string) {
    Swal.fire({
        title: '錯誤',
        text: msg,
        icon: 'error',
        confirmButtonText: '確定',
        confirmButtonColor: '#0d6efd',
    })
}

function sweetAlertSuccess(msg: string) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 8000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })

    Toast.fire({
        icon: 'success',
        title: msg,
        width: 600,
    })
}