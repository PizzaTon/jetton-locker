import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type LockBillConfig = {};

export function lockBillConfigToCell(config: LockBillConfig): Cell {
    return beginCell().endCell();
}

export class LockBill implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new LockBill(address);
    }

    static createFromConfig(config: LockBillConfig, code: Cell, workchain = 0) {
        const data = lockBillConfigToCell(config);
        const init = { code, data };
        return new LockBill(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
