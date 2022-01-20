import * as types from 'types';
import { splitEvery } from 'ramda';

export type Result <T> = {
    error: string,
    data: T,
};

export type Pem = string;

export namespace Pem {
    const boundary = /^-{3,}(BEGIN|END)[\w\s]+-{3,}$/gm;
    type PemType = 'CERTIFICATE' | 'PUBLIC KEY' | 'RSA PRIVATE KEY';

    export function isa (pem: Pem) {
        const boundaries = pem.match(boundary);
        return boundaries !== null &&
               boundaries.length === 2 &&
               boundaries[0].match(/BEGIN/) &&
               boundaries[1].match(/END/);
    };

    export function toBer (pem: Pem): types.Result<string, Ber> {
        if (isa(pem)) {
            const data = pem.replace(boundary, '');
            return types.Result.ok(Buffer.from(data.split(/\s/).join(''), 'base64'));
        } else {
            return types.Result.fail('pem format error');
        }
    };

    export function fromBuffer (data: Buffer, type: PemType): Pem {
        const head = `-----BEGIN ${type}-----`;
        const tail = `-----END ${type}-----`;
        return [head]
        .concat(splitEvery(64, data.toString('base64')))
        .concat([tail])
        .join('\n');
    };
};

export interface Ber extends Buffer {};

/** without 0x prefix
 */
export type Sha256 = string;

export type Hex = string;

export type Base64 = string;
