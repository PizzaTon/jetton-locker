import { Blockchain, printTransactionFees, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, beginCell, Cell, comment, fromNano, toNano } from '@ton/core';
import { LockerCollection } from '../wrappers/LockerCollection';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { JettonMinter } from '../wrappers/JettonMinter';
import { encodeOffChainContent } from '../scripts/utils/nft';
import { bufferToBigUint256 } from '../scripts/utils/helper';
import { flattenTransaction, randomAddress } from '@ton/test-utils';
import { JettonWallet } from '../wrappers/JettonWallet';
import { OperationCodes } from '../scripts/utils/op-codes';
import { LockBill } from '../wrappers/LockBill';

describe('LockerCollection', () => {
    let code: Cell;
    let nftItemCode: Cell;
    let jettonWalletCode: Cell;
    let jettonMinterCode: Cell;

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let royalty: SandboxContract<TreasuryContract>;
    let lockerCollectionOwner: SandboxContract<TreasuryContract>;
    let someUser: SandboxContract<TreasuryContract>;
    let lockerCollection: SandboxContract<LockerCollection>;
    let jettonMinter: SandboxContract<JettonMinter>;

    const userWallet = async (minter: SandboxContract<JettonMinter>, address: Address) => blockchain.openContract(
        JettonWallet.createFromAddress(
            await minter.getWalletAddress(address)
        )
    );

    beforeAll(async () => {
        code = await compile('LockerCollection');
        nftItemCode = await compile('LockBill');

        jettonWalletCode = Cell.fromBase64('te6ccgECEgEAAzQAART/APSkE/S88sgLAQIBYgIDAgLMBAUAG6D2BdqJofQB9IH0gahhAgHUBgcCAUgICQDDCDHAJJfBOAB0NMDAXGwlRNfA/AL4PpA+kAx+gAxcdch+gAx+gAwc6m0AALTH4IQD4p+pVIgupUxNFnwCOCCEBeNRRlSILqWMUREA/AJ4DWCEFlfB7y6k1nwCuBfBIQP8vCAAET6RDBwuvLhTYAIBIAoLAgEgEBEB8QD0z/6APpAIfAB7UTQ+gD6QPpA1DBRNqFSKscF8uLBKML/8uLCVDRCcFQgE1QUA8hQBPoCWM8WAc8WzMkiyMsBEvQA9ADLAMkg+QBwdMjLAsoHy//J0AT6QPQEMfoAINdJwgDy4sR3gBjIywVQCM8WcPoCF8trE8yAMA/c7UTQ+gD6QPpA1DAI0z/6AFFRoAX6QPpAU1vHBVRzbXBUIBNUFAPIUAT6AljPFgHPFszJIsjLARL0APQAywDJ+QBwdMjLAsoHy//J0FANxwUcsfLiwwr6AFGooYIImJaAggiYloAStgihggjk4cCgGKEn4w8l1wsBwwAjgDQ4PAK6CEBeNRRnIyx8Zyz9QB/oCIs8WUAbPFiX6AlADzxbJUAXMI5FykXHiUAioE6CCCOThwKoAggiYloCgoBS88uLFBMmAQPsAECPIUAT6AljPFgHPFszJ7VQAcFJ5oBihghBzYtCcyMsfUjDLP1j6AlAHzxZQB88WyXGAEMjLBSTPFlAG+gIVy2oUzMlx+wAQJBAjAA4QSRA4N18EAHbCALCOIYIQ1TJ223CAEMjLBVAIzxZQBPoCFstqEssfEss/yXL7AJM1bCHiA8hQBPoCWM8WAc8WzMntVADbO1E0PoA+kD6QNQwB9M/+gD6QDBRUaFSSccF8uLBJ8L/8uLCggjk4cCqABagFrzy4sOCEHvdl97Iyx8Vyz9QA/oCIs8WAc8WyXGAGMjLBSTPFnD6AstqzMmAQPsAQBPIUAT6AljPFgHPFszJ7VSAAgyAINch7UTQ+gD6QPpA1DAE0x+CEBeNRRlSILqCEHvdl94TuhKx8uLF0z8x+gAwE6BQI8hQBPoCWM8WAc8WzMntVIA==');
        jettonMinterCode = Cell.fromBase64('te6ccgECDgEAAqMAART/APSkE/S88sgLAQIBYgIDAgLMBAUCA3pgDA0B9dkGOASS+B8ADoaYGAuNhJL4HwfSB9IBj9ABi465D9ABj9ABg51NoAAWmP6Z/2omh9AH0gamoYQAqpOF1HGZqamxsommOC+XAkgX0gfQBqGBBoQDBrkP0AGBKIGigheASKUCgZ5CgCfQEsZ4tmZmT2qnBBCD3uy+8pOF1AYAk7PwUIgG4KhAJqgoB5CgCfQEsZ4sA54tmZJFkZYCJegB6AGWAZJB8gDg6ZGWBZQPl/+ToO8AMZGWCrGeLKAJ9AQnltYlmZmS4/YBBPSO4DY3NwH6APpA+ChUEgZwVCATVBQDyFAE+gJYzxYBzxbMySLIywES9AD0AMsAyfkAcHTIywLKB8v/ydBQBscF8uBKoQNFRchQBPoCWM8WzMzJ7VQB+kAwINcLAcMAkVvjDeCCECx2uXNScLrjAjU3NyPAA+MCNQLABAcICQoAPoIQ1TJ223CAEMjLBVADzxYi+gISy2rLH8s/yYBC+wAB/jZfA4IImJaAFaAVvPLgSwL6QNMAMJXIIc8WyZFt4oIQ0XNUAHCAGMjLBVAFzxYk+gIUy2oTyx8Uyz8j+kQwcLqOM/goRANwVCATVBQDyFAE+gJYzxYBzxbMySLIywES9AD0AMsAyfkAcHTIywLKB8v/ydDPFpZsInABywHi9AALADQzUDXHBfLgSQP6QDBZyFAE+gJYzxbMzMntVABCjhhRJMcF8uBJ1DBDAMhQBPoCWM8WzMzJ7VTgXwWED/LwAArJgED7AAB9rbz2omh9AH0gamoYNhj8FAC4KhAJqgoB5CgCfQEsZ4sA54tmZJFkZYCJegB6AGWAZPyAODpkZYFlA+X/5OhAAB+vFvaiaH0AfSBqahg/qpBA');
    });

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');
        royalty = await blockchain.treasury('royalty');
        lockerCollectionOwner = await blockchain.treasury('lockerCollectionOwner');
        someUser = await blockchain.treasury('someUser');

        jettonMinter = blockchain.openContract(JettonMinter.createFromConfig({
            admin: deployer.address,
            content: encodeOffChainContent('https://pizzaton.me/jetton/jetton-meta.json'),
            wallet_code: jettonWalletCode
        }, jettonMinterCode, 0));
        await jettonMinter.sendDeploy(deployer.getSender(), toNano('0.1'));

        // Give all addresses some jetton
        await jettonMinter.sendMint(deployer.getSender(), deployer.address, toNano('10000000'), toNano('0.1'), toNano('1'));
        await jettonMinter.sendMint(deployer.getSender(), royalty.address, toNano('10000000'), toNano('0.1'), toNano('1'));
        await jettonMinter.sendMint(deployer.getSender(), lockerCollectionOwner.address, toNano('10000000'), toNano('0.1'), toNano('1'));
        await jettonMinter.sendMint(deployer.getSender(), someUser.address, toNano('10000000'), toNano('0.1'), toNano('1'));

        lockerCollection = blockchain.openContract(LockerCollection.createFromConfig({
            nextItemIndex: 0n,
            collectionContent: 'https://api.pizzaton.me/v1/locker/collectionmeta',
            commonContent: 'https://api.pizzaton.me/v1/locker/meta/',
            nftItemCode: nftItemCode,
            owner: lockerCollectionOwner.address,
            royalty: {
                address: royalty.address,
                factor: 80n,
                base: 100n
            }
        }, code));

        const deployResult = await lockerCollection.sendDeploy(
            deployer.getSender(), toNano('1')
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: lockerCollection.address,
            deploy: true,
            success: true
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and lockerCollection are ready to use
    });

    it('balance withdraw', async () => {
        const res = await lockerCollection.sendWithdrawBalance(lockerCollectionOwner.getSender());
        printTransactionFees(res.transactions);
        console.log(fromNano((await blockchain.getContract(lockerCollection.address)).balance));
    });

    // it('Add support for a jetton wallet', async () => {
    //     blockchain.now = Math.floor(Date.now() / 1000);
    //
    //     const collectionJWallet = await jettonMinter.getWalletAddress(lockerCollection.address);
    //     await lockerCollection.sendAddJettonWallet(lockerCollectionOwner.getSender(), {
    //         jWalletAddress: collectionJWallet,
    //         jMasterAddress: jettonMinter.address
    //     });
    //
    //     const jettonWallets = await lockerCollection.getWallets();
    //     expect(jettonWallets.has(bufferToBigUint256(collectionJWallet))).toBe(true);
    //
    //     // Send jettons for lock (LOCK 10)
    //     const someUserJWallet = (await userWallet(jettonMinter, someUser.address));
    //     const res = await someUserJWallet.sendTransfer(
    //         someUser.getSender(),
    //         toNano('0.2'),
    //         toNano('10'),
    //         lockerCollection.address,
    //         someUser.address,
    //         null,
    //         toNano('0.1'),
    //         beginCell()
    //             .storeUint((Math.floor(Date.now() / 1000)) + 86400, 32)
    //             .endCell()
    //     );
    //     expect(res.transactions).toHaveTransaction({
    //         op: OperationCodes.internal.jetton.transfer,
    //         exitCode: 0
    //     });
    //     expect(res.transactions).toHaveTransaction({
    //         op: OperationCodes.internal.jetton.notification,
    //         exitCode: 0,
    //         to: lockerCollection.address
    //     });
    //     expect(res.transactions).toHaveTransaction({
    //         op: OperationCodes.internal.jetton.notification,
    //         exitCode: 0,
    //         to: lockerCollection.address
    //     });
    //
    //     // Locked 10 Jettons for 1 day
    //     expect(await (await userWallet(jettonMinter, lockerCollection.address)).getJettonBalance()).toEqual(toNano('10'));
    //
    //     const lockBill = res.transactions.map(flattenTransaction).filter((e) => e.value == toNano('0.05')).at(0)!.to!;
    //
    //     expect((await blockchain.getContract(lockBill)).accountState?.type).toBe('active');
    //
    //     const lockBillContract = blockchain.openContract(LockBill.createFromAddress(lockBill));
    //     const result = await lockBillContract.sendUnlock(someUser.getSender(), toNano('0.1'));
    //     printTransactionFees(result.transactions);
    //     expect(result.transactions).toHaveTransaction({
    //         from: someUser.address,
    //         to: lockBill,
    //         exitCode: 402, // Means asset is already locked and cannot be unlocked at the moment
    //     });
    //
    //     // We come back another day
    //     blockchain.now = blockchain.now + (2 * 86400);
    //     const anotherDay = await lockBillContract.sendUnlock(someUser.getSender(), toNano('0.02'));
    //     printTransactionFees(anotherDay.transactions);
    //     expect(await (await userWallet(jettonMinter, lockerCollection.address)).getJettonBalance()).toEqual(toNano('0'));
    //     expect(await someUserJWallet.getJettonBalance()).toEqual(toNano('10000000'));
    // });
});
