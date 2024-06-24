import { Wallet, getDefaultProvider, ethers, AbiCoder, Interface } from 'ethers';
import Lock from '../artifacts/contracts/LockInit.sol/LockInit.json';
import Create2Deployer from '@axelar-network/axelar-gmp-sdk-solidity/artifacts/contracts/deploy/Create2Deployer.sol/Create2Deployer.json';
import {NETWORKS, Network } from '../config/networks';

const CREATE2_DEPLOYER_ADDR = '0x98b2920d53612483f91f12ed7754e51b4a77919e';

async function main() {
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
        throw new Error('Invalid private key. Make sure the PRIVATE_KEY environment variable is set.');
    }

    const initData = encodeInitData();
    const evmChains = getEvmChains();

    for (const chain of evmChains) {
        const wallet = new Wallet(privateKey);
        const provider = getDefaultProvider(chain.url);
        const connectedWallet = wallet.connect(provider);
        const deployerContract = new ethers.Contract(CREATE2_DEPLOYER_ADDR, Create2Deployer.abi, connectedWallet);

        // salt (make sure this salt has not been used already)
        const salt = ethers.toBeHex(217n, 32);
        const deployedAddr = await deployerContract.deployAndInit(Lock.bytecode, salt, initData);
        // console.log(deployedAddr);
        // const {logs} = await deployedAddr.wait();
        const receipt = await deployedAddr.wait();
        // console.log(logs);
        const abi = ["event Deployed(bytes32 indexed bytecodeHash, bytes32 indexed salt, address indexed deployedAddress)"]
        const iface = new Interface(abi);
        receipt.logs.forEach((log) => {
            const parsedLog = iface.parseLog(log);

            // console.log("Event: ", parsedLog!.name);
            // console.log("Event Arguments: ", parsedLog!.args);
            if (parsedLog) console.log(`${chain.chainId}, deployed address: ${parsedLog!.args.deployedAddress}`);
        });

        // console.log(`${chain.name}, address: ${receipt.log[0].args.deployedAddress}`);
        // console.log(`${chain.name}, address: ${logs[0].args[0]}`);
    }
}

function encodeInitData() {
    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    const unlockTime = currentTimestampInSeconds + 60;

    // Encode the function call
    const initFunction = 'initialize(uint256)';
    const coder = AbiCoder.defaultAbiCoder()
    const initData = coder.encode(['uint256'], [unlockTime]);
    const initSignature = ethers.id(initFunction).substring(0, 10);

    // Remove 0x
    return initSignature + initData.substring(2);
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
