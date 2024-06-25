import { Wallet, getDefaultProvider, ethers, AbiCoder } from 'ethers';
import Lock from '../artifacts/contracts/LockCreate3.sol/Lock3.json';
import Create3FactoryZeframlou from './Create3FactoryZeframlou.json'
import {NETWORKS,Network} from '../config/networks';

const CREATE_3_DEPLOYER = '0x9fBB3DF7C40Da2e5A0dE984fFE2CCB7C47cd0ABf';

async function main() {
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
        throw new Error('Invalid private key. Make sure the PRIVATE_KEY environment variable is set.');
    }

    const currentTimestampInSeconds = Math.round(Date.now() / 1000); 
    const unlockTime = currentTimestampInSeconds + 60;
    const evmChains = getEvmChains();

    for (const chain of evmChains) {
        const wallet = new Wallet(privateKey);
        const provider = getDefaultProvider(chain.url);
        const connectedWallet = wallet.connect(provider);
        const deployerContract = new ethers.Contract(CREATE_3_DEPLOYER, Create3FactoryZeframlou, connectedWallet);
        const coder = AbiCoder.defaultAbiCoder()

        // salt (make sure this salt has not been used already)
        const salt = ethers.toBeHex(218n, 32);
        const creationCode = ethers.solidityPacked( ['bytes', 'bytes'], [Lock.bytecode, coder.encode(['uint256', 'address'], [unlockTime+chain.chainId, wallet.address])] ); 
        const predictionAddress = await deployerContract.getDeployed(connectedWallet.address, salt);
        const deployedAddress = await deployerContract.deploy(salt, creationCode);
        // const deployedAddress = await deployerContract.deploy.staticCall(salt, creationCode); // for prediction
        console.log(`${chain.chainId}, prediciton address: ${predictionAddress}`);
        console.log(`${chain.chainId}, deploy address: ${deployedAddress}`);
    }
}
function getEvmChains() {
    const chains: Network[] = [];
    chains.push(NETWORKS.sepolia);
    chains.push(NETWORKS['polygon-mainnet']);
    return chains;
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
