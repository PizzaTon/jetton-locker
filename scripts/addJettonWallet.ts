import { Address, beginCell, Cell, Dictionary, internal, toNano } from '@ton/core';
import { LockerCollection, lockerCollectionConfigToCell } from '../wrappers/LockerCollection';
import { compile, NetworkProvider } from '@ton/blueprint';
import { encodeOffChainContent } from './utils/nft';



export async function run(provider: NetworkProvider) {
    const sender = provider.sender().address!;
    const lockerCode = await compile('LockerCollection');
    const nftItemCode = await compile('LockBill');

    const lockerCollection = provider.open(LockerCollection.createFromAddress(Address.parse('EQDVWnrDtDO9Td-K8qEgHwSo82HneZF_oAPkKaMawRhAILKR')));

    await lockerCollection.sendAddJettonWallet(provider.sender(), {
        jWalletAddress: Address.parse('0:0821e9e1f6303b48dd5ed6846196be528912ea11c483d3846f90b3d3e4c98068'),
        jMasterAddress: Address.parse('kQAGs82fyuPTvolTdKHWfutaoi7NGN71C4TvoHJ0D48Pwrip')
    })
}
