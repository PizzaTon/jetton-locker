import {Address, beginCell, Builder, Cell, toNano} from "@ton/core";
import {OperationCodes} from "./op-codes";
import {Maybe} from "@ton/ton/dist/utils/maybe";

export const Queries = {
    codeUpgrade: (params: {newCode: Cell, newData?: Maybe<Cell | Builder>}) => {
        return beginCell()
            .storeUint(OperationCodes.internal.upgradeContract, 32)
            .storeUint(0, 64)
            .storeRef(params.newCode)
            .storeMaybeRef(params.newData)
            .endCell()
    },
    mint: (params: { queryId?: number, itemOwnerAddress: Address, activeUntil?: bigint, passAmount: bigint, campaignId: bigint }) => {
        return beginCell()
            .storeUint(OperationCodes.internal.campaign.mint, 32)
            .storeUint(params.queryId || 0, 64)
            .storeRef(
                beginCell()
                    .storeAddress(params.itemOwnerAddress)
                    .storeUint(params.campaignId, 64)
                    .storeUint(params.activeUntil ?? 0, 64)
                    .storeCoins(params.passAmount)
                    .endCell()
            )
            .storeCoins(toNano('0.05')) // Pass Amount
            .endCell();
    },
    updateOwner: (params: { queryId?: number, newOwner: Address }) => {
        return beginCell()
            .storeUint(OperationCodes.internal.updateOwner, 32)
            .storeUint(params.queryId || 0, 64)
            .storeAddress(params.newOwner)
            .endCell();
    },
    updateSecondOwner: (params: { queryId?: number, newOwner: Address }) => {
        return beginCell()
            .storeUint(OperationCodes.internal.updateSecondOwner, 32)
            .storeUint(params.queryId || 0, 64)
            .storeAddress(params.newOwner)
            .endCell();
    },
    updateStatus: (params: { queryId?: number, isActive: boolean }) => {
        return beginCell()
            .storeUint(OperationCodes.internal.updateStatus, 32)
            .storeUint(params.queryId || 0, 64)
            .storeBit(params.isActive)
            .endCell();
    },
    getRoyaltyParams: (params: { queryId?: number }) => {
        return beginCell()
            .storeUint(OperationCodes.internal.campaign.getRoyaltyParams, 32)
            .storeUint(params.queryId || 0, 64)
            .endCell();
    },
    withdrawBalance: (params: { queryId?: number, to: Address }) => {
        return beginCell()
            .storeUint(OperationCodes.internal.withdrawBalance, 32)
            .storeUint(params.queryId || 0, 64)
            .storeAddress(params.to)
            .endCell();
    },
}