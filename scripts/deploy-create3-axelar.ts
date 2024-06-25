import { Wallet, getDefaultProvider, ethers, AbiCoder, Interface} from 'ethers';
import Lock3 from '../artifacts/contracts/LockCreate3.sol/Lock3.json';
import Create3Deployer from '@axelar-network/axelar-gmp-sdk-solidity/artifacts/contracts/deploy/Create3Deployer.sol/Create3Deployer.json';
import { NETWORKS, Network } from '../config/networks';

const CREATE_3_DEPLOYER = '0x6513Aedb4D1593BA12e50644401D976aebDc90d8';

async function main() {
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
        throw new Error('Invalid private key. Make sure the PRIVATE_KEY environment variable is set.');
    }

    const currentTimestampInSeconds = Math.round(Date.now() / 1000); 
    const unlockTime = currentTimestampInSeconds + 60;
    const evmChains = getEvmChains();

    const eventABI = ["event Deployed(address indexed deployedAddress, address indexed sender, bytes32 indexed salt, bytes32 bytecodeHash)"];
    const iface = new Interface(eventABI);

    for (const chain of evmChains) {
        const wallet = new Wallet(privateKey);
        const provider = getDefaultProvider(chain.url);
        const connectedWallet = wallet.connect(provider);
        const deployerContract = new ethers.Contract(CREATE_3_DEPLOYER, Create3Deployer.abi, connectedWallet);
        const coder = AbiCoder.defaultAbiCoder()

        // salt (make sure this salt has not been used already)
        const salt = ethers.toBeHex(222n, 32);
        const creationCode = ethers.solidityPacked( ['bytes', 'bytes'], [Lock3.bytecode, coder.encode(['uint256', 'address'], [unlockTime+chain.chainId, wallet.address])] ); 
        const predictiondAddress = await deployerContract.deploy.staticCall(creationCode, salt); 
        console.log(`${chain.chainId}, prediction address: ${predictiondAddress}`);
        const deployedAddress = await deployerContract.deploy(creationCode, salt); 
        const receipt = await deployedAddress.wait();
        receipt.logs.forEach((log) => {
            const parsedLog = iface.parseLog(log);
            if (parsedLog) console.log(`${chain.chainId}, deployed address: ${parsedLog!.args.deployedAddress}`);
        });
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
