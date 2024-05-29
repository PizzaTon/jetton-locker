import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { LockerCollection } from '../wrappers/LockerCollection';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('LockerCollection', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('LockerCollection');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let lockerCollection: SandboxContract<LockerCollection>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        lockerCollection = blockchain.openContract(LockerCollection.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await lockerCollection.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: lockerCollection.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and lockerCollection are ready to use
    });
});
