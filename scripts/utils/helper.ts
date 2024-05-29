import {beginCell, Builder, DictionaryValue, Slice} from "@ton/core";

export const routersDictionaryValue: DictionaryValue<bigint> = {
    serialize: (src: bigint, builder: Builder) => {
        builder.storeRef(beginCell().storeUint(src, 64).endCell());
    },
    parse: function (src: Slice): bigint {
        return src.loadRef().beginParse().loadUintBig(64);
    },
}

export const balancesDictionaryValue: DictionaryValue<bigint> = {
    serialize: (src: bigint, builder: Builder) => {
        builder.storeCoins(src).endCell();
    },
    parse: function (src: Slice): bigint {
        return src.loadCoins()
    },
}

export const bufferToBigUint256 = (buffer: Buffer): bigint => {
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