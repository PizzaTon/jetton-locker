import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { LockBill } from '../wrappers/LockBill';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('LockBill', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('LockBill');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let lockBill: SandboxContract<LockBill>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        lockBill = blockchain.openContract(LockBill.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await lockBill.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: lockBill.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and lockBill are ready to use
    });
});
