import { Result } from 'types';
import * as crypto from 'crypto';
import * as asn1 from 'asn1';
import { Pem } from './type';

export function sign(skey: Pem, data: Buffer): Buffer {
    const signObj = crypto.createSign('sha256');
    signObj.update(data);
    signObj.end();
    const skeyObj = crypto.createPrivateKey(skey) as any;
    skeyObj.padding = crypto.constants.RSA_PKCS1_PADDING;
    return signObj.sign(skeyObj);
};

export function verify(pkey: Pem, data: Buffer, signed: Buffer){
    const verifyObj = crypto.createVerify('sha256');
    verifyObj.update(data);
    verifyObj.end();
    const pkeyObj = crypto.createPublicKey(pkey) as any;
    pkeyObj.padding = crypto.constants.RSA_PKCS1_PADDING;
    return verifyObj.verify(pkeyObj, signed);
};

type SignatureInfo = {
    method: string,         // hash algorithm oid (object identifier)
    value: string,
}

/**
 * 取得簽章資訊 (hash method 及 hash value)
 */
export function sigInfo (pkey: Pem, signature: Buffer): Result<string, SignatureInfo> {
    const pk = crypto.createPublicKey(pkey);
    (pk as any).padding = crypto.constants.RSA_PKCS1_PADDING;
    try {
        const data = crypto.publicDecrypt(pk, signature);
        return asn1.Value.fromBER(data)
        .map(value => asn1.Value.simplify(value))
        .chain(value => {
            if (value instanceof Array && value.length === 2 &&
                value[0] instanceof Array && value[0].length > 1 &&
                typeof value[0][0] === 'string' && typeof value[1] === 'string') {
                return Result.ok({
                    method: value[0][0],
                    value: value[1].replace(/^0x/, ''),
                });
            } else {
                return Result.fail('wrong format');
            }
        });
    } catch (e) {
        return Result.fail('wrong public key or signature is not PKCS1 padding');
    }
}
