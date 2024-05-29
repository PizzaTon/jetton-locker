import { toNano } from '@ton/core';
import { LockBill } from '../wrappers/LockBill';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const lockBill = provider.open(LockBill.createFromConfig({}, await compile('LockBill')));

    await lockBill.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(lockBill.address);

    // run methods on `lockBill`
}
