import axios, { AxiosRequestConfig } from 'axios';
import { uploadDto } from '../dto/uploadDto';


export async function sendToServer(data: uploadDto, apiKey: string){
    const axiosConfig: AxiosRequestConfig = {
        method: 'post',
        url: 'https://www.i-proof.com.tw/api/v2/deposit/timestamp-request',
        headers: {
            'apikey': apiKey,
            'Content-Type': 'application/json'
        },
        data: [data],
    }
    const res = await axios(axiosConfig)
    return res.data
}
