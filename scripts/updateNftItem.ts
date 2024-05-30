import { Address, beginCell, Cell, Dictionary, toNano } from '@ton/core';
import { LockerCollection, lockerCollectionConfigToCell } from '../wrappers/LockerCollection';
import { compile, NetworkProvider } from '@ton/blueprint';
import { encodeOffChainContent } from './utils/nft';



export async function run(provider: NetworkProvider) {
    const sender = provider.sender().address!;
    const lockerCode = await compile('LockerCollection');
    const nftItemCode = await compile('LockBill');

    const lockerCollection = provider.open(LockerCollection.createFromAddress(Address.parse('kQCvlQ6ISTEOIC84w-PbzDViQWwPsxLM17peh0VAF__xCNrS')));

    await lockerCollection.sendOtherCodeUpgrade(provider.sender(), Address.parse('kQCkoz1SZabb6Gm_kqPA2U0HirFsKBb7j23xaUqCgCG3c0Os'), {
        newCode: nftItemCode,
    })
}
