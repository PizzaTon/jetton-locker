import { Address, beginCell, Builder, DictionaryValue, Slice } from '@ton/core';

export const jettonsDictionaryValue: DictionaryValue<Address> = {
    serialize: (src: Address, builder: Builder) => {
        builder.storeRef(beginCell().storeUint(bufferToBigUint256(src), 256).endCell());
    },
    parse: function (src: Slice): Address {
        return Address.parseRaw('0:' + zeroFill(src.loadRef().beginParse().loadUintBig(256).toString(16)));
    },
}

export const bufferToBigUint256 = (address: Address): bigint => {
    const buffer = address.hash;

    let result = 0n;
    for (let i = 0; i < buffer.length; i++) {
        const byte = BigInt(buffer[i]);
        // Left shift by 8 bits for each byte position (assuming big-endian)
        result = (result << 8n) + byte;
    }
    return result;
}

export const zeroFill = (str: string, targetLength: number = 64): string => {
    return str.padStart(targetLength, '0');
}