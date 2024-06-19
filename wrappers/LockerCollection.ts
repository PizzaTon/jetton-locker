import {
    Address,
    beginCell, Builder,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Dictionary,
    Sender,
    SendMode, toNano
} from '@ton/core';
import { encodeOffChainContent } from '../scripts/utils/nft';
import { Queries } from '../scripts/utils/queries';
import { Maybe } from '@ton/ton/dist/utils/maybe';
import { OperationCodes } from '../scripts/utils/op-codes';
import { JettonWallet } from '@ton/ton';
import { jettonsDictionaryValue } from '../scripts/utils/helper';
import { randomAddress } from '@ton/test-utils';

export type RoyaltyParams = {
    factor: bigint;
    base: bigint;
    address: Address;
}

export type CollectionData = {
    nextItemIndex: bigint;
    content: Cell;
    owner: Address;
};

export type LockerCollectionConfig = {
    owner: Address;
    nextItemIndex: bigint;
    collectionContent: string;
    commonContent: string;
    nftItemCode: Cell;
    royalty: RoyaltyParams;
    jWallets?: Dictionary<bigint, Address> // jetton_wallet => jetton_master
};

export function lockerCollectionConfigToCell(config: LockerCollectionConfig): Cell {
    let collectionContent = encodeOffChainContent(config.collectionContent);
    let commonContent = beginCell().storeBuffer(Buffer.from(config.commonContent)).endCell();
    let contentCell = beginCell().storeRef(collectionContent).storeRef(commonContent).endCell();

    let royaltyCell = beginCell()
        .storeUint(config.royalty.factor, 16)
        .storeUint(config.royalty.base, 16)
        .storeAddress(config.royalty.address)
        .endCell();

    return beginCell()
        .storeAddress(config.owner)
        .storeUint(config.nextItemIndex, 64)
        .storeRef(contentCell)
        .storeRef(config.nftItemCode)
        .storeRef(royaltyCell)
        .storeDict(config.jWallets ?? Dictionary.empty(Dictionary.Keys.BigUint(256), jettonsDictionaryValue))
        .endCell()
}


export class LockerCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new LockerCollection(address);
    }

    static createFromConfig(config: LockerCollectionConfig, code: Cell, workchain = 0) {
        const data = lockerCollectionConfigToCell(config);
        const init = { code, data };
        return new LockerCollection(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendDeployNewNft(provider: ContractProvider, via: Sender, value: bigint, params: { queryId?: number, passAmount: bigint, itemOwnerAddress: Address, campaignId: bigint }) {
        let msgBody = Queries.mint(params);

        await provider.internal(via, {
            value: value,
            body: msgBody
        })
    }

    async sendChangeOwner(provider: ContractProvider, via: Sender, newOwner: Address) {
        let msgBody = Queries.updateOwner({ newOwner });

        return await provider.internal(via,
            {
                value: toNano(1),
                bounce: false,
                body: msgBody,
            }
        );
    }

    async sendChangeSecondOwner(provider: ContractProvider, via: Sender, newOwner: Address) {
        let msgBody = Queries.updateSecondOwner({ newOwner });

        return await provider.internal(via,
            {
                value: toNano('0.02'),
                bounce: false,
                body: msgBody,
            }
        );
    }

    async sendCodeUpgrade(provider: ContractProvider, via: Sender, params: {newCode: Cell, newData?: Maybe<Cell | Builder>}) {
        let msgBody = Queries.codeUpgrade(params);

        return await provider.internal(via,
            {
                value: toNano('0.01'),
                body: msgBody,
            }
        );
    }

    async sendAddJettonWallet(provider: ContractProvider, via: Sender, params: {
        jWalletAddress: Address,
        jMasterAddress: Address
    }) {
        return await provider.internal(via,
            {
                value: toNano('0.01'),
                body: beginCell()
                    .storeUint(0xC, 32)
                    .storeUint(0, 64)
                    .storeAddress(params.jWalletAddress)
                    .storeAddress(params.jMasterAddress)
                    .endCell(),
            }
        );
    }

    async sendOtherCodeUpgrade(provider: ContractProvider, via: Sender, itemAddress: Address, params: {newCode: Cell, newData?: Maybe<Cell | Builder>}) {
        let msgBody = Queries.codeUpgrade(params);

        return await provider.internal(via,
            {
                value: toNano('0.1'),
                body: beginCell()
                .storeUint(OperationCodes.internal.otherCodeUpgrade, 32)
                .storeUint(0, 64)
                .storeAddress(itemAddress)
                .storeRef(params.newCode)
                .storeMaybeRef(params.newData)
                .endCell(),
            }
        );
    }

    async sendGetRoyaltyParams(provider: ContractProvider, via: Sender) {
        let msgBody = Queries.getRoyaltyParams({})

        return await provider.internal(via, {
            value: toNano(1),
            bounce: false,
            body: msgBody,
        });
    }

    async sendWithdrawBalance(provider: ContractProvider, via: Sender) {
        return await provider.internal(via, {
            value: toNano(0.01),
            body: beginCell()
                .storeUint(0xF,32)
                .storeUint(0, 64)
                .storeCoins(toNano(0.1))
                // .storeAddress(randomAddress()) optional
                .endCell(),
        });
    }

    async getWallets(provider: ContractProvider) {
        const res = await provider.get('get_wallets', []);
        return Dictionary.loadDirect(Dictionary.Keys.BigUint(256), jettonsDictionaryValue, res.stack.readCellOpt());
    }
}
