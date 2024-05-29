import { Address, beginCell, Cell, ContractProvider, Dictionary, Sender, SendMode, toNano } from '@ton/core';
import { LockerCollection } from '../wrappers/LockerCollection';
import { compile, NetworkProvider } from '@ton/blueprint';
import { encodeOffChainContent } from './utils/nft';

function transferMessage(jetton_amount: bigint, to: Address,
                         responseAddress: Address,
                         customPayload: Cell | null,
                         forward_ton_amount: bigint,
                         forwardPayload: Cell | null) {
    return beginCell().storeUint(0xf8a7ea5, 32).storeUint(0, 64) // op, queryId
        .storeCoins(jetton_amount).storeAddress(to)
        .storeAddress(responseAddress)
        .storeMaybeRef(customPayload)
        .storeCoins(forward_ton_amount)
        .storeMaybeRef(forwardPayload)
        .endCell();
}

async function sendTransfer(
    provider: NetworkProvider,
    jettonWalletAddress: Address,
    value: bigint,
    jetton_amount: bigint,
    to: Address,
    responseAddress: Address,
    customPayload: Cell | null,
    forward_ton_amount: bigint,
    forwardPayload: Cell) {
    await provider.sender().send({
        to: jettonWalletAddress,
        body: transferMessage(jetton_amount, to, responseAddress, customPayload, forward_ton_amount, forwardPayload),
        value: value
    });
}

export async function run(provider: NetworkProvider) {
    const sender = provider.sender().address!;

    const jettonMasterAddress = Address.parse('kQAGs82fyuPTvolTdKHWfutaoi7NGN71C4TvoHJ0D48Pwrip');
    const jettonWalletCode: Cell = Cell.fromBase64('te6ccgECEgEAAzQAART/APSkE/S88sgLAQIBYgIDAgLMBAUAG6D2BdqJofQB9IH0gahhAgHUBgcCAUgICQDDCDHAJJfBOAB0NMDAXGwlRNfA/AL4PpA+kAx+gAxcdch+gAx+gAwc6m0AALTH4IQD4p+pVIgupUxNFnwCOCCEBeNRRlSILqWMUREA/AJ4DWCEFlfB7y6k1nwCuBfBIQP8vCAAET6RDBwuvLhTYAIBIAoLAgEgEBEB8QD0z/6APpAIfAB7UTQ+gD6QPpA1DBRNqFSKscF8uLBKML/8uLCVDRCcFQgE1QUA8hQBPoCWM8WAc8WzMkiyMsBEvQA9ADLAMkg+QBwdMjLAsoHy//J0AT6QPQEMfoAINdJwgDy4sR3gBjIywVQCM8WcPoCF8trE8yAMA/c7UTQ+gD6QPpA1DAI0z/6AFFRoAX6QPpAU1vHBVRzbXBUIBNUFAPIUAT6AljPFgHPFszJIsjLARL0APQAywDJ+QBwdMjLAsoHy//J0FANxwUcsfLiwwr6AFGooYIImJaAggiYloAStgihggjk4cCgGKEn4w8l1wsBwwAjgDQ4PAK6CEBeNRRnIyx8Zyz9QB/oCIs8WUAbPFiX6AlADzxbJUAXMI5FykXHiUAioE6CCCOThwKoAggiYloCgoBS88uLFBMmAQPsAECPIUAT6AljPFgHPFszJ7VQAcFJ5oBihghBzYtCcyMsfUjDLP1j6AlAHzxZQB88WyXGAEMjLBSTPFlAG+gIVy2oUzMlx+wAQJBAjAA4QSRA4N18EAHbCALCOIYIQ1TJ223CAEMjLBVAIzxZQBPoCFstqEssfEss/yXL7AJM1bCHiA8hQBPoCWM8WAc8WzMntVADbO1E0PoA+kD6QNQwB9M/+gD6QDBRUaFSSccF8uLBJ8L/8uLCggjk4cCqABagFrzy4sOCEHvdl97Iyx8Vyz9QA/oCIs8WAc8WyXGAGMjLBSTPFnD6AstqzMmAQPsAQBPIUAT6AljPFgHPFszJ7VSAAgyAINch7UTQ+gD6QPpA1DAE0x+CEBeNRRlSILqCEHvdl94TuhKx8uLF0z8x+gAwE6BQI8hQBPoCWM8WAc8WzMntVIA==');
    const jettonWalletAddress = Address.parse('kQDfnUbTZVxZBBqhiTfQ2kw7lfabKgSnfr8BIUttS8kFDM_q');

    const lockerCollection = provider.open(LockerCollection.createFromAddress(Address.parse('0QBiv91u0QElBwvab92tEttzaqHHX116jQx__hYGECofOHK_')));

    if (await provider.isContractDeployed(lockerCollection.address)) {
        await sendTransfer(
            provider,
            jettonWalletAddress,
            toNano('0.2'),
            toNano('100'),
            lockerCollection.address,
            sender,
            null,
            toNano('0.1'),
            beginCell()
                .storeAddress(jettonMasterAddress)
                .storeRef(jettonWalletCode)
                .storeUint(Date.now() + 5 * 24 * 60 * 1000, 64)
                .endCell()
        );
    }

}
