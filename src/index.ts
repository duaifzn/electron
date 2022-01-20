import * as pki from './service/pki';
import { readFileSync, appendFileSync} from "fs";
import { unProofDto } from './dto/unProofDto';
import { ipcRenderer } from 'electron';
import { IpcChannel } from './dto/ipcDto';

document.getElementById('encode').addEventListener('click', () =>{
    const privateKeyPath = (document.getElementById('privateKey') as HTMLInputElement).files[0].path
    let uploadFilePath = (document.getElementById('uploadFile') as HTMLInputElement).files[0].path
    const unProofDirPath = (document.getElementById('unProofDir') as HTMLInputElement).files[0].path

    const privateKey = readFileSync(`${privateKeyPath}`, 'utf8');
    const uploadFile = readFileSync(`${uploadFilePath}`);
    const uploadFileName = uploadFilePath.split('/').pop();

    const sign = pki.sign(privateKey, uploadFile).toString('hex');
    appendFileSync(`${unProofDirPath}/${uploadFileName}.sign.json`, JSON.stringify({sign: `${sign}`} as unProofDto))

})

document.getElementById('unProofDirBtn').addEventListener('click', () =>{
    ipcRenderer.on(IpcChannel.selectDir, (event, arg) =>{
        console.log(arg)
    })
    ipcRenderer.send(IpcChannel.selectDir)
})


