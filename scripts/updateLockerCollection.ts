import { Address, beginCell, Cell, Dictionary, toNano } from '@ton/core';
import { LockerCollection, lockerCollectionConfigToCell } from '../wrappers/LockerCollection';
import { compile, NetworkProvider } from '@ton/blueprint';
import { encodeOffChainContent } from './utils/nft';



export async function run(provider: NetworkProvider) {
    const sender = provider.sender().address!;
    const lockerCode = await compile('LockerCollection');
    const nftItemCode = await compile('LockBill');

    const lockerCollection = provider.open(LockerCollection.createFromAddress(Address.parse('0QBiv91u0QElBwvab92tEttzaqHHX116jQx__hYGECofOHK_')));

    await lockerCollection.sendCodeUpgrade(provider.sender(), {
        newCode: lockerCode,
        newData: lockerCollectionConfigToCell({
            nextItemIndex: 0n,
            collectionContent: 'https://api.pizzaton.me/v1/locker/collectionmeta',
            commonContent: 'https://api.pizzaton.me/v1/locker/meta/',
            nftItemCode: nftItemCode,
            owner: sender,
            royalty: {
                address: provider.sender().address!,
                factor: 80n,
                base: 100n,
            },
            secondOwner: sender,
        })
    })
}
