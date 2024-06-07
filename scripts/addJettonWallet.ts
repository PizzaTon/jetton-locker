import { Address, beginCell, Cell, Dictionary, toNano } from '@ton/core';
import { LockerCollection, lockerCollectionConfigToCell } from '../wrappers/LockerCollection';
import { compile, NetworkProvider } from '@ton/blueprint';
import { encodeOffChainContent } from './utils/nft';



export async function run(provider: NetworkProvider) {
    const sender = provider.sender().address!;
    const lockerCode = await compile('LockerCollection');
    const nftItemCode = await compile('LockBill');

    const lockerCollection = provider.open(LockerCollection.createFromAddress(Address.parse('kQAVvcLuoeRVtlXIXxes6e8a5HRwuoz0HH4dkN-r66AgrDE_')));

    await lockerCollection.sendAddJettonWallet(provider.sender(), Address.parse('0:628f5bbcc9e4d39b2a5e4799da9554276a5f48bb0d9ce5f2b4ab662f058e4759'))
}
