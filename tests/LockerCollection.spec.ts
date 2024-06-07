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
        const individualContent = Cell.fromBoc(Buffer.from('b5ee9c7201010101005100009e312f3835393735373531363036353333323236383637343937353531393334353330373836333935373636323537333835313235363531323335343832333139363638333934353334333536303432', 'hex'))[0]
        console.log(individualContent.toBoc().toString('base64'));
        // lockerCollection = blockchain.openContract(LockerCollection.createFromConfig({}, code));
        //
        // deployer = await blockchain.treasury('deployer');
        //
        // const deployResult = await lockerCollection.sendDeploy(deployer.getSender(), toNano('0.05'));
        //
        // expect(deployResult.transactions).toHaveTransaction({
        //     from: deployer.address,
        //     to: lockerCollection.address,
        //     deploy: true,
        //     success: true,
        // });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and lockerCollection are ready to use
    });
});
