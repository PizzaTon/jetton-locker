import { Address, beginCell, Cell, Dictionary, toNano } from '@ton/core';
import { LockerCollection } from '../wrappers/LockerCollection';
import { compile, NetworkProvider } from '@ton/blueprint';
import { encodeOffChainContent } from './utils/nft';



export async function run(provider: NetworkProvider) {
    const sender = provider.sender().address!;
    const nftItemCode = await compile('LockBill');

    const lockerCollection = provider.open(LockerCollection.createFromConfig({
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
    }, await compile('LockerCollection')));

    await lockerCollection.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(lockerCollection.address);

    // run methods on `lockerCollection`
}
