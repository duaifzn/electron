import * as pki from './service/pki';
import { readFileSync, appendFileSync, readdirSync } from "fs";
import { unProofDto } from './dto/unProofDto';
import { ipcRenderer } from 'electron';
import { IpcChannel } from './dto/ipcDto';
import { FilenameExtension } from './dto/filenameExtension'
import { logger } from './service/logger'
import { performance } from 'perf_hooks';
import * as os from 'os';

document.getElementById('encode').addEventListener('click', () =>{
    try{
        if(!inputValidate()){
            return
        }
        const privateKeyPath = (document.getElementById('privateKey') as HTMLInputElement).files[0].path
        let uploadFilePath = (document.getElementById('uploadFile') as HTMLInputElement).files[0].path
        const unProofDirPath = (document.getElementById('unProofDir') as HTMLInputElement).value
        const uploadFileName = getFileNameWithOS(uploadFilePath)
        if(!duplicateFileValidate(unProofDirPath, uploadFileName)){
            return
        }
        const privateKey = readFileSync(`${privateKeyPath}`, 'utf8');
        const uploadFile = readFileSync(`${uploadFilePath}`);
        //---------------------------------
        const startTime = performance.now()
        const sign = pki.sign(privateKey, uploadFile).toString('hex');
        const endTime = performance.now()
        logger.info(`Encode ${uploadFileName} spend ${endTime - startTime} milliseconds.`)
        //---------------------------------
        appendFileSync(`${unProofDirPath}/${uploadFileName}${FilenameExtension.unProof}`, JSON.stringify({sign: `${sign}`} as unProofDto))
        reset()
    }catch(err){
        logger.error(`${err}`)
        alert(`${err}`)
    }
})

document.getElementById('unProofDirBtn').addEventListener('click', () =>{
    ipcRenderer.on(IpcChannel.selectDir, (event, arg) =>{
        (document.getElementById('unProofDir') as HTMLInputElement).value = arg
    })
    ipcRenderer.send(IpcChannel.selectDir)
})

// document.getElementById('proofedDirBtn').addEventListener('click', () =>{
//     ipcRenderer.on(IpcChannel.selectDir, (event, arg) =>{
//         (document.getElementById('proofedDir') as HTMLInputElement).value = arg
//     })
//     ipcRenderer.send(IpcChannel.selectDir)
// })

function inputValidate(): Boolean{
    if(!(document.getElementById('privateKey') as HTMLInputElement).files[0]){
        alert('缺少私鑰!!')
        return false
    }
    if(!(document.getElementById('uploadFile') as HTMLInputElement).files[0]){
        alert('缺少上傳檔案!!')
        return false
    }
    if(!(document.getElementById('unProofDir') as HTMLInputElement).value){
        alert('請輸入未存證資料夾!!')
        return false
    }
    // if(!(document.getElementById('proofedDir') as HTMLInputElement).value){
    //     alert('請輸入存證資料夾!!')
    //     return false
    // }
    return true
}

function duplicateFileValidate(dir: string, fileName: string){
    const files = readdirSync(dir)
    if(files.includes(`${fileName}${FilenameExtension.unProof}`)){
        alert('上傳檔案名稱重複!!')
        return false
    }
    return true
}

function reset(){
    (document.getElementById('uploadFile') as HTMLInputElement).value = null;
}

function getFileNameWithOS(path: string){
    const osPlatform = os.platform();
    if(osPlatform === 'win32'){
        return path.split(`\\`).pop();
    }
    else if(osPlatform === 'linux'){
        return path.split(`/`).pop();
    }else{
        return path.split(`/`).pop();
    }
}