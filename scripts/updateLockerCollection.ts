import { Address, beginCell, Cell, Dictionary, toNano } from '@ton/core';
import { LockerCollection, lockerCollectionConfigToCell } from '../wrappers/LockerCollection';
import { compile, NetworkProvider } from '@ton/blueprint';
import { encodeOffChainContent } from './utils/nft';
import { bufferToBigUint256, jettonsDictionaryValue } from './utils/helper';



export async function run(provider: NetworkProvider) {
    const sender = provider.sender().address!;
    const lockerCode = await compile('LockerCollection');
    const nftItemCode = await compile('LockBill');

    const lockerCollection = provider.open(LockerCollection.createFromAddress(Address.parse('EQD6GjdqIiW9WsuDixqd-3mAOxvNl8EZA7nnOKiIyzQgamUQ')));
    // const lockerCollection = provider.open(LockerCollection.createFromAddress(Address.parse('EQDVWnrDtDO9Td-K8qEgHwSo82HneZF_oAPkKaMawRhAILKR')));

    const jWallets = Dictionary.empty(Dictionary.Keys.BigUint(256), jettonsDictionaryValue);
    jWallets.set(bufferToBigUint256(Address.parse('0:8e1df367a7a7251a3854419955a46755a6c7fb1cae992e79246ba6c0c8b8ea53')), Address.parse('EQAgotSkX06MIW-A0ni5yKqeNlwc3nASnbO1dwGo-kwpg2Zg'));

    await lockerCollection.sendCodeUpgrade(provider.sender(), {
        newCode: lockerCode,
        newData: lockerCollectionConfigToCell({
            nextItemIndex: 0n,
            collectionContent: 'https://api.pizzaton.me/v1/locker/collectionmeta',
            commonContent: 'https://api.pizzaton.me/v1/locker/meta/',
            nftItemCode: nftItemCode,
            owner: sender,
            jWallets: jWallets,
            royalty: {
                address: provider.sender().address!,
                factor: 1n,
                base: 1n,
            },
            secondOwner: sender,
        })
    })
}
